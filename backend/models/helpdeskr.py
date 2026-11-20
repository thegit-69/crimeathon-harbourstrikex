from sqlalchemy import Column, String, DateTime, func
from db.base import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True)
    subject = Column(String, nullable=False)
    requester = Column(String)
    priority = Column(String, default="Normal")
    status = Column(String, default="Open")
    assigned_to = Column(String, default="Support Queue")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ExportJob(Base):
    __tablename__ = "export_jobs"

    id = Column(String, primary_key=True)
    actor = Column(String)
    caller_ip = Column(String)
    target = Column(String)
    status = Column(String, default="Completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HelpDeskAuditLog(Base):
    __tablename__ = "helpdeskr_audit_logs"

    id = Column(String, primary_key=True)
    ts = Column(DateTime(timezone=True), server_default=func.now())
    actor = Column(String)
    event = Column(String)
    object_ref = Column(String)
    result = Column(String, default="Success")
