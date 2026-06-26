নিচে AMS **Security Part full-cycle testing guideline** দিলাম। এটা follow করলে তুমি first থেকে last পর্যন্ত পুরো RBAC/security system test করতে পারবে।

# AMS Security Full Cycle Testing Guideline

## Phase 0 — Safety Rules

প্রথমে ৩টা rule follow করো:

```text
1. Super Admin role/user কখনো delete বা permission remove করবা না।
2. Testing-এর জন্য আলাদা role/user বানাবে।
3. Permission change করার পর Logout → Login করবে, কারণ navigation cache fresh হবে।
```

Recommended test data:

```text
Role 1: QA Viewer
Role 2: QA Creator
Role 3: QA No Access

User 1: qa.viewer
User 2: qa.creator
User 3: qa.noaccess
```

---

# Phase 1 — Server & Build Check

## 1. Backend compile

```powershell
cd E:\Audit\AMS\backend
python -m compileall app
```

Expected:

```text
No error
```

## 2. Backend run

```powershell
cd E:\Audit\AMS\backend
uvicorn main:app --reload
```

Expected:

```text
Application startup complete.
```

## 3. Frontend lint/build

```powershell
cd E:\Audit\AMS\frontend
npm run lint
npm run build
```

Expected:

```text
✓ Compiled successfully
✓ Finished TypeScript
```

---

# Phase 2 — Login & Navigation Test

## Test 2.1 — Super Admin login

Login করো Super Admin দিয়ে।

Expected sidebar:

```text
Dashboard
Organization
Security
```

Security-এর নিচে এগুলো থাকবে:

```text
Roles
Permissions
Users
Role Permissions
Menu Permissions
Menu Action Permissions
User Roles
```

## Test 2.2 — Navigation cache test

Security menu গুলোতে click করো:

```text
Roles → Permissions → Users → Role Permissions → Menu Permissions → Menu Action Permissions → User Roles
```

Backend log check করো।

Expected:

```text
Login/hard refresh করলে /api/v1/me/navigation একবার call হবে
Menu click করলে বারবার /api/v1/me/navigation call হবে না
```

যদি প্রতিবার menu click করলে `/me/navigation` call হয়, তাহলে `NavigationContext` cache বা layout remount issue আছে।

---

# Phase 3 — Roles Page Test

URL:

```text
/security/roles
```

## Test 3.1 — Role create

Create করো:

```text
Role Name: QA Viewer
Description: Can view selected modules only

Role Name: QA Creator
Description: Can view and create selected modules

Role Name: QA No Access
Description: Has no permission
```

Expected:

```text
Role created successfully
Table refresh হবে
```

## Test 3.2 — Duplicate role test

আবার same role create করার চেষ্টা করো:

```text
QA Viewer
```

Expected:

```text
Duplicate/Already exists error
```

## Test 3.3 — Role edit

`QA Viewer` edit করে description update করো।

Expected:

```text
Role updated successfully
```

## Test 3.4 — Role search/filter/pagination

Check করো:

```text
Search: QA
Status: Active / Inactive / All
Page size: 10 / 20 / All
```

Expected:

```text
Correct filtered result দেখাবে
```

---

# Phase 4 — Permissions Page Test

URL:

```text
/security/permissions
```

## Test 4.1 — Permission master list check

Search করে check করো important permissions আছে কিনা:

```text
menu.company.view
api.company.create
api.company.update
api.company.delete

menu.role_permission.view
api.role_permission.assign
api.role_permission.remove

menu.user_role.view
api.user_role.assign
api.user_role.remove

menu.menu_permission.view
api.menu_permission.assign
api.menu_permission.remove

menu.menu_action_permission.view
api.menu_action_permission.assign
api.menu_action_permission.remove
```

Expected:

```text
সব permission active থাকবে
```

## Test 4.2 — Permission create test

Testing-এর জন্য optional permission create করতে পারো:

```text
permission_key: test.permission.view
resource_type: test
resource_key: permission
action: view
description: Test permission only
```

Expected:

```text
Permission created successfully
```

## Important

Permissions page হলো **master permission list**।
এখান থেকে permission তৈরি হয়, কিন্তু role/user directly access পায় না। Access দিতে হলে Role Permissions page ব্যবহার করতে হবে।

---

# Phase 5 — Role Permissions Test

URL:

```text
/security/role-permissions
```

এই page দিয়ে role-কে permission assign করা হয়।

## Test 5.1 — QA Viewer role permission setup

Role select করো:

```text
QA Viewer
```

Assign করো:

```text
menu.company.view
```

যদি list API permission আলাদা থাকে, assign করো:

```text
api.company.view
api.company.list
```

তোমার system-এ exact key যেটা আছে সেটা use করবে।

Expected:

```text
Permission assigned to role successfully
Assigned permission table refresh হবে
```

## Test 5.2 — QA Creator role permission setup

Role select করো:

```text
QA Creator
```

Assign করো:

```text
menu.company.view
api.company.create
api.company.update
```

Button permission থাকলে assign করো:

```text
button.company.create
button.company.update
```

Expected:

```text
QA Creator company menu দেখতে পারবে এবং create/update button দেখতে পারবে
```

## Test 5.3 — QA No Access role setup

Role select করো:

```text
QA No Access
```

কোন permission assign করো না।

Expected:

```text
এই role login করলে protected menu দেখাবে না বা খুব limited দেখাবে
```

## Test 5.4 — Duplicate assignment test

Same permission আবার same role-এ assign করো।

Expected:

```text
Duplicate row create হবে না
Existing inactive হলে reactivate হবে
```

## Test 5.5 — Remove permission test

QA Viewer থেকে একটা permission remove করো।

Expected:

```text
Permission removed from role successfully
Table থেকে permission চলে যাবে
```

---

# Phase 6 — Users Page Test

URL:

```text
/security/users
```

## Test 6.1 — Test users create

Create করো:

```text
Full Name: QA Viewer User
User ID / Username: qa.viewer
Email: qa.viewer@test.com
Password: Test@12345

Full Name: QA Creator User
User ID / Username: qa.creator
Email: qa.creator@test.com
Password: Test@12345

Full Name: QA No Access User
User ID / Username: qa.noaccess
Email: qa.noaccess@test.com
Password: Test@12345
```

Expected:

```text
Users created successfully
```

## Test 6.2 — User search/filter

Search:

```text
QA
```

Status filter:

```text
Active / Inactive / All
```

Expected:

```text
Correct users দেখাবে
```

---

# Phase 7 — User Roles Test

URL:

```text
/security/user-roles
```

এই page দিয়ে user-কে role assign করা হয়।

## Test 7.1 — Assign QA Viewer

```text
User: QA Viewer User
Role: QA Viewer
```

Expected:

```text
Role assigned to user successfully
Assigned roles table refresh হবে
```

## Test 7.2 — Assign QA Creator

```text
User: QA Creator User
Role: QA Creator
```

Expected:

```text
Role assigned successfully
```

## Test 7.3 — Assign QA No Access

```text
User: QA No Access User
Role: QA No Access
```

Expected:

```text
Role assigned successfully
```

## Test 7.4 — Login as test users

Logout করে login করো:

```text
qa.viewer
qa.creator
qa.noaccess
```

Expected:

```text
qa.viewer → only view access
qa.creator → view + create/update access
qa.noaccess → no unauthorized menu/action access
```

---

# Phase 8 — Menu Permissions Test

URL:

```text
/security/menu-permissions
```

এই page menu-এর সাথে permission map করে। Dynamic sidebar menu visibility এর জন্য এটা useful.

## Test 8.1 — Company menu mapping

Menu select করো:

```text
Company
```

Assign করো:

```text
menu.company.view
```

Expected:

```text
Company menu permission mapped successfully
```

## Test 8.2 — Security menu mapping

Example:

```text
Menu: Role Permissions
Permission: menu.role_permission.view

Menu: User Roles
Permission: menu.user_role.view

Menu: Menu Permissions
Permission: menu.menu_permission.view

Menu: Menu Action Permissions
Permission: menu.menu_action_permission.view
```

Expected:

```text
Menu permission mapping table update হবে
```

## Test 8.3 — Negative test

QA Viewer role থেকে `menu.company.view` remove করে logout/login করো।

Expected:

```text
Company menu hide হবে অথবা access deny হবে
```

তারপর permission আবার assign করে logout/login করো।

Expected:

```text
Company menu আবার show হবে
```

---

# Phase 9 — Menu Action Permissions Test

URL:

```text
/security/menu-action-permissions
```

এই page button/action permission mapping করে।

## Test 9.1 — Company Create button mapping

Menu Action select করো:

```text
Company → Create
```

Permission assign করো:

```text
button.company.create
```

অথবা system-এ যদি API permission use করো:

```text
api.company.create
```

Expected:

```text
Menu action permission mapped successfully
```

## Test 9.2 — Company Edit button mapping

```text
Menu Action: Company → Edit
Permission: button.company.update / api.company.update
```

Expected:

```text
Mapped successfully
```

## Test 9.3 — Company Delete button mapping

```text
Menu Action: Company → Delete
Permission: button.company.delete / api.company.delete
```

Expected:

```text
Mapped successfully
```

## Test 9.4 — Button visibility test

Login as:

```text
qa.viewer
```

Expected:

```text
Company page দেখা যাবে
Create/Edit/Delete button দেখা যাবে না
```

Login as:

```text
qa.creator
```

Expected:

```text
Company page দেখা যাবে
Create button দেখা যাবে
যে permission নেই সেই button hide থাকবে
```

---

# Phase 10 — Permission-Based API Protection Test

এটা সবচেয়ে important security test।

## Test 10.1 — Unauthorized API create test

Login as:

```text
qa.viewer
```

Company create করার চেষ্টা করো।

Expected:

```text
Button hide থাকবে
```

কিন্তু manually API call করলেও backend block করবে।

Expected backend response:

```text
401 / 403
Could not validate credentials / Not enough permissions
```

## Test 10.2 — Authorized API create test

Login as:

```text
qa.creator
```

Company create করো।

Expected:

```text
POST /api/v1/companies 201 Created
```

## Test 10.3 — Remove permission and retest

Super Admin দিয়ে:

```text
Role Permissions → QA Creator → remove api.company.create
```

Logout/Login as `qa.creator`.

Company create try করো।

Expected:

```text
Button hide হবে
API call block হবে
```

---

# Phase 11 — Permission-Based Button Test

Target page:

```text
/companies
/branches
/departments
/designations
/employees
```

## Test 11.1 — View-only role

Login:

```text
qa.viewer
```

Expected:

```text
Menu visible: yes
Table visible: yes
Create button: no
Edit button: no
Delete/Inactive button: no
Restore button: no
Export/Import button: no, যদি permission না থাকে
```

## Test 11.2 — Create role

Login:

```text
qa.creator
```

Expected:

```text
Menu visible: yes
Table visible: yes
Create button: yes
Edit button: permission থাকলে yes
Delete button: permission না থাকলে no
```

## Test 11.3 — No access role

Login:

```text
qa.noaccess
```

Expected:

```text
Company/Organization/Security restricted menu show করবে না
Direct URL দিলে access denied অথবা API 401/403 হবে
```

---

# Phase 12 — Full End-to-End Scenario

এটা final real-world test.

## Scenario A — Viewer user

```text
1. Create role: QA Viewer
2. Assign permission: menu.company.view
3. Create user: qa.viewer
4. Assign role QA Viewer to qa.viewer
5. Logout/Login as qa.viewer
6. Open Company page
```

Expected:

```text
Company menu visible
Company table visible
Create/Edit/Delete button hidden
Manual create API blocked
```

## Scenario B — Creator user

```text
1. Create role: QA Creator
2. Assign permissions:
   - menu.company.view
   - api.company.create
   - button.company.create
3. Create user: qa.creator
4. Assign role QA Creator to qa.creator
5. Logout/Login as qa.creator
6. Open Company page
7. Create company
```

Expected:

```text
Company menu visible
Create button visible
Create API success
Edit/Delete hidden if permission missing
```

## Scenario C — Admin user

```text
1. Super Admin login
2. All Security menus visible
3. Role Permissions accessible
4. User Roles accessible
5. Menu Permissions accessible
6. Menu Action Permissions accessible
```

Expected:

```text
Full access
No 401/403
```

---

# Phase 13 — Backend Log Checklist

Successful flow logs:

```text
POST /api/v1/auth/login 200 OK
GET /api/v1/me/navigation 200 OK

GET /api/v1/roles 200 OK
GET /api/v1/permissions 200 OK
GET /api/v1/users 200 OK

GET /api/v1/role-permissions/roles/{id}/permissions 200 OK
POST /api/v1/role-permissions 201 Created
DELETE /api/v1/role-permissions/{id} 200 OK

GET /api/v1/user-roles/users/{id}/roles 200 OK
POST /api/v1/user-roles 201 Created
DELETE /api/v1/user-roles/{id} 200 OK

GET /api/v1/menu-permissions/menus 200 OK
POST /api/v1/menu-permissions 201 Created

GET /api/v1/menu-action-permissions/actions 200 OK
POST /api/v1/menu-action-permissions 201 Created
```

Unauthorized expected logs:

```text
401 Unauthorized
403 Forbidden
```

এগুলো unauthorized user হলে normal.

---

# Phase 14 — Common Problem & Meaning

| Problem                 | Meaning                                     | Fix                                            |
| ----------------------- | ------------------------------------------- | ---------------------------------------------- |
| Menu দেখা যাচ্ছে না     | menu permission নেই বা navigation cache old | Role permission assign করে logout/login        |
| Button দেখা যাচ্ছে না   | menu action/button permission নেই           | Role Permission + Menu Action Permission check |
| API 401/403             | user permission পায়নি                       | Role Permissions check                         |
| Sidebar update হচ্ছে না | navigation cache old                        | logout/login                                   |
| Same API 2 বার call     | Next dev mode                               | Production build-এ usually কমে যাবে            |
| Assigned list map error | API response shape mismatch                 | service normalize function check               |
| Page 404                | route/file missing                          | `npm run build` route list check               |

---

# Final Testing Order

এই order follow করলে best result পাবে:

```text
1. Backend compile
2. Frontend lint/build
3. Super Admin login
4. Sidebar navigation check
5. Roles create
6. Permissions verify
7. Role Permissions assign
8. Users create
9. User Roles assign
10. Menu Permissions map
11. Menu Action Permissions map
12. Login as test users
13. Button visibility test
14. API protection test
15. Logout/Login cache test
16. Final production build
```

# Final Pass Criteria

Security part complete ধরা হবে যখন:

```text
✅ Super Admin সব Security menu access করতে পারে
✅ Role create/edit/search works
✅ Permission list/search works
✅ Role Permission assign/remove works
✅ User create/edit/search works
✅ User Role assign/remove works
✅ Menu Permission mapping works
✅ Menu Action Permission mapping works
✅ Unauthorized user button দেখতে পায় না
✅ Unauthorized user API hit করলেও backend block করে
✅ Navigation cache route click-এ বারবার reload করে না
✅ Logout/Login করলে permission update reflect করে
✅ npm run lint pass
✅ npm run build pass
✅ python -m compileall app pass
```

এগুলো pass হলে তোমার **AMS Security/RBAC full cycle stable** ধরা যাবে।