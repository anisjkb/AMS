from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class GeneralDiscussionIssue(Base):
    __tablename__ = "general_discussion_issue"

    id = Column(Integer, primary_key=True, index=True)

    team_id = Column(Integer, ForeignKey("audit_teams.team_id"))
    audit_id = Column(Integer, ForeignKey("audit_master.audit_id"))

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    priority = Column(String(20), default="medium")
    status = Column(String(20), default="open")

    is_active = Column(Boolean, default=True)

    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())