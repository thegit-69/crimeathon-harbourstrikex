import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_actor
from db.session import get_db
from models.tallybridge import ApiKey, SyncJob, NetworkFlow
from models.ledgerone import LedgerApiLog
from models.helpdeskr import ExportJob
from schemas.tallybridge import (
    ApiKeyOut, ApiKeyCreate, SyncJobOut, SyncJobCreate, NetworkFlowOut
)

router = APIRouter()


@router.get("/keys", response_model=list[ApiKeyOut])
async def list_keys(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ApiKey).order_by(ApiKey.created_at.desc()))
    return result.scalars().all()


@router.post("/keys", response_model=ApiKeyOut, status_code=201)
async def create_key(
    body: ApiKeyCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    key = ApiKey(
        id=f"key-tb-{int(uuid.uuid4().int % 90) + 10:02d}",
        owner=body.owner, scope=body.scope,
        expiry=body.expiry, ip_restrict=body.ip_restrict,
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return key


@router.get("/service-accounts")
async def list_service_accounts():
    return [
        {"id": "tb-sync-svc",      "owner_team": "Finance IT",   "purpose": "Vendor and ticket sync",  "last_used": "19 Nov 08:30", "status": "Active"},
        {"id": "bv-archive-svc",   "owner_team": "IT Operations","purpose": "Document archive",        "last_used": "19 Nov 02:00", "status": "Active"},
        {"id": "legacy-export-svc","owner_team": "Support Ops",  "purpose": "Legacy exports",          "last_used": "11 Jan 2025",  "status": "Disabled"},
    ]


@router.get("/connected-apps")
async def list_connected_apps():
    return [
        {"app": "LedgerOne",  "env": "Production",   "account": "tb-sync-svc",   "permissions": "Vendor read/write",  "status": "Connected"},
        {"app": "HelpDeskr",  "env": "Production",   "account": "tb-sync-svc",   "permissions": "Ticket sync",        "status": "Connected"},
        {"app": "BlueVault",  "env": "Production",   "account": "bv-archive-svc","permissions": "Document read",      "status": "Connected"},
        {"app": "Build Host", "env": "Internal lab", "account": "build-agent-02","permissions": "Deploy metadata",    "status": "Review"},
    ]


@router.get("/permissions")
async def list_permissions(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ApiKey))
    keys = result.scalars().all()
    return [
        {
            "principal": k.id, "owner": k.owner,
            "scope": k.scope, "expiry": k.expiry,
            "ip_restrict": k.ip_restrict, "status": k.status,
            "risk": "Over-privileged" if k.ip_restrict == "Not restricted" else "Review",
        }
        for k in keys
    ]


@router.get("/sync-jobs", response_model=list[SyncJobOut])
async def list_sync_jobs(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SyncJob).order_by(SyncJob.id.desc()))
    return result.scalars().all()


@router.post("/sync-jobs", response_model=SyncJobOut, status_code=201)
async def trigger_sync(
    body: SyncJobCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    job = SyncJob(
        id=f"SYNC-{8825 + int(uuid.uuid4().int % 100000)}",
        name=body.name, target=body.target,
        last_run=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        status="Completed",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


@router.get("/network-flows", response_model=list[NetworkFlowOut])
async def list_network_flows(
    limit: int = Query(50, le=500),
    host: str = Query(None),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    q = select(NetworkFlow).order_by(NetworkFlow.ts.desc()).limit(limit)
    if host:
        q = q.where(NetworkFlow.host_label == host)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/api-activity")
async def get_api_activity(
    limit: int = Query(20, le=100),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """Aggregated API activity across all systems."""
    ledger_logs = (await db.execute(
        select(LedgerApiLog).order_by(LedgerApiLog.ts.desc()).limit(limit)
    )).scalars().all()

    export_jobs = (await db.execute(
        select(ExportJob).order_by(ExportJob.created_at.desc()).limit(limit)
    )).scalars().all()

    activities = []
    for log in ledger_logs:
        activities.append({
            "system": "LedgerOne", "actor": log.api_key_id,
            "method": log.method, "endpoint": log.endpoint,
            "status": log.status_code, "ts": log.ts.isoformat() if log.ts else None,
        })
    for exp in export_jobs:
        activities.append({
            "system": "HelpDeskr", "actor": exp.actor,
            "method": "POST", "endpoint": "/api/v1/support/exports",
            "status": "202", "ts": exp.created_at.isoformat() if exp.created_at else None,
        })

    activities.sort(key=lambda x: x["ts"] or "", reverse=True)
    return activities[:limit]
