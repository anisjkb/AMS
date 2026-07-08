from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func

from app.db.base import Base


class GeneralDiscussion(Base):
    __tablename__ = "general_discussion"

    id = Column(Integer, primary_key=True, index=True)

    audit_id = Column(Integer, nullable=True)
    audit_type = Column(String(150), nullable=False)

    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    decision = Column(Text, nullable=True)

    created_by = Column(Integer, nullable=True)
    status = Column(String(20), default="active")
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
