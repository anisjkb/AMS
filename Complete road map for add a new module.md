ভাই, ঠিক আছে ✅ আমি AMS-এর current working checkpoint এইভাবে ধরে রাখছি:

## AMS Current Checkpoint — C25.3 Meeting Type

**Branch:** `c25-3-meeting-type`
**Latest module:** `Meeting Type`
**Purpose:** `meeting_type` master table তৈরি করে Meeting Master-এর `Meeting Type` dropdown dynamic করা, সাথে `meeting_name` field add করা।

Latest confirmed DB check অনুযায়ী `menus` table-এ `path` না, `route_path` column আছে; existing Meeting modules parent `parent_menu_id = 31`, `navigation_group_id = 8`, আর Meeting Type permission/menu row initially missing ছিল। 

---

# নতুন Module Add করার Sequential Checklist

নতুন কোনো module add করতে হলে AMS project-এ full sequence হবে এইটা:

## 1. Requirement Freeze

প্রথমে module-এর exact scope define করতে হবে:

```text
Module name
DB table name
Fields
CRUD লাগবে কিনা
Dropdown source হবে কিনা
Parent menu কোথায় যাবে
Permission key কী হবে
Frontend route কী হবে
```

Example:

```text
Module: Meeting Type
Table: meeting_type
Route: /audit-meetings/types
Menu Parent: Audit → Audit Operation → Meeting
Permission Resource Key: meeting_type
```

---

## 2. Backend Database Model

Add করতে হবে:

```text
backend/app/models/<module>.py
```

Example:

```text
backend/app/models/meeting_type.py
```

Meeting Type-এর জন্য করা হয়েছিল:

```text
meeting_type_id
meeting_type_name
description
status
is_active
created_by
updated_by
created_at
updated_at
```

তারপর model export করতে হবে:

```text
backend/app/models/__init__.py
```

---

## 3. Backend Schema

Add করতে হবে:

```text
backend/app/schemas/<module>.py
```

Example:

```text
backend/app/schemas/meeting_type.py
```

Usually থাকবে:

```text
Create Schema
Update Schema
Read/Response Schema
List Response Schema
Message Response Schema
```

---

## 4. Backend Repository

Add করতে হবে:

```text
backend/app/repositories/<module>_repository.py
```

Example:

```text
backend/app/repositories/meeting_type_repository.py
```

Repository handles:

```text
list
get by id
get by name/code
create
update
soft delete / inactive
restore
permanent delete
```

---

## 5. Backend Service

Add করতে হবে:

```text
backend/app/services/<module>/<module>_service.py
```

Example:

```text
backend/app/services/meeting_type/meeting_type_service.py
```

Service handles business logic:

```text
duplicate check
create response message
update validation
inactive/restore logic
permanent delete
```

Meeting Type issue এখানে হয়েছিল: API router initially `created_by` / `updated_by` পাঠাচ্ছিল, কিন্তু service `username` parameter accept করত। পরে fix করা হয়েছে:

```text
created_by=current_user.user_id ❌
updated_by=current_user.user_id ❌

username=str(current_user.user_id) ✅
```

---

## 6. Backend API Router

Add করতে হবে:

```text
backend/app/api/v1/<module>.py
```

Example:

```text
backend/app/api/v1/meeting_type.py
```

Endpoints:

```text
GET /api/v1/meeting-type
GET /api/v1/meeting-type/{id}
POST /api/v1/meeting-type
PATCH /api/v1/meeting-type/{id}
DELETE /api/v1/meeting-type/{id}
PATCH /api/v1/meeting-type/{id}/restore
DELETE /api/v1/meeting-type/{id}/permanent
```

Then include in main router:

```text
backend/app/api/v1/router.py
```

---

## 7. Alembic Migration

Add migration:

```text
backend/alembic/versions/<revision>_<module>.py
```

Example:

```text
backend/alembic/versions/c253_meeting_type.py
```

Meeting Type migration did:

```text
Create meeting_type table
Seed meeting types from old meeting_master.meeting_type values
Add meeting_name to meeting_master
Add meeting_type_id to meeting_master
Backfill meeting_type_id
Add FK from meeting_master.meeting_type_id → meeting_type.meeting_type_id
```

Then run:

```powershell
Set-Location "E:\Audit\AMS\backend"

alembic upgrade head
alembic current
alembic heads
```

Expected:

```text
current == head
```

---

## 8. Backend Compile Check

Always run:

```powershell
Set-Location "E:\Audit\AMS\backend"

python -m compileall app
```

If compile fails, fix backend before touching frontend.

---

## 9. Frontend Service

Add frontend API service:

```text
frontend/src/services/<module>.ts
```

Example:

```text
frontend/src/services/meetingType.ts
```

Functions:

```text
listMeetingTypes
createMeetingType
updateMeetingType
deactivateMeetingType
restoreMeetingType
permanentDeleteMeetingType
```

API proxy route used:

```text
/api/backend/meeting-type
```

---

## 10. Frontend Page

Add route/page:

```text
frontend/src/app/(protected)/<section>/<module>/page.tsx
```

Example:

```text
frontend/src/app/(protected)/audit-meetings/types/page.tsx
```

AMS UX rule এখন থেকে:

```text
Every CRUD/Master page must follow same UX:
CrudToolbar
Dark header
Standard table
CrudDrawer
Save & Close
Save & Add Another
Confirm modal
Active/Inactive status filter
Restore + Permanent Delete for inactive records
```

Meeting Type page initially simple ছিল, পরে standard CRUD UX করা হয়েছে.

---

## 11. Add Module to Related Existing Pages

যদি নতুন module অন্য page-এ dropdown/reference হিসেবে লাগে, সেই page update করতে হবে।

Meeting Type-এর ক্ষেত্রে updated:

```text
Meeting Master drawer
Meeting Master table
Meeting Master payload
Meeting Master dropdown source
```

Added:

```text
Meeting Type dropdown
Meeting Name field
Separate table columns:
- Meeting Name
- Meeting Type
- Created
```

---

## 12. Frontend Lint + Build

Always run:

```powershell
Set-Location "E:\Audit\AMS\frontend"

npm run lint
npm run build
```

Only commit after successful build.

---

## 13. Browser API Test

Test manually in browser:

```text
Open page directly
List loads
Create works
Edit works
Inactive works
Inactive filter shows record
Restore works
Permanent Delete works
Dropdown works in related module
```

Meeting Type tested:

```text
PATCH /api/v1/meeting-type/4 → 200 OK
DELETE /api/v1/meeting-type/1 → 200 OK
POST /api/v1/meeting-type → 201 Created
```

---

# Permission + Menu Seed Checklist

For every new module, permission/menu seed must include these.

## 14. Permissions

Create permissions:

```text
menu.<module>.view

api.<module>.view
api.<module>.create
api.<module>.update
api.<module>.delete
api.<module>.restore
api.<module>.permanent_delete

button.<module>.view
button.<module>.create
button.<module>.update
button.<module>.delete
button.<module>.restore
button.<module>.permanent_delete
button.<module>.export
button.<module>.import
```

Meeting Type example:

```text
menu.meeting_type.view
api.meeting_type.view
api.meeting_type.create
api.meeting_type.update
api.meeting_type.delete
api.meeting_type.restore
api.meeting_type.permanent_delete
button.meeting_type.create
button.meeting_type.update
button.meeting_type.delete
button.meeting_type.restore
button.meeting_type.permanent_delete
button.meeting_type.export
button.meeting_type.import
```

---

## 15. Menu Row

Create row in `menus`.

Meeting Type exact values:

```text
navigation_group_id: 8
parent_menu_id: 31
menu_key: meeting_type
menu_title: Meeting Type
route_path: /audit-meetings/types
icon: Tags
permission_key: menu.meeting_type.view
sort_order: 15
menu_level: 3
is_expandable: false
is_visible: true
is_active: true
```

Important: AMS uses `route_path`, **not** `path`.

---

## 16. Menu Permission Mapping

Create mapping in:

```text
menu_permissions
```

For Meeting Type:

```text
menu_id = Meeting Type menu id
permission_id = menu.meeting_type.view permission id
```

---

## 17. Menu Actions

Create in:

```text
menu_actions
```

For Meeting Type:

```text
Create → button.meeting_type.create
Edit → button.meeting_type.update
Inactive → button.meeting_type.delete
Restore → button.meeting_type.restore
Permanent Delete → button.meeting_type.permanent_delete
Export → button.meeting_type.export
Import → button.meeting_type.import
```

---

## 18. Role Permissions

Assign all module permissions to the required role.

For current dev/admin role:

```text
role_id = 1
```

Assign all Meeting Type permissions to role `1`.

---

## 19. Sidebar Verify

After seed:

```text
Logout → Login again
```

or hard refresh:

```text
Ctrl + Shift + R
```

Expected:

```text
Audit → Audit Operation → Meeting → Meeting Type
```

---

# Git Workflow Checklist

## 20. Check status

```powershell
Set-Location "E:\Audit\AMS"

git status --short
```

## 21. Add files carefully

Example:

```powershell
git add `
  "backend/app/models/meeting_type.py" `
  "backend/app/schemas/meeting_type.py" `
  "backend/app/repositories/meeting_type_repository.py" `
  "backend/app/services/meeting_type/meeting_type_service.py" `
  "backend/app/api/v1/meeting_type.py" `
  "backend/app/api/v1/router.py" `
  "backend/app/models/__init__.py" `
  "backend/alembic/versions/c253_meeting_type.py" `
  "frontend/src/services/meetingType.ts" `
  "frontend/src/app/(protected)/audit-meetings/types/page.tsx"
```

## 22. Commit in logical chunks

Best pattern:

```text
Commit 1: backend module + migration
Commit 2: frontend page/service
Commit 3: related module integration
Commit 4: permission/menu seed
Commit 5: bugfix/polish
```

Meeting Type known commits included:

```text
5944e05 feat: add meeting type master module
5cbf19c feat: add meeting type frontend page
b4fb23e fix: restore meeting master ui structure
240a2d1 fix: remove unsupported meeting type status filter
84678e3 fix: add meeting type column to meeting master table
```

Later fixes included:

```text
fix: align meeting type audit username parameter
fix: improve meeting type inactive restore flow
```

## 23. Push

```powershell
git push
```

## 24. Final clean check

```powershell
git status --short
```

Expected:

```text
clean
```

---

# Meeting Type — What We Did Sequentially

## Phase A — Backend

1. Created `meeting_type` model.
2. Created schemas.
3. Created repository.
4. Created service.
5. Created API router.
6. Registered router in main API router.
7. Created Alembic migration.
8. Migration created `meeting_type` table.
9. Migration added `meeting_type_id` and `meeting_name` into `meeting_master`.
10. Migration backfilled old meeting type text into new table/reference.
11. Ran backend compile.
12. Fixed API/service mismatch.

---

## Phase B — Frontend

1. Created `meetingType.ts` service.
2. Created `/audit-meetings/types` page.
3. Reworked page into standard AMS CRUD UX.
4. Added Active/Inactive status filter.
5. Added drawer form.
6. Added save modes.
7. Added confirm modal.
8. Added restore/permanent delete flow.
9. Fixed inactive flow so inactive records can be restored/deleted.
10. Ran lint/build.

---

## Phase C — Meeting Master Integration

1. Added Meeting Type dropdown.
2. Added Meeting Name field.
3. Updated table columns.
4. Added `Meeting Type` column.
5. Kept `Created` column.
6. Fixed Meeting Master UI after accidental overwrite.
7. Verified dropdown loads from `/api/v1/meeting-type`.

---

## Phase D — Permission/Menu

1. Checked existing menu schema.
2. Found AMS uses `route_path`, not `path`.
3. Found Meeting parent:

```text
parent_menu_id = 31
navigation_group_id = 8
```

4. Found Meeting Type permission/menu rows missing.
5. Prepared seed for:

```text
permissions
menus
menu_permissions
menu_actions
role_permissions
```

6. Expected sidebar target:

```text
Audit → Audit Operation → Meeting → Meeting Type
```

---

# Golden Rule for Next Modules

নতুন module add করার সময় এই order follow করব:

```text
1. Requirement
2. DB model
3. Schema
4. Repository
5. Service
6. API router
7. Main router include
8. Migration
9. Alembic upgrade
10. Backend compile
11. Frontend service
12. Frontend page with standard CRUD UX
13. Related module integration
14. Permission seed
15. Menu seed
16. Role permission seed
17. Lint/build
18. Browser test
19. Commit
20. Push
```

এই sequence follow করলে আগের মতো half-done module, missing sidebar, permission mismatch, or API/service keyword mismatch হবে না ✅
