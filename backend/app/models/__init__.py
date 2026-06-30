"""SQLAlchemy model registry imports for Alembic metadata discovery."""

from app.models.audit_discussion_issue import AuditDiscussionIssue
from app.models.audit_entity import AuditEntity
from app.models.audit_entity_address import AuditEntityAddressType
from app.models.audit_entity_address import AuditEntityAddress
from app.models.audit_entity_business_activity import AuditEntityBusinessActivity
from app.models.audit_entity_contact import AuditEntityContactType
from app.models.audit_entity_contact import AuditEntityContact
from app.models.audit_entity_director import AuditEntityDirectorType
from app.models.audit_entity_director import AuditEntityDirector
from app.models.audit_entity_exchange_listing import AuditEntityExchangeListing
from app.models.audit_entity_facility import AuditEntityFacilityType
from app.models.audit_entity_facility import AuditEntityFacility
from app.models.audit_entity_financial_snapshot import AuditEntityFinancialSnapshot
from app.models.audit_entity_license import AuditEntityLicenseType
from app.models.audit_entity_license import AuditEntityLicense
from app.models.audit_entity_tax_assessment import AuditEntityTaxAssessment
from app.models.audit_master import AuditMaster
from app.models.audit_subject import AuditSubject
from app.models.audit_team import AuditTeam
from app.models.audit_team_member import AuditTeamMember
from app.models.audit_visit_info import AuditVisitInfo
from app.models.audit_visit_observation import AuditVisitObservation
from app.models.auditor_work_plan import AuditorWorkPlan
from app.models.branch import Branch
from app.models.business_discussion import BusinessDiscussion
from app.models.business_master import BusinessNature
from app.models.business_master import BusinessSector
from app.models.business_master import BusinessIndustry
from app.models.company import Company
from app.models.cooperation_agreement import CooperationAgreement
from app.models.department import Department
from app.models.designation import Designation
from app.models.employee import Employee
from app.models.general_discussion import GeneralDiscussion
from app.models.legal_status import LegalStatus
from app.models.meeting_master import MeetingMaster
from app.models.meeting_participant import MeetingParticipant
from app.models.meeting_report import MeetingReport
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission
from app.models.menu_permission import MenuPermission
from app.models.navigation_group import NavigationGroup
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_role import UserRole

__all__ = [
    "AuditDiscussionIssue",
    "AuditEntity",
    "AuditEntityAddressType",
    "AuditEntityAddress",
    "AuditEntityBusinessActivity",
    "AuditEntityContactType",
    "AuditEntityContact",
    "AuditEntityDirectorType",
    "AuditEntityDirector",
    "AuditEntityExchangeListing",
    "AuditEntityFacilityType",
    "AuditEntityFacility",
    "AuditEntityFinancialSnapshot",
    "AuditEntityLicenseType",
    "AuditEntityLicense",
    "AuditEntityTaxAssessment",
    "AuditMaster",
    "AuditSubject",
    "AuditTeam",
    "AuditTeamMember",
    "AuditVisitInfo",
    "AuditVisitObservation",
    "AuditorWorkPlan",
    "Branch",
    "BusinessDiscussion",
    "BusinessNature",
    "BusinessSector",
    "BusinessIndustry",
    "Company",
    "CooperationAgreement",
    "Department",
    "Designation",
    "Employee",
    "GeneralDiscussion",
    "LegalStatus",
    "MeetingMaster",
    "MeetingParticipant",
    "MeetingReport",
    "Menu",
    "MenuAction",
    "MenuActionPermission",
    "MenuPermission",
    "NavigationGroup",
    "Permission",
    "Role",
    "RolePermission",
    "User",
    "UserRole",
]
