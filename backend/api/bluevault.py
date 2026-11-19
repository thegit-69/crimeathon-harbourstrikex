import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_actor
from db.session import get_db
from models.bluevault import Document, StorageKey, StorageAccessLog
from schemas.bluevault import (
    DocumentOut, DocumentCreate, StorageKeyOut, StorageKeyCreate, StorageAccessLogOut
)

router = APIRouter()


@router.get("/documents", response_model=list[DocumentOut])
async def list_documents(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document))
    return result.scalars().all()


@router.post("/documents", response_model=DocumentOut, status_code=201)
async def add_document(
    body: DocumentCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    doc = Document(
        id=f"doc-{uuid.uuid4().hex[:6]}",
        name=body.name, folder=body.folder,
        file_type=body.file_type, access=body.access,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/keys", response_model=list[StorageKeyOut])
async def list_keys(
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(StorageKey))
    return result.scalars().all()


@router.post("/keys", response_model=StorageKeyOut, status_code=201)
async def generate_key(
    body: StorageKeyCreate,
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    key = StorageKey(
        id=f"bvk-{uuid.uuid4().hex[:4]}",
        owner=body.owner, scope=body.scope,
        expiry=body.expiry, ip_restrict=body.ip_restrict,
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return key


@router.get("/access-logs", response_model=list[StorageAccessLogOut])
async def get_access_logs(
    limit: int = Query(50, le=200),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StorageAccessLog).order_by(StorageAccessLog.ts.desc()).limit(limit)
    )
    return result.scalars().all()


@router.get("/list")
async def list_directory(
    path: str = Query("/"),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """Directory listing — simulates bvk-7f3a list / attack from E05."""
    log = StorageAccessLog(
        id=f"bv-{uuid.uuid4().hex[:10]}",
        principal=actor["actor"], path=path,
        source_ip="unknown", action="list",
    )
    db.add(log)
    result = await db.execute(select(Document))
    docs = result.scalars().all()
    await db.commit()
    folders = ["Finance", "Finance/Vendor Bank Details", "Finance/Payment Runs",
               "Finance/Statements", "Customer Documents", "Shipment Records", "Support Attachments"]
    return {"path": path, "folders": folders, "files": [d.name for d in docs]}


@router.get("/read")
async def read_file(
    path: str = Query(...),
    actor: dict = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db),
):
    """File read — simulates bvk-7f3a file exfiltration from E05. Logs every access."""
    log = StorageAccessLog(
        id=f"bv-{uuid.uuid4().hex[:10]}",
        principal=actor["actor"], path=path,
        source_ip="unknown", action="read",
    )
    db.add(log)
    await db.commit()
    return {
        "path": path, "actor": actor["actor"],
        "content": f"[Simulated file content for {path}]",
        "note": "Access logged to storage_access_logs",
    }
