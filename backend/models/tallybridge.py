from sqlalchemy import Column, String, DateTime, func
from db.base import Base


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True)
    owner = Column(String)
    scope = Column(String)
    expiry = Column(String, default="No expiry")
    ip_restrict = Column(String, default="Not restricted")
    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SyncJob(Base):
    __tablename__ = "sync_jobs"

    id = Column(String, primary_key=True)
    name = Column(String)
    target = Column(String)
    last_run = Column(String)
    status = Column(String, default="Completed")


class NetworkFlow(Base):
    __tablename__ = "network_flows"

    id = Column(String, primary_key=True)
    ts = Column(DateTime(timezone=True), server_default=func.now())
    src_ip = Column(String)
    dst_ip = Column(String)
    host_label = Column(String)
    bytes_sent = Column(String)
    endpoint = Column(String)
    verdict = Column(String, default="Allowed")
