from pydantic import BaseModel
from typing import Optional


class VendorOut(BaseModel):
    id: str
    name: str
    bank_account: str
    status: str
    approval: str

    model_config = {"from_attributes": True}


class VendorCreate(BaseModel):
    id: str
    name: str
    bank_account: str = "•••• 0000"


class BankDetailPatch(BaseModel):
    new_account: str
    approval_ref: Optional[str] = None   # NULL = attack scenario (no enforcement)
    actor: Optional[str] = "finance.user"
    caller_ip: Optional[str] = "172.16.8.31"
    user_agent: Optional[str] = "HF-Portal/5.2"


class BankDetailChangeOut(BaseModel):
    id: str
    vendor_id: str
    actor: str | None
    old_account: str | None
    new_account: str | None
    approval_ref: str | None
    request_id: str | None

    model_config = {"from_attributes": True}


class InvoiceOut(BaseModel):
    id: str
    vendor: str
    amount: str
    due_date: str
    status: str

    model_config = {"from_attributes": True}


class InvoiceCreate(BaseModel):
    id: Optional[str] = None
    vendor: str
    amount: str
    due_date: str


class ScheduledPaymentOut(BaseModel):
    id: str
    vendor: str
    amount: str
    pay_date: str
    status: str

    model_config = {"from_attributes": True}


class ScheduledPaymentCreate(BaseModel):
    vendor_id: str
    vendor: str
    amount: str
    pay_date: str


class LedgerApiLogOut(BaseModel):
    id: str
    api_key_id: str | None
    caller_ip: str | None
    method: str | None
    endpoint: str | None
    status_code: str | None
    records_ret: str | None

    model_config = {"from_attributes": True}
