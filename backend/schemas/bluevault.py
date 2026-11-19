from pydantic import BaseModel
from typing import Optional


class DocumentOut(BaseModel):
    id: str
    name: str | None
    folder: str | None
    file_type: str | None
    access: str

    model_config = {"from_attributes": True}


class DocumentCreate(BaseModel):
    name: str
    folder: str = "Finance / Vendor Bank Details"
    file_type: str = "FILE"
    access: str = "Restricted"


class StorageKeyOut(BaseModel):
    id: str
    owner: str | None
    scope: str | None
    expiry: str
    ip_restrict: str
    status: str

    model_config = {"from_attributes": True}


class StorageKeyCreate(BaseModel):
    owner: str
    scope: str = "read:all-folders"
    expiry: str = "90 days"
    ip_restrict: str = "10.20.0.0/16"


class StorageAccessLogOut(BaseModel):
    id: str
    principal: str | None
    path: str | None
    source_ip: str | None
    action: str | None

    model_config = {"from_attributes": True}
