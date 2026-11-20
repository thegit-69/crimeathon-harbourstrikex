from sqlalchemy import Column, String, DateTime, func
from db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    name = Column(String)
    folder = Column(String)
    file_type = Column(String)
    access = Column(String, default="Restricted")


class StorageKey(Base):
    __tablename__ = "storage_keys"

    id = Column(String, primary_key=True)
    owner = Column(String)
    scope = Column(String)
    expiry = Column(String, default="No expiry")
    ip_restrict = Column(String, default="Not restricted")
    status = Column(String, default="Active")


class StorageAccessLog(Base):
    __tablename__ = "storage_access_logs"

    id = Column(String, primary_key=True)
    ts = Column(DateTime(timezone=True), server_default=func.now())
    principal = Column(String)
    path = Column(String)
    source_ip = Column(String)
    action = Column(String)
