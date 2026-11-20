from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from models.ledgerone import Vendor, LedgerApiLog
from models.helpdeskr import Ticket, ExportJob
from models.bluevault import Document
from models.tallybridge import ApiKey

router = APIRouter()


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    vendors_total = (await db.execute(select(func.count()).select_from(Vendor))).scalar() or 0
    vendors_active = (await db.execute(
        select(func.count()).select_from(Vendor).where(Vendor.status == "Active")
    )).scalar() or 0

    open_tickets = (await db.execute(
        select(func.count()).select_from(Ticket).where(Ticket.status == "Open")
    )).scalar() or 0

    docs_total = (await db.execute(select(func.count()).select_from(Document))).scalar() or 0

    keys_active = (await db.execute(
        select(func.count()).select_from(ApiKey).where(ApiKey.status == "Active")
    )).scalar() or 0

    return {
        "open_tickets": open_tickets,
        "stored_documents": docs_total,
        "active_vendors": vendors_active,
        "total_vendors": vendors_total,
        "connected_integrations": keys_active,
        "integrations_attention": 2,  # key-tb-07 and bvk-7f3a — no IP/expiry
    }


@router.get("/activity")
async def get_activity(db: AsyncSession = Depends(get_db)):
    logs = (await db.execute(
        select(LedgerApiLog).order_by(LedgerApiLog.ts.desc()).limit(5)
    )).scalars().all()

    exports = (await db.execute(
        select(ExportJob).order_by(ExportJob.created_at.desc()).limit(3)
    )).scalars().all()

    activities = []
    for log in logs:
        activities.append({
            "app": "LedgerOne",
            "desc": f"{log.method} {log.endpoint} · {log.records_ret or 0} records",
            "actor": log.api_key_id,
            "ts": log.ts.isoformat() if log.ts else None,
        })
    for exp in exports:
        activities.append({
            "app": "HelpDeskr",
            "desc": f"Export job {exp.id} · {exp.target} · {exp.status}",
            "actor": exp.actor,
            "ts": exp.created_at.isoformat() if exp.created_at else None,
        })

    activities.sort(key=lambda x: x["ts"] or "", reverse=True)
    return activities[:10]


@router.get("/status")
async def get_system_status():
    return [
        {"name": "HelpDeskr",   "status": "Operational",        "badge": "ok"},
        {"name": "BlueVault",   "status": "Operational",        "badge": "ok"},
        {"name": "LedgerOne",   "status": "Operational",        "badge": "ok"},
        {"name": "TallyBridge", "status": "Attention required", "badge": "warn"},
        {"name": "Identity / SSO", "status": "Operational",     "badge": "ok"},
    ]
