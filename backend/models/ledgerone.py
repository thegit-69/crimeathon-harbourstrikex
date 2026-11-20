from sqlalchemy import Column, String, DateTime, func
from db.base import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    bank_account = Column(String)
    status = Column(String, default="Active")
    approval = Column(String, default="Pending review")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BankDetailChange(Base):
    __tablename__ = "bank_detail_changes"

    id = Column(String, primary_key=True)
    vendor_id = Column(String, nullable=False)
    actor = Column(String)
    old_account = Column(String)
    new_account = Column(String)
    approval_ref = Column(String, nullable=True)   # NULL = not recorded (attack indicator)
    request_id = Column(String)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True)
    vendor_id = Column(String)
    vendor = Column(String)
    amount = Column(String)
    due_date = Column(String)
    status = Column(String, default="Awaiting approval")


class ScheduledPayment(Base):
    __tablename__ = "scheduled_payments"

    id = Column(String, primary_key=True)
    vendor_id = Column(String)
    vendor = Column(String)
    amount = Column(String)
    pay_date = Column(String)
    status = Column(String, default="Scheduled")


class LedgerApiLog(Base):
    __tablename__ = "ledger_api_logs"

    id = Column(String, primary_key=True)
    ts = Column(DateTime(timezone=True), server_default=func.now())
    api_key_id = Column(String)
    caller_ip = Column(String)
    user_agent = Column(String)
    method = Column(String)
    endpoint = Column(String)
    status_code = Column(String)
    records_ret = Column(String)
