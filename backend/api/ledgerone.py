import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_actor
from db.session import get_db
from models.ledgerone import Vendor, BankDetailChange, Invoice, ScheduledPayment, LedgerApiLog
from schemas.ledgerone import (
    VendorOut, VendorCreate, BankDetailPatch, BankDetailChangeOut,
    InvoiceOut, InvoiceCreate, ScheduledPaymentOut, ScheduledPaymentCreate, LedgerApiLogOut
)

router = APIRouter()


def _req_id():
    return f"req-{uuid.uuid4().hex[:10]}"


def _chg_id():
    return f"chg-{uuid.uuid4().hex[:10]}"


@router.get("/me")
async def api_me(actor: dict = Depends(get_current_actor), db: AsyncSession = Depends(get_db)):
    """Key identity probe — mirrors E01 reconnaissance pattern."""
    if actor["type"] == "api_key":
        from models.tallybridge import ApiKey
        key = await db.get(ApiKey, actor["actor"])
        return {
            "key_id": actor["actor"],
            "scope": key.scope if key else "unknown",
            "type": "api_key",
            "request_id": _req_id(),
        }
    return {"actor": actor["actor"], "type": "user", "request_id": _req_id()}


@router.get("/schema")
async def api_schema(actor: dict = Depends(get_current_actor)):
    """Schema discovery endpoint — mirrors E01 recon."""
    return {
        "version": "v2",
        "endpoints": [
            "/api/v2/vendors", "/api/v2/vendors/{id}", "/api/v2/vendors/{id}/bank-details",
            "/api/v2/vendors/export", "/api/v2/invoices", "/api/v2/payments/scheduled",
            "/api/v2/payments/search", "/api/v2/vendors/change-history",
        ],
        "request_id": _req_id(),
    }


@router.get("/vendors", response_model=list[VendorOut])
async def list_vendors(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Vendor).order_by(Vendor.created_at.desc()))
    return result.scalars().all()


@router.post("/vendors", response_model=VendorOut, status_code=201)
async def create_vendor(
    body: VendorCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    vendor = Vendor(**body.model_dump())
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.get("/vendors/export")
async def export_vendors(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """Bulk vendor export — attack surface (no rate limit, no approval needed)."""
    result = await db.execute(select(Vendor))
    vendors = result.scalars().all()
    export_id = f"EXP-{9930 + int(uuid.uuid4().int % 70)}"
    req_id = _req_id()
    # Log the export
    log = LedgerApiLog(
        id=req_id, api_key_id=actor["actor"],
        method="GET", endpoint="/api/v2/vendors/export",
        status_code="200", records_ret=str(len(vendors)),
    )
    db.add(log)
    await db.commit()
    return {
        "export_id": export_id,
        "request_id": req_id,
        "records": len(vendors),
        "data": [{"id": v.id, "name": v.name, "bank_account": v.bank_account} for v in vendors],
    }


@router.get("/vendors/change-history", response_model=list[BankDetailChangeOut])
async def change_history(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BankDetailChange).order_by(BankDetailChange.changed_at.desc())
    )
    return result.scalars().all()


@router.get("/vendors/{vendor_id}", response_model=VendorOut)
async def get_vendor(
    vendor_id: str,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    vendor = await db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(404, f"Vendor {vendor_id} not found")
    return vendor


@router.get("/vendors/{vendor_id}/bank-details")
async def get_bank_details(
    vendor_id: str,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    vendor = await db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(404, "Vendor not found")
    return {"vendor_id": vendor_id, "bank_account": vendor.bank_account, "request_id": _req_id()}


@router.patch("/vendors/{vendor_id}/bank-details")
async def update_bank_details(
    vendor_id: str,
    body: BankDetailPatch,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """
    Update vendor bank account.
    INTENTIONAL CONTROL GAP: approval_ref is optional and not enforced.
    This mirrors the attack from Case CR-26-047 (chg-8b9888c39b).
    """
    vendor = await db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(404, "Vendor not found")

    chg_id = _chg_id()
    req_id = _req_id()

    change = BankDetailChange(
        id=chg_id,
        vendor_id=vendor_id,
        actor=actor["actor"],
        old_account=vendor.bank_account,
        new_account=body.new_account,
        approval_ref=body.approval_ref,  # NULL = attack scenario
        request_id=req_id,
    )
    vendor.bank_account = body.new_account
    db.add(change)

    # Log to API log
    log = LedgerApiLog(
        id=req_id, api_key_id=actor["actor"],
        caller_ip=body.caller_ip, user_agent=body.user_agent,
        method="PATCH", endpoint=f"/api/v2/vendors/{vendor_id}/bank-details",
        status_code="200", records_ret="1",
    )
    db.add(log)
    await db.commit()

    return {
        "change_id": chg_id,
        "request_id": req_id,
        "vendor_id": vendor_id,
        "new_account": body.new_account,
        "approval_ref": body.approval_ref,
        "warning": None if body.approval_ref else "No approval reference recorded",
    }


@router.get("/invoices", response_model=list[InvoiceOut])
async def list_invoices(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Invoice))
    return result.scalars().all()


@router.post("/invoices", response_model=InvoiceOut, status_code=201)
async def create_invoice(
    body: InvoiceCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    inv_id = body.id or f"INV-{9090 + int(uuid.uuid4().int % 50)}"
    inv = Invoice(id=inv_id, vendor=body.vendor, amount=body.amount, due_date=body.due_date)
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    return inv


@router.get("/payments/scheduled", response_model=list[ScheduledPaymentOut])
async def list_scheduled_payments(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """Attacker used this to verify the Sep 8 payment run (req-33a3928eca, req-bb819dfe0c)."""
    result = await db.execute(select(ScheduledPayment))
    return result.scalars().all()


@router.post("/payments/scheduled", response_model=ScheduledPaymentOut, status_code=201)
async def schedule_payment(
    body: ScheduledPaymentCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    pay = ScheduledPayment(
        id=f"PAY-{uuid.uuid4().hex[:8].upper()}",
        vendor_id=body.vendor_id,
        vendor=body.vendor,
        amount=body.amount,
        pay_date=body.pay_date,
    )
    db.add(pay)
    await db.commit()
    await db.refresh(pay)
    return pay


@router.get("/payments/search")
async def search_payments(
    vendor_id: Optional[str] = Query(None),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """Payment search — attack surface used to enumerate targets (E01)."""
    q = select(ScheduledPayment)
    if vendor_id:
        q = q.where(ScheduledPayment.vendor_id == vendor_id)
    result = await db.execute(q)
    payments = result.scalars().all()
    return {"records": len(payments), "request_id": _req_id(), "data": [
        {"id": p.id, "vendor": p.vendor, "amount": p.amount, "pay_date": p.pay_date}
        for p in payments
    ]}


@router.get("/logs", response_model=list[LedgerApiLogOut])
async def get_logs(
    limit: int = Query(50, le=200),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LedgerApiLog).order_by(LedgerApiLog.ts.desc()).limit(limit)
    )
    return result.scalars().all()
