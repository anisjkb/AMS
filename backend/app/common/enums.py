from enum import StrEnum

class ActiveStatus(StrEnum):
    ALL = "all"
    ACTIVE = "active"
    INACTIVE = "inactive"

class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AuditStatus(StrEnum):
    DRAFT = "draft"
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    FIELDWORK = "fieldwork"
    REVIEW = "review"
    COMPLETED = "completed"
    CLOSED = "closed"
    CANCELLED = "cancelled"

class AuditSubjectType(StrEnum):
    FIRM = "firm"
    PROJECT = "project"
    INCIDENT = "incident"
    BRANCH = "branch"
    DEPARTMENT = "department"
    PROCESS = "process"
    AUDIT_ENTITY = "audit_entity"

class AuditMemberType(StrEnum):
    INTERNAL = "internal"
    EXTERNAL = "external"
    CONSULTANT = "consultant"
    AUDITEE = "auditee"

class WorkflowDecision(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    RETURNED = "returned"
