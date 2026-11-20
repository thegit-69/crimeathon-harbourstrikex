from pydantic import BaseModel
from typing import Optional


class ApiKeyOut(BaseModel):
    id: str
    owner: str | None
    scope: str | None
    expiry: str
    ip_restrict: str
    status: str

    model_config = {"from_attributes": True}


class ApiKeyCreate(BaseModel):
    owner: str
    scope: str = "read:write all-modules"
    expiry: str = "90 days"
    ip_restrict: str = "10.20.4.0/24"


class SyncJobOut(BaseModel):
    id: str
    name: str | None
    target: str | None
    last_run: str | None
    status: str

    model_config = {"from_attributes": True}


class SyncJobCreate(BaseModel):
    name: str = "Manual ad-hoc sync"
    target: str = "Enterprise Bus"


class NetworkFlowOut(BaseModel):
    id: str
    src_ip: str | None
    dst_ip: str | None
    host_label: str | None
    bytes_sent: str | None
    endpoint: str | None
    verdict: str

    model_config = {"from_attributes": True}
