import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_actor
from db.session import get_db
from models.helpdeskr import Ticket, ExportJob, HelpDeskAuditLog
from schemas.helpdeskr import (
    TicketOut, TicketCreate, TicketStatusUpdate,
    ExportJobOut, ExportJobCreate, HelpDeskAuditLogOut
)

router = APIRouter()


@router.get("/tickets", response_model=list[TicketOut])
async def list_tickets(
    search: str = Query(None),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    q = select(Ticket).order_by(Ticket.created_at.desc())
    result = await db.execute(q)
    tickets = result.scalars().all()
    if search:
        s = search.lower()
        tickets = [t for t in tickets if s in (t.subject or "").lower()
                   or s in (t.requester or "").lower() or s in (t.id or "").lower()]
    return tickets


@router.post("/tickets", response_model=TicketOut, status_code=201)
async def create_ticket(
    body: TicketCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    ticket = Ticket(
        id=f"HD-{2050 + int(uuid.uuid4().int % 50)}",
        subject=body.subject,
        requester=body.requester,
        priority=body.priority,
        assigned_to=body.assigned_to,
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.patch("/tickets/{ticket_id}", response_model=TicketOut)
async def update_ticket_status(
    ticket_id: str,
    body: TicketStatusUpdate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    ticket.status = body.status
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.get("/exports", response_model=list[ExportJobOut])
async def list_exports(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ExportJob).order_by(ExportJob.created_at.desc()))
    return result.scalars().all()


@router.post("/exports", response_model=ExportJobOut, status_code=201)
async def create_export(
    body: ExportJobCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """Bulk export — attack surface. No rate limit. Logs actor and IP."""
    export = ExportJob(
        id=f"EXP-{5420 + int(uuid.uuid4().int % 500)}",
        actor=actor["actor"],
        caller_ip=body.caller_ip,
        target=body.target,
        status="Completed",
    )
    db.add(export)
    # Audit log
    audit = HelpDeskAuditLog(
        id=f"evt-{uuid.uuid4().hex[:10]}",
        actor=actor["actor"],
        event="export.create",
        object_ref=export.id,
        result="Success",
    )
    db.add(audit)
    await db.commit()
    await db.refresh(export)
    return export


@router.delete("/exports/{export_id}", status_code=204)
async def delete_export(
    export_id: str,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """Anti-forensics pattern from E02 — attacker deleted EXP-5419 (failed with timeout)."""
    export = await db.get(ExportJob, export_id)
    if not export:
        raise HTTPException(404, "Export job not found")
    audit = HelpDeskAuditLog(
        id=f"evt-{uuid.uuid4().hex[:10]}",
        actor=actor["actor"],
        event="export.delete",
        object_ref=export_id,
        result="Success",
    )
    db.add(audit)
    await db.delete(export)
    await db.commit()


@router.get("/audit", response_model=list[HelpDeskAuditLogOut])
async def get_audit_log(
    limit: int = Query(50, le=200),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(HelpDeskAuditLog).order_by(HelpDeskAuditLog.ts.desc()).limit(limit)
    )
    return result.scalars().all()
