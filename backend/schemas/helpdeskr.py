from pydantic import BaseModel
from typing import Optional


class TicketOut(BaseModel):
    id: str
    subject: str
    requester: str | None
    priority: str
    status: str
    assigned_to: str | None

    model_config = {"from_attributes": True}


class TicketCreate(BaseModel):
    subject: str
    requester: str
    priority: str = "Normal"
    assigned_to: str = "Support Queue"


class TicketStatusUpdate(BaseModel):
    status: str


class ExportJobOut(BaseModel):
    id: str
    actor: str | None
    caller_ip: str | None
    target: str | None
    status: str

    model_config = {"from_attributes": True}


class ExportJobCreate(BaseModel):
    target: str = "All tickets"
    actor: Optional[str] = "tb-sync-svc"
    caller_ip: Optional[str] = "198.18.7.41"


class HelpDeskAuditLogOut(BaseModel):
    id: str
    actor: str | None
    event: str | None
    object_ref: str | None
    result: str

    model_config = {"from_attributes": True}
