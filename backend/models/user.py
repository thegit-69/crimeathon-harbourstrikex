from sqlalchemy import Column, String
from db.base import Base


class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="staff")
    full_name = Column(String)
    status = Column(String, default="active")
