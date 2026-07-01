হ্যাঁ, Dynamic Navigation v2 আমি এমনভাবে recommend করবো যাতে **desktop, laptop, tablet, mobile—সব screen-এ user-friendly** থাকে এবং navigation সহজ হয়।

আমার strong recommendation:

```text
Navigation v2 = DB-driven Recursive Sidebar + Responsive Mobile Drawer + Menu Search + Breadcrumb
```

## 1. Menu structure recommendation

আপনার idea ঠিক আছে। তবে Audit-এর সবকিছু ৩ লেয়ারে না দিয়ে mixed রাখাই best:

```text
Audit
├── Audit Subjects
├── Audit Entities
├── Business Activities
├── Exchange Listings
├── Entity Addresses
├── Entity Contacts
├── Directors / Owners
├── Entity Licenses
├── Facilities / Factories
├── Financial Snapshots
├── Tax Assessments
└── Audit Operation
    ├── Audit Plan
    ├── Audit Entry
    ├── Audit Schedule
    └── Future user-defined menus
```

এতে user confusion কম হবে। Audit Entities-related setup/configuration direct Audit-এর নিচে থাকবে, আর actual audit work/process থাকবে **Audit Operation**-এর নিচে।

## 2. DB-driven design

Frontend-এ কোনো hardcode থাকবে না।

Database structure হবে এমন:

```text
navigation_groups
  └── menus
        ├── id
        ├── group_id
        ├── parent_id nullable
        ├── menu_key
        ├── menu_name
        ├── route_path nullable
        ├── icon
        ├── sort_order
        ├── is_active
        └── children[]
```

`parent_id = null` হলে top-level menu।
`parent_id = Audit Operation ID` হলে সেটা third-level child হবে।

Example:

```text
Audit Operation
route_path = null
parent_id = null under Audit group

Audit Plan
route_path = /audit-plans
parent_id = Audit Operation ID
```

## 3. Responsive UX recommendation

Desktop/laptop:

```text
Left sidebar full
Group accordion
Nested menu accordion
Active route highlighted
Child count badge
```

Tablet:

```text
Collapsed icon sidebar
Click করলে drawer/sidebar expand
Search still available
```

Mobile:

```text
Hamburger button
Full-screen or slide-in menu drawer
Large touch-friendly menu items
Only one group expanded at a time
Search menu at top
Breadcrumb on page
```

Mobile-এ সবচেয়ে important:

```text
❌ Tiny nested sidebar না
✅ Full-screen mobile drawer
✅ Large touch target
✅ Search menu
✅ Active page clearly highlighted
```

## 4. User-friendly features I recommend

Dynamic Navigation v2-তে এগুলো রাখলে navigation অনেক smooth হবে:

```text
1. Menu Search
   User “employee”, “audit plan”, “permission” লিখে menu খুঁজে পাবে।

2. Breadcrumb
   Example:
   Audit > Audit Operation > Audit Plan

3. Auto-expand active path
   User /audit-plans এ গেলে:
   Audit open হবে
   Audit Operation open হবে
   Audit Plan active হবে

4. Remember expanded/collapsed state
   localStorage-এ user last sidebar state save থাকবে।

5. Permission-aware rendering
   User যার permission পাবে না, সেই menu দেখাবে না।

6. Empty parent hide
   Audit Operation-এর নিচে permission অনুযায়ী child না থাকলে Audit Operation দেখাবে না।

7. Route-less parent support
   Audit Operation click করলে শুধু expand/collapse হবে, page navigate করবে না।

8. Future user-defined menu support
   Backend/admin থেকে নতুন menu add করলে frontend automatically render করবে।
```

## 5. Backend API recommendation

Current `/api/me/navigation` response-কে nested করতে হবে:

```ts
type NavigationMenu = {
  id: number;
  menu_key: string;
  menu_name: string;
  route_path?: string | null;
  icon?: string | null;
  sort_order: number;
  actions: MenuAction[];
  children: NavigationMenu[];
};
```

Frontend শুধু recursive render করবে:

```text
renderMenu(menu)
  if menu.children.length > 0:
    show accordion
  else:
    show link
```

## 6. খুব important warning

আমি recommend করবো না যে:

```text
❌ Audit-এর সব menu ৩ লেয়ারের ভেতরে ঢুকানো
❌ Frontend JSX-এ Audit Operation hardcode করা
❌ Permission বাদ দিয়ে sidebar বানানো
❌ Mobile-এ desktop sidebar squeeze করা
```

এগুলো করলে future maintenance কঠিন হবে।

## Final recommendation

আমার final architecture হবে:

```text
C23 — Dynamic Navigation v2

C23.1 Current navigation inspect
C23.2 DB schema: menus.parent_id + route_path nullable support
C23.3 Backend nested navigation response
C23.4 Seed Audit 3-layer menu
C23.5 Frontend recursive sidebar render
C23.6 Mobile responsive drawer/sidebar
C23.7 Permission regression test
C23.8 Breadcrumb + menu search
```

এটাই enterprise-level হবে, future-proof হবে, আর user যে কোনো screen থেকে সহজে navigate করতে পারবে।

Next step হিসেবে আগে **C23.1 inspect only** করা উচিত—কোনো code change না। তারপর exact migration + sidebar patch দেবো।

ChatGPT Plus


























Pasted text(161).txt
Document
তুমি সব সবকিছু বাংলায় এবং ইংলিশ মিলাইয়া দিবা।তোমার বোঝার জন্য আগের চ্যাটের হিস্ট্রি অ্যাটাচমেন্টে দিলাম।


Pasted text(162).txt
Document


Pasted text(163).txt
Document


Pasted text(164).txt
Document


Pasted text(165).txt
Document


Pasted text(166).txt
Document


Pasted text(167).txt
Document


Pasted text(168).txt
Document


Pasted text(169).txt
Document


Pasted text(170).txt
Document
(.venv) PS E:\Audit\AMS\frontend> npm run lint 

> frontend@0.1.0 lint
> eslint

(.venv) PS E:\Audit\AMS\frontend> npm run build

> frontend@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 3.7s
✓ Finished TypeScript in 8.1s    
✓ Collecting page data using 7 workers in 1423ms    
✓ Generating static pages using 7 workers (37/37) in 675ms
✓ Finalizing page optimization in 28ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/backend/[...path]
├ ƒ /api/branches
├ ƒ /api/branches/[id]
├ ƒ /api/branches/[id]/inactive
├ ƒ /api/companies
├ ƒ /api/companies/[id]
├ ƒ /api/departments
├ ƒ /api/departments/[id]
├ ƒ /api/departments/[id]/inactive
├ ƒ /api/departments/[id]/restore
├ ƒ /api/designations
├ ƒ /api/designations/[id]
├ ƒ /api/designations/[id]/inactive
├ ƒ /api/designations/[id]/restore
├ ƒ /api/employees
├ ƒ /api/employees/[id]
├ ƒ /api/employees/[id]/inactive
├ ƒ /api/employees/[id]/photo
├ ƒ /api/employees/[id]/restore
├ ƒ /api/me/navigation
├ ○ /audit-entities
├ ○ /audit-entity-addresses
├ ○ /audit-entity-business-activities
├ ○ /audit-entity-contacts
├ ○ /audit-entity-directors
├ ○ /audit-entity-exchange-listings
├ ○ /audit-entity-facilities
├ ○ /audit-entity-financial-snapshots
├ ○ /audit-entity-licenses
├ ○ /audit-entity-tax-assessments
├ ○ /audit-subjects
├ ○ /branches
├ ○ /companies
├ ○ /dashboard
├ ○ /departments
├ ○ /designations
├ ○ /employees
├ ○ /login
├ ○ /security/menu-action-permissions
├ ○ /security/menu-permissions
├ ○ /security/permissions
├ ○ /security/role-permissions
├ ○ /security/roles
├ ○ /security/user-roles
└ ○ /security/users


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

(.venv) PS E:\Audit\AMS\frontend> 

PS E:\Audit\AMS> git status --short
 M backend/app/repositories/navigation_repository.py
 M backend/app/schemas/navigation.py
 M frontend/src/components/layout/EnterpriseSidebar.tsx
 M frontend/src/contexts/NavigationContext.tsx
 M frontend/src/types/navigation.ts
?? "Dynamic Navigation v2.md"
?? backend/scripts/seed_audit_operation_navigation.py
PS E:\Audit\AMS> 

forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
sessionStorage.removeItem("ams_navigation_cache");

fetch("/api/me/navigation", { credentials: "include" })
  .then(async (res) => ({ status: res.status, data: await res.json() }))
  .then((result) => {
    const audit = result.data?.find((g) => g.group_key === "audit");
    const auditOperation = audit?.menus?.find(
      (m) => m.menu_key === "audit_operation"
    );

    console.log("STATUS:", result.status);
    console.log("AUDIT ROOT MENUS:", audit?.menus?.map((m) => m.menu_title));
    console.log("AUDIT OPERATION:", auditOperation);
    console.log(
      "AUDIT OPERATION CHILDREN:",
      auditOperation?.children?.map((m) => m.menu_title)
    );
  });
Promise {<pending>}
VM878:11 STATUS: 200
VM878:12 AUDIT ROOT MENUS: (11) ['Audit Operation', 'Audit Entities', 'Business Activities', 'Exchange Listings', 'Entity Addresses', 'Entity Contacts', 'Directors / Owners', 'Entity Licenses', 'Facilities / Factories', 'Financial Snapshots', 'Tax Assessments']
VM878:13 AUDIT OPERATION: {id: 26, parent_menu_id: null, menu_key: 'audit_operation', menu_title: 'Audit Operation', route_path: null, …}
VM878:14 AUDIT OPERATION CHILDREN: ['Audit Subjects']

কিন্তু আমি এটা ফ্রন্ট end থেকে কন্ট্রোল করতে চাই যেহেতু ফ্রন্ট এন্ড আমার page ক্রিয়েট করা আছে

PS E:\Audit\AMS> cd E:\Audit\AMS
PS E:\Audit\AMS> 
PS E:\Audit\AMS> Write-Host "n--- Backend menus API ---"

--- Backend menus API ---
PS E:\Audit\AMS> Get-Content "backend\app\api\v1\menus.py"
# E:\Audit\AMS\backend\app\api\v1\menus.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu import (
    MenuCreate,
    MenuListResponse,
    MenuMessageResponse,
    MenuResponse,
    MenuUpdate,
)
from app.services.menu.menu_service import MenuService

router = APIRouter(prefix="/menus", tags=["Menus"])


@router.get("", response_model=MenuListResponse)
async def list_menus(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    navigation_group_id: int | None = None,
    parent_menu_id: int | None = None,
    is_visible: bool | None = None,
    is_active: bool | None = None,
    sort_by: str = "sort_order",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu.view")),
):
    service = MenuService(db)
    return await service.list_menus(
        page=page,
        page_size=page_size,
        search=search,
        navigation_group_id=navigation_group_id,
        parent_menu_id=parent_menu_id,
        is_visible=is_visible,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{menu_id}", response_model=MenuResponse)
async def get_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu.view")),
):
    service = MenuService(db)
    return await service.get_menu(menu_id)


@router.post(
    "",
    response_model=MenuMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_menu(
    payload: MenuCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.create")),
):
    service = MenuService(db)
    return await service.create_menu(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{menu_id}", response_model=MenuMessageResponse)
async def update_menu(
    menu_id: int,
    payload: MenuUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.update")),
):
    service = MenuService(db)
    return await service.update_menu(
        menu_id=menu_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{menu_id}", response_model=MenuMessageResponse)
async def delete_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.delete")),
):
    service = MenuService(db)
    return await service.deactivate_menu(
        menu_id=menu_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{menu_id}/restore", response_model=MenuMessageResponse)
async def restore_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.restore")),
):
    service = MenuService(db)
    return await service.restore_menu(
        menu_id=menu_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{menu_id}/permanent", response_model=MenuMessageResponse)
async def permanent_delete_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.permanent_delete")),
):
    service = MenuService(db)
    return await service.permanent_delete_menu(menu_id)
PS E:\Audit\AMS> 
PS E:\Audit\AMS> Write-Host "n--- Frontend security routes ---"

--- Frontend security routes ---
PS E:\Audit\AMS> Get-ChildItem "frontend\src\app\(protected)\security" -Recurse -Directory |
>>   Select-Object FullName

FullName
--------
E:\Audit\AMS\frontend\src\app\(protected)\security\menu-action-permissions
E:\Audit\AMS\frontend\src\app\(protected)\security\menu-permissions
E:\Audit\AMS\frontend\src\app\(protected)\security\role-permissions
E:\Audit\AMS\frontend\src\app\(protected)\security\user-roles

PS E:\Audit\AMS> 
PS E:\Audit\AMS> Write-Host "n--- Frontend services menu/navigation related ---"

--- Frontend services menu/navigation related ---
PS E:\Audit\AMS> Get-ChildItem "frontend\src" -Recurse -File |
>>   Where-Object {
>>     $_.FullName -match "menu|navigation"
>>   } |
>>   Select-Object FullName

FullName
--------
E:\Audit\AMS\frontend\src\app\(protected)\security\menu-action-permissions\page.tsx
E:\Audit\AMS\frontend\src\app\(protected)\security\menu-permissions\page.tsx
E:\Audit\AMS\frontend\src\app\api\me\navigation\route.ts
E:\Audit\AMS\frontend\src\constants\menu.ts
E:\Audit\AMS\frontend\src\contexts\NavigationContext.tsx
E:\Audit\AMS\frontend\src\services\menuActionPermission.ts
E:\Audit\AMS\frontend\src\services\menuPermission.ts
E:\Audit\AMS\frontend\src\services\navigation.ts
E:\Audit\AMS\frontend\src\types\menuActionPermission.ts
E:\Audit\AMS\frontend\src\types\menuPermission.ts
E:\Audit\AMS\frontend\src\types\navigation.ts

PS E:\Audit\AMS> 

আর একটা বিষয় সব জায়গায় কমন টেমপ্লেট ইউজ করবা আগে যেভাবে আমরা Audit and Organization module লের বিভিন্ন পেজের জন্য করেছি


Pasted text(171).txt
Document

অলরেডি attached image এগুলা আছে তুমি আগে ভালোমতো সবকিছু চেক কর তারপরে সাজেস্ট করো কি করতে হবে


Pasted text(172).txt
Document

Pasted text (2)(6).txt
Document


Pasted text(173).txt
Document

Pasted text (2)(7).txt
Document


Pasted text(174).txt
Document

image(351).png
image(352).png
1. Menu bar ব্যাকগ্রাউন্ড ব্ল্যাক থেকে সরায়ে Eye কমফোর্টেবল করতে হবে
2. Small screen e menu hamburg কাজ করেনা ক্লিক করলে কিছুই হয় না


Pasted text(175).txt
Document


Pasted text(176).txt
Document


Pasted text(177).txt
Document


Pasted text(178).txt
Document

Pasted text (2)(8).txt
Document

সবকিছুই আছে তুমি বারবার একই জিনিস করে সময় নষ্ট করোনা আগে খুব ভালোমতো full existing all files check কর

Thought for 30s
ঠিক আছে — এবার full audit result থেকে পরিষ্কার decision নিচ্ছি ✅
আর duplicate feature suggestion করবো না।

Audit Findings
1) Existing Security frontend routes
তোমার current audit output অনুযায়ী Security folder-এ এই pages পাওয়া গেছে:

/security/menu-action-permissions
/security/menu-permissions
/security/menus
/security/role-permissions
/security/user-roles
মানে Menu Permission Mapping এবং Menu Action Permission Mapping already আছে। এগুলো duplicate বানানো যাবে না। 


2) Existing Menu Action Permission page কী করে
এই page already করছে:

✅ Menu Action dropdown
✅ Permission dropdown
✅ Assign Permission
✅ Assigned permissions table
✅ Remove mapping
আর backend API-ও exactly এই mapping-এর জন্য আছে:

GET    /menu-action-permissions/actions
GET    /menu-action-permissions/actions/{menu_action_id}/permissions
POST   /menu-action-permissions
DELETE /menu-action-permissions/{id}
So এটা button/action permission mapping already fully controlled from frontend. 


3) Backend Menu Actions API already exists
Backend-এ menu_actions.py আছে এবং full CRUD আছে:

GET    /menu-actions
GET    /menu-actions/{id}
POST   /menu-actions
PATCH  /menu-actions/{id}
DELETE /menu-actions/{id}
PATCH  /menu-actions/{id}/restore
DELETE /menu-actions/{id}/permanent
So backend side ready. 


4) Frontend missing service/type for direct Menu Actions CRUD
Frontend service list-এ আছে:

menu.ts
menuActionPermission.ts
menuPermission.ts
permission.ts
rolePermission.ts
কিন্তু menuAction.ts service/type নেই। তোমার audit output-এ menuActionPermission.ts আছে, but direct menuAction.ts নেই। অর্থাৎ frontend এখন action-permission mapping করে, কিন্তু action definition CRUD করার আলাদা frontend service/page এখনো নেই।

Final conclusion
Existing system status:

✅ Navigation Groups manage করা যায়
✅ Menus manage করা যায়
✅ Menu ↔ Permission mapping করা যায়
✅ Menu Action ↔ Permission mapping করা যায়
✅ Roles / Permissions / Users services/components আছে
✅ Backend Menu Actions CRUD আছে
❌ Frontend direct Menu Actions CRUD service/page missing
So next work Menu Action Permission Mapping নয়। সেটা already আছে।

Next work হওয়া উচিত:

C23.7 — Menu Actions CRUD inside Navigation Builder
কিন্তু খুব carefully:

/security/menu-action-permissions
= keep as it is, mapping page

/security/menus
= Navigation Builder
  ├── Groups
  ├── Menus
  └── Actions
Actions tab only করবে:

Create / Edit / Inactive / Restore / Permanent Delete menu actions
Mapping হবে existing page-এই:

/security/menu-action-permissions
Before C23.7 patch, exact inspect needed
এবার শুধু missing piece inspect করবো, যাতে guess না থাকে:

cd E:\Audit\AMS

Write-Host "`n--- Backend menu action schema ---"
Get-Content "backend\app\schemas\menu_action.py"

Write-Host "`n--- Backend menu action repository ---"
Get-Content "backend\app\repositories\menu_action_repository.py"

Write-Host "`n--- Backend menu action service ---"
Get-Content "backend\app\services\menu_action\menu_action_service.py"

Write-Host "`n--- Existing menu action permission frontend service ---"
Get-Content "frontend\src\services\menuActionPermission.ts"

Write-Host "`n--- Existing menu action permission frontend type ---"
Get-Content "frontend\src\types\menuActionPermission.ts"

Write-Host "`n--- Current Navigation Builder page after C23.6 ---"
Get-Content "frontend\src\app\(protected)\security\menus\page.tsx"
এই output দিলে আমি শুধু Actions tab add করবো। Existing mapping page untouched থাকবে.



Pasted text(179).txt
Document

Pasted text (2)(9).txt
Document
PS E:\Audit\AMS> Write-Host "n--- Backend menu action schema ---"                 

--- Backend menu action schema ---
PS E:\Audit\AMS> Get-Content "backend\app\schemas\menu_action.py"
# E:\Audit\AMS\backend\app\schemas\menu_action.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MenuActionBase(BaseModel):
    menu_id: int = Field(..., gt=0)
    action_key: str = Field(..., min_length=2, max_length=100)
    action_title: str = Field(..., min_length=2, max_length=100)
    permission_key: str = Field(..., min_length=3, max_length=150)
    button_color: str | None = Field(default=None, max_length=50)
    button_icon: str | None = Field(default=None, max_length=100)
    sort_order: int = 0
    is_visible: bool = True

    @field_validator("action_key", "action_title", "permission_key")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("button_color", "button_icon")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuActionCreate(MenuActionBase):
    pass


class MenuActionUpdate(BaseModel):
    menu_id: int | None = Field(default=None, gt=0)
    action_key: str | None = Field(default=None, min_length=2, max_length=100)
    action_title: str | None = Field(default=None, min_length=2, max_length=100)
    permission_key: str | None = Field(default=None, min_length=3, max_length=150)
    button_color: str | None = Field(default=None, max_length=50)
    button_icon: str | None = Field(default=None, max_length=100)
    sort_order: int | None = None
    is_visible: bool | None = None

    @field_validator("action_key", "action_title", "permission_key")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("button_color", "button_icon")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_id: int
    action_key: str
    action_title: str
    permission_key: str
    button_color: str | None = None
    button_icon: str | None = None
    sort_order: int
    is_visible: bool
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuActionListResponse(BaseModel):
    items: list[MenuActionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MenuActionMessageResponse(BaseModel):
    message: str
    data: MenuActionResponse | None = None
PS E:\Audit\AMS> 
PS E:\Audit\AMS> Write-Host "n--- Backend menu action repository ---"

--- Backend menu action repository ---
PS E:\Audit\AMS> Get-Content "backend\app\repositories\menu_action_repository.py"

# E:\Audit\AMS\backend\app\repositories\menu_action_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission


class MenuActionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ) -> tuple[list[MenuAction], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    MenuAction.action_key.ilike(search_text),
                    MenuAction.action_title.ilike(search_text),
                    MenuAction.permission_key.ilike(search_text),
                    MenuAction.button_color.ilike(search_text),
                    MenuAction.button_icon.ilike(search_text),
                )
            )

        if menu_id is not None:
            conditions.append(MenuAction.menu_id == menu_id)

        if is_visible is not None:
            conditions.append(MenuAction.is_visible == is_visible)

        if is_active is not None:
            conditions.append(MenuAction.is_active == is_active)

        count_stmt = select(func.count()).select_from(MenuAction)
        query = select(MenuAction)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": MenuAction.id,
            "menu_id": MenuAction.menu_id,
            "action_key": MenuAction.action_key,
            "action_title": MenuAction.action_title,
            "sort_order": MenuAction.sort_order,
            "is_visible": MenuAction.is_visible,
            "is_active": MenuAction.is_active,
            "created_at": MenuAction.created_at,
            "updated_at": MenuAction.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, MenuAction.sort_order)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression, MenuAction.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, action_id: int) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(
                MenuAction.id == action_id,
                MenuAction.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, action_id: int) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(MenuAction.id == action_id)
        )
        return result.scalar_one_or_none()

    async def get_by_menu_and_action_key(
        self,
        menu_id: int,
        action_key: str,
    ) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(
                MenuAction.menu_id == menu_id,
                func.lower(MenuAction.action_key) == action_key.strip().lower(),
            )
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict, created_by: str) -> MenuAction:
        action = MenuAction(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(action)
        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def update(
        self,
        action: MenuAction,
        update_data: dict,
        updated_by: str,
    ) -> MenuAction:
        for field, value in update_data.items():
            setattr(action, field, value)

        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def deactivate(self, action: MenuAction, updated_by: str) -> MenuAction:
        action.is_active = False
        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def restore(self, action: MenuAction, updated_by: str) -> MenuAction:
        action.is_active = True
        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def count_menu_action_permissions(self, action_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuActionPermission).where(
                MenuActionPermission.menu_action_id == action_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, action: MenuAction) -> None:
        await self.db.delete(action)
        await self.db.commit()
PS E:\Audit\AMS> 

Thought for 12s
Full check done ✅ এবার clear decision:

Existing আছে
✅ Menu Action Permission Mapping page আছে
✅ Mapping assign/remove frontend থেকে হয়
✅ Backend menu-action-permissions API ready
✅ Backend menu-actions CRUD API ready
Missing শুধু এটা
❌ Frontend direct Menu Actions CRUD নেই
মানে existing page দিয়ে permission mapping হয়, কিন্তু action/button definition নিজে frontend থেকে create/edit করা যায় না।

Backend schema অনুযায়ী Menu Action fields হলো:

menu_id
action_key
action_title
permission_key
button_color
button_icon
sort_order
is_visible
আর backend service permission_key validate করে, অর্থাৎ action create করতে হলে permission key অবশ্যই existing active permission হতে হবে। 


Current Navigation Builder page এখন শুধু:

Groups
Menus
tab আছে। Actions tab নেই। 


So next কাজ হবে:

C23.7 — Navigation Builder Actions Tab
Mapping page untouched থাকবে:

/security/menu-action-permissions
New Actions tab যাবে এখানে:

/security/menus
Navigation Builder
├── Groups
├── Menus
└── Actions
C23.7A — Create Menu Actions frontend service/types/components
প্রথমে safe foundation বানাই। এতে page integration এখনো করবো না।

Run:

cd E:\Audit\AMS

@'
from pathlib import Path

types_path = Path(r"frontend\src\types\menuAction.ts")
service_path = Path(r"frontend\src\services\menuAction.ts")
form_path = Path(r"frontend\src\components\menus\MenuActionForm.tsx")
row_actions_path = Path(r"frontend\src\components\menus\MenuActionRowActions.tsx")

form_path.parent.mkdir(parents=True, exist_ok=True)

types_path.write_text(r'''export type MenuAction = {
  id: number;
  menu_id: number;
  action_key: string;
  action_title: string;
  permission_key: string;
  button_color: string | null;
  button_icon: string | null;
  sort_order: number;
  is_visible: boolean;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type MenuActionListResponse = {
  items: MenuAction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type MenuActionCreatePayload = {
  menu_id: number;
  action_key: string;
  action_title: string;
  permission_key: string;
  button_color?: string | null;
  button_icon?: string | null;
  sort_order: number;
  is_visible: boolean;
};

export type MenuActionUpdatePayload = Partial<MenuActionCreatePayload>;

export type MenuActionMessageResponse = {
  message: string;
  data: MenuAction | null;
};

export type MenuActionStatusFilter = "all" | "active" | "inactive";
export type MenuActionVisibilityFilter = "all" | "visible" | "hidden";

export type MenuActionQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: MenuActionStatusFilter;
  visibility?: MenuActionVisibilityFilter;
  menuId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
''', encoding="utf-8")

service_path.write_text(r'''import type {
  MenuActionCreatePayload,
  MenuActionListResponse,
  MenuActionMessageResponse,
  MenuActionQueryParams,
  MenuActionUpdatePayload,
} from "@/types/menuAction";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

const BASE_URL = "/api/backend/menu-actions";

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => item.msg || item.message || "Validation error")
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
};

const buildQuery = (params: MenuActionQueryParams = {}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("page_size", String(params.pageSize ?? 20));
  query.set("sort_by", params.sortBy ?? "sort_order");
  query.set("sort_order", params.sortOrder ?? "asc");

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.menuId) {
    query.set("menu_id", String(params.menuId));
  }

  if (params.visibility === "visible") {
    query.set("is_visible", "true");
  }

  if (params.visibility === "hidden") {
    query.set("is_visible", "false");
  }

  if (params.status === "active") {
    query.set("is_active", "true");
  }

  if (params.status === "inactive") {
    query.set("is_active", "false");
  }

  return query.toString();
};

export const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const getMenuActionsPage = async (
  params: MenuActionQueryParams = {}
): Promise<MenuActionListResponse> => {
  return requestJson<MenuActionListResponse>(
    `${BASE_URL}?${buildQuery(params)}`
  );
};

export const getAllMenuActions = async (
  params: Omit<MenuActionQueryParams, "page" | "pageSize"> = {}
): Promise<MenuActionListResponse> => {
  return getMenuActionsPage({
    ...params,
    page: 1,
    pageSize: 100,
  });
};

export const createMenuAction = async (
  payload: MenuActionCreatePayload
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateMenuAction = async (
  actionId: number,
  payload: MenuActionUpdatePayload
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(`${BASE_URL}/${actionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateMenuAction = async (
  actionId: number
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(`${BASE_URL}/${actionId}`, {
    method: "DELETE",
  });
};

export const restoreMenuAction = async (
  actionId: number
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(
    `${BASE_URL}/${actionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteMenuAction = async (
  actionId: number
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(
    `${BASE_URL}/${actionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
''', encoding="utf-8")

row_actions_path.write_text(r'''import { AlertTriangle, Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { MenuAction } from "@/types/menuAction";

type MenuActionRowActionsProps = {
  action: MenuAction;
  onEdit: (action: MenuAction) => void;
  onInactive: (action: MenuAction) => void;
  onRestore: (action: MenuAction) => void;
  onPermanentDelete: (action: MenuAction) => void;
};

export default function MenuActionRowActions({
  action,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: MenuActionRowActionsProps) {
  if (!action.is_active) {
    return (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onRestore(action)}
          className="rounded-xl border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
          title="Restore action"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onPermanentDelete(action)}
          className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
          title="Permanent delete action"
        >
          <AlertTriangle className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(action)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
        title="Edit action"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onInactive(action)}
        className="rounded-xl border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
        title="Mark inactive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
''', encoding="utf-8")

form_path.write_text(r'''"use client";

import { FormEvent, useMemo, useState } from "react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import {
  createMenuAction,
  normalizeOptionalText,
  updateMenuAction,
} from "@/services/menuAction";
import type { Menu } from "@/types/menu";
import type {
  MenuAction,
  MenuActionCreatePayload,
} from "@/types/menuAction";
import type { Permission } from "@/types/permission";

type MenuActionFormProps = {
  initialData?: MenuAction | null;
  menus: Menu[];
  permissions: Permission[];
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type MenuActionFormState = {
  menu_id: string;
  action_key: string;
  action_title: string;
  permission_key: string;
  button_color: string;
  button_icon: string;
  sort_order: string;
  is_visible: string;
};

const getInitialForm = (
  initialData?: MenuAction | null
): MenuActionFormState => ({
  menu_id: initialData?.menu_id ? String(initialData.menu_id) : "",
  action_key: initialData?.action_key ?? "",
  action_title: initialData?.action_title ?? "",
  permission_key: initialData?.permission_key ?? "",
  button_color: initialData?.button_color ?? "",
  button_icon: initialData?.button_icon ?? "",
  sort_order: String(initialData?.sort_order ?? 10),
  is_visible: String(initialData?.is_visible ?? true),
});

const getMenuOptionLabel = (menu: Menu) => {
  const levelPrefix = menu.menu_level > 1 ? "— ".repeat(menu.menu_level - 1) : "";
  return `${levelPrefix}${menu.menu_title} (${menu.menu_key})`;
};

export default function MenuActionForm({
  initialData,
  menus,
  permissions,
  onSuccess,
  onCancel,
  formId = "menu-action-form",
  hideFooter = false,
  onSubmittingChange,
}: MenuActionFormProps) {
  const [form, setForm] = useState<MenuActionFormState>(() =>
    getInitialForm(initialData)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeMenus = useMemo(() => {
    return menus
      .filter(
        (menu) => menu.is_active || String(menu.id) === form.menu_id
      )
      .sort((first, second) => {
        if (first.sort_order !== second.sort_order) {
          return first.sort_order - second.sort_order;
        }

        return first.id - second.id;
      });
  }, [menus, form.menu_id]);

  const activePermissions = useMemo(() => {
    return permissions
      .filter(
        (permission) =>
          permission.is_active ||
          permission.permission_key === form.permission_key
      )
      .sort((first, second) =>
        first.permission_key.localeCompare(second.permission_key)
      );
  }, [permissions, form.permission_key]);

  const handleChange = (field: keyof MenuActionFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const setSubmitState = (isSubmitting: boolean) => {
    setSubmitting(isSubmitting);
    onSubmittingChange?.(isSubmitting);
  };

  const buildPayload = (): MenuActionCreatePayload => ({
    menu_id: Number(form.menu_id),
    action_key: form.action_key.trim(),
    action_title: form.action_title.trim(),
    permission_key: form.permission_key.trim(),
    button_color: normalizeOptionalText(form.button_color),
    button_icon: normalizeOptionalText(form.button_icon),
    sort_order: Number(form.sort_order || 0),
    is_visible: form.is_visible === "true",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.menu_id) {
      setError("Menu is required.");
      return;
    }

    if (!form.action_key.trim()) {
      setError("Action key is required.");
      return;
    }

    if (!form.action_title.trim()) {
      setError("Action title is required.");
      return;
    }

    if (!form.permission_key.trim()) {
      setError("Permission key is required.");
      return;
    }

    if (!form.sort_order.trim() || Number.isNaN(Number(form.sort_order))) {
      setError("Sort order must be a valid number.");
      return;
    }

    try {
      setSubmitState(true);

      const payload = buildPayload();

      if (initialData) {
        await updateMenuAction(initialData.id, payload);
      } else {
        await createMenuAction(payload);
      }

      setSubmitState(false);
      onSuccess();
    } catch (submitError) {
      console.error("Menu action save failed:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save menu action."
      );
    } finally {
      setSubmitState(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <CrudSelectField
        label="Menu"
        value={form.menu_id}
        required
        disabled={submitting}
        options={[
          { value: "", label: "Select menu" },
          ...activeMenus.map((menu) => ({
            value: String(menu.id),
            label: getMenuOptionLabel(menu),
          })),
        ]}
        onChange={(value) => handleChange("menu_id", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Action Title"
          value={form.action_title}
          required
          disabled={submitting}
          placeholder="Example: Approve"
          onChange={(value) => handleChange("action_title", value)}
        />

        <CrudTextField
          label="Action Key"
          value={form.action_key}
          required
          disabled={submitting}
          placeholder="Example: approve"
          onChange={(value) => handleChange("action_key", value)}
        />
      </div>

      <CrudSelectField
        label="Permission Key"
        value={form.permission_key}
        required
        disabled={submitting}
        options={[
          { value: "", label: "Select permission key" },
          ...activePermissions.map((permission) => ({
            value: permission.permission_key,
            label: permission.permission_key,
          })),
        ]}
        onChange={(value) => handleChange("permission_key", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Button Icon"
          value={form.button_icon}
          disabled={submitting}
          placeholder="Example: CheckCircle, Trash2, Upload"
          onChange={(value) => handleChange("button_icon", value)}
        />

        <CrudTextField
          label="Button Color"
          value={form.button_color}
          disabled={submitting}
          placeholder="Example: blue, emerald, rose"
          onChange={(value) => handleChange("button_color", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Sort Order"
          type="number"
          value={form.sort_order}
          required
          disabled={submitting}
          placeholder="Example: 10"
          onChange={(value) => handleChange("sort_order", value)}
        />

        <CrudSelectField
          label="Visible"
          value={form.is_visible}
          disabled={submitting}
          options={[
            { value: "true", label: "Visible" },
            { value: "false", label: "Hidden" },
          ]}
          onChange={(value) => handleChange("is_visible", value)}
        />
      </div>

      {!hideFooter ? (
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : initialData
                ? "Update Action"
                : "Save Action"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
''', encoding="utf-8")

checks = {
    "types": types_path.exists() and "MenuActionCreatePayload" in types_path.read_text(encoding="utf-8"),
    "service": service_path.exists() and "createMenuAction" in service_path.read_text(encoding="utf-8"),
    "form": form_path.exists() and "MenuActionForm" in form_path.read_text(encoding="utf-8"),
    "row actions": row_actions_path.exists() and "MenuActionRowActions" in row_actions_path.read_text(encoding="utf-8"),
}

print("C23.7A Menu Actions frontend foundation created.")
print("\nVERIFY")
for name, ok in checks.items():
    print(f"{'OK ' if ok else 'BAD'} - {name}")

if not all(checks.values()):
    raise RuntimeError("C23.7A verification failed.")
'@ | python -
Then:

cd E:\Audit\AMS\frontend

npm run lint
npm run build
Expected new files:

?? frontend/src/components/menus/MenuActionForm.tsx
?? frontend/src/components/menus/MenuActionRowActions.tsx
?? frontend/src/services/menuAction.ts
?? frontend/src/types/menuAction.ts
C23.7B-তে তারপর /security/menus page-এ Actions tab integrate করবো.


integrate কর

Thought for 22s
ঠিক আছে ✅
এখন C23.7B — Actions tab integrate করো।

এটা existing /security/menus Navigation Builder page-এ third tab add করবে:

Groups | Menus | Actions
Existing /security/menu-action-permissions page untouched থাকবে। ওটা mapping page হিসেবেই থাকবে।

C23.7B — Integrate Actions Tab
Run from root:

cd E:\Audit\AMS

@'
from pathlib import Path

page_path = Path(r"frontend\src\app\(protected)\security\menus\page.tsx")

required_files = [
    Path(r"frontend\src\types\menuAction.ts"),
    Path(r"frontend\src\services\menuAction.ts"),
    Path(r"frontend\src\components\menus\MenuActionForm.tsx"),
    Path(r"frontend\src\components\menus\MenuActionRowActions.tsx"),
]

missing = [str(path) for path in required_files if not path.exists()]
if missing:
    raise RuntimeError(
        "C23.7A foundation files missing. Run C23.7A first. Missing: "
        + ", ".join(missing)
    )

page_path.write_text(r'''// E:\Audit\AMS\frontend\src\app\(protected)\security\menus\page.tsx

"use client";

import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  Layers3,
  Menu as MenuIcon,
  MousePointerClick,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudPillBadge, CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import { getIcon } from "@/components/layout/IconMapper";
import MenuActionForm from "@/components/menus/MenuActionForm";
import MenuActionRowActions from "@/components/menus/MenuActionRowActions";
import MenuForm from "@/components/menus/MenuForm";
import MenuRowActions from "@/components/menus/MenuRowActions";
import NavigationGroupForm from "@/components/menus/NavigationGroupForm";
import NavigationGroupRowActions from "@/components/menus/NavigationGroupRowActions";
import { clearNavigationCache, useNavigation } from "@/contexts/NavigationContext";
import {
  deactivateMenu,
  getAllMenus,
  getMenuDisplayPath,
  getMenusPage,
  permanentlyDeleteMenu,
  restoreMenu,
} from "@/services/menu";
import {
  deactivateMenuAction,
  getAllMenuActions,
  getMenuActionsPage,
  permanentlyDeleteMenuAction,
  restoreMenuAction,
} from "@/services/menuAction";
import {
  deactivateNavigationGroup,
  getAllNavigationGroups,
  getNavigationGroupsPage,
  permanentlyDeleteNavigationGroup,
  restoreNavigationGroup,
} from "@/services/navigationGroup";
import { getAllPermissions } from "@/services/permission";
import type { Menu, MenuVisibilityFilter } from "@/types/menu";
import type {
  MenuAction,
  MenuActionVisibilityFilter,
} from "@/types/menuAction";
import type {
  NavigationGroupRecord,
  NavigationGroupVisibilityFilter,
} from "@/types/navigationGroup";
import type { StatusFilter } from "@/types/pagination";
import type { Permission } from "@/types/permission";

type BuilderTab = "groups" | "menus" | "actions";
type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type ConfirmState =
  | {
      target: "group";
      action: ConfirmAction;
      item: NavigationGroupRecord;
    }
  | {
      target: "menu";
      action: ConfirmAction;
      item: Menu;
    }
  | {
      target: "action";
      action: ConfirmAction;
      item: MenuAction;
    }
  | null;

const groupFormId = "navigation-group-form";
const menuFormId = "menu-form";
const menuActionFormId = "menu-action-form";

const getBooleanLabel = (value: boolean) => {
  return value ? "Yes" : "No";
};

const renderIcon = (iconName: string | null, className?: string) => {
  const IconComponent = getIcon(iconName);
  return createElement(IconComponent, { className });
};

function SummaryCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white/75 p-5 shadow-sm shadow-sky-100/60 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{hint}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-blue-600 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MenusContent() {
  const { reloadNavigation } = useNavigation();

  const [activeTab, setActiveTab] = useState<BuilderTab>("groups");

  const [groups, setGroups] = useState<NavigationGroupRecord[]>([]);
  const [allGroups, setAllGroups] = useState<NavigationGroupRecord[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [actions, setActions] = useState<MenuAction[]>([]);
  const [allActions, setAllActions] = useState<MenuAction[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [groupTotalRecords, setGroupTotalRecords] = useState(0);
  const [groupTotalPages, setGroupTotalPages] = useState(0);
  const [menuTotalRecords, setMenuTotalRecords] = useState(0);
  const [menuTotalPages, setMenuTotalPages] = useState(0);
  const [actionTotalRecords, setActionTotalRecords] = useState(0);
  const [actionTotalPages, setActionTotalPages] = useState(0);

  const [groupPage, setGroupPage] = useState(1);
  const [groupPageSize, setGroupPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupStatusFilter, setGroupStatusFilter] =
    useState<StatusFilter>("all");
  const [groupVisibilityFilter, setGroupVisibilityFilter] =
    useState<NavigationGroupVisibilityFilter>("all");

  const [menuPage, setMenuPage] = useState(1);
  const [menuPageSize, setMenuPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [menuStatusFilter, setMenuStatusFilter] = useState<StatusFilter>("all");
  const [menuVisibilityFilter, setMenuVisibilityFilter] =
    useState<MenuVisibilityFilter>("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [actionPage, setActionPage] = useState(1);
  const [actionPageSize, setActionPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [actionSearchTerm, setActionSearchTerm] = useState("");
  const [actionStatusFilter, setActionStatusFilter] =
    useState<StatusFilter>("all");
  const [actionVisibilityFilter, setActionVisibilityFilter] =
    useState<MenuActionVisibilityFilter>("all");
  const [actionMenuFilter, setActionMenuFilter] = useState("all");

  const [groupsLoading, setGroupsLoading] = useState(true);
  const [menusLoading, setMenusLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(true);

  const [drawerMode, setDrawerMode] = useState<BuilderTab | null>(null);
  const [editingGroup, setEditingGroup] =
    useState<NavigationGroupRecord | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingAction, setEditingAction] = useState<MenuAction | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedGroupId =
    groupFilter === "all" ? undefined : Number(groupFilter);
  const selectedActionMenuId =
    actionMenuFilter === "all" ? undefined : Number(actionMenuFilter);

  const numericGroupPageSize =
    groupPageSize === "all" ? Math.max(groupTotalRecords, 1) : Number(groupPageSize);
  const numericMenuPageSize =
    menuPageSize === "all" ? Math.max(menuTotalRecords, 1) : Number(menuPageSize);
  const numericActionPageSize =
    actionPageSize === "all"
      ? Math.max(actionTotalRecords, 1)
      : Number(actionPageSize);

  const groupById = useMemo(() => {
    return new Map(allGroups.map((group) => [group.id, group]));
  }, [allGroups]);

  const menuById = useMemo(() => {
    return new Map(allMenus.map((menu) => [menu.id, menu]));
  }, [allMenus]);

  const summary = useMemo(() => {
    return {
      totalGroups: allGroups.length,
      totalMenus: allMenus.length,
      totalActions: allActions.length,
      hiddenItems:
        allGroups.filter((group) => !group.is_visible).length +
        allMenus.filter((menu) => !menu.is_visible).length +
        allActions.filter((action) => !action.is_visible).length,
    };
  }, [allGroups, allMenus, allActions]);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const refreshLiveNavigation = useCallback(() => {
    clearNavigationCache();
    void reloadNavigation();
  }, [reloadNavigation]);

  const loadLookups = useCallback(() => {
    return Promise.all([
      getAllNavigationGroups({
        status: "all",
        visibility: "all",
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
      getAllMenus({
        status: "all",
        visibility: "all",
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
      getAllMenuActions({
        status: "all",
        visibility: "all",
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
      getAllPermissions({
        status: "active",
        sortBy: "permission_key",
        sortOrder: "asc",
      }),
    ]);
  }, []);

  const loadGroups = useCallback(
    async (showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setGroupsLoading(true);
        }

        const response =
          groupPageSize === "all"
            ? await getAllNavigationGroups({
                search: groupSearchTerm,
                status: groupStatusFilter,
                visibility: groupVisibilityFilter,
                sortBy: "sort_order",
                sortOrder: "asc",
              })
            : await getNavigationGroupsPage({
                page: groupPage,
                pageSize: Number(groupPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: groupSearchTerm,
                status: groupStatusFilter,
                visibility: groupVisibilityFilter,
                sortBy: "sort_order",
                sortOrder: "asc",
              });

        setGroups(response.items);
        setGroupTotalRecords(response.total);
        setGroupTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load navigation groups:", error);
        setGroups([]);
        setGroupTotalRecords(0);
        setGroupTotalPages(0);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load navigation groups."
        );
      } finally {
        if (showTableLoading) {
          setGroupsLoading(false);
        }
      }
    },
    [
      groupPage,
      groupPageSize,
      groupSearchTerm,
      groupStatusFilter,
      groupVisibilityFilter,
      showError,
    ]
  );

  const loadMenus = useCallback(
    async (showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setMenusLoading(true);
        }

        const response =
          menuPageSize === "all"
            ? await getAllMenus({
                search: menuSearchTerm,
                status: menuStatusFilter,
                visibility: menuVisibilityFilter,
                navigationGroupId: selectedGroupId,
                sortBy: "sort_order",
                sortOrder: "asc",
              })
            : await getMenusPage({
                page: menuPage,
                pageSize: Number(menuPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: menuSearchTerm,
                status: menuStatusFilter,
                visibility: menuVisibilityFilter,
                navigationGroupId: selectedGroupId,
                sortBy: "sort_order",
                sortOrder: "asc",
              });

        setMenus(response.items);
        setMenuTotalRecords(response.total);
        setMenuTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load menus:", error);
        setMenus([]);
        setMenuTotalRecords(0);
        setMenuTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load menus.");
      } finally {
        if (showTableLoading) {
          setMenusLoading(false);
        }
      }
    },
    [
      menuPage,
      menuPageSize,
      menuSearchTerm,
      menuStatusFilter,
      menuVisibilityFilter,
      selectedGroupId,
      showError,
    ]
  );

  const loadActions = useCallback(
    async (showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setActionsLoading(true);
        }

        const response =
          actionPageSize === "all"
            ? await getAllMenuActions({
                search: actionSearchTerm,
                status: actionStatusFilter,
                visibility: actionVisibilityFilter,
                menuId: selectedActionMenuId,
                sortBy: "sort_order",
                sortOrder: "asc",
              })
            : await getMenuActionsPage({
                page: actionPage,
                pageSize: Number(actionPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: actionSearchTerm,
                status: actionStatusFilter,
                visibility: actionVisibilityFilter,
                menuId: selectedActionMenuId,
                sortBy: "sort_order",
                sortOrder: "asc",
              });

        setActions(response.items);
        setActionTotalRecords(response.total);
        setActionTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load menu actions:", error);
        setActions([]);
        setActionTotalRecords(0);
        setActionTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load menu actions."
        );
      } finally {
        if (showTableLoading) {
          setActionsLoading(false);
        }
      }
    },
    [
      actionPage,
      actionPageSize,
      actionSearchTerm,
      actionStatusFilter,
      actionVisibilityFilter,
      selectedActionMenuId,
      showError,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    const request = Promise.resolve().then(() => loadLookups());

    void request
      .then(([groupsResponse, menusResponse, actionsResponse, permissionResponse]) => {
        if (!isMounted) return;

        setAllGroups(groupsResponse.items);
        setAllMenus(menusResponse.items);
        setAllActions(actionsResponse.items);
        setPermissions(permissionResponse.items);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load navigation builder lookup data:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load navigation builder lookup data."
        );
      });

    return () => {
      isMounted = false;
    };
  }, [loadLookups, showError]);

  useEffect(() => {
    let isMounted = true;

    const request =
      groupPageSize === "all"
        ? getAllNavigationGroups({
            search: groupSearchTerm,
            status: groupStatusFilter,
            visibility: groupVisibilityFilter,
            sortBy: "sort_order",
            sortOrder: "asc",
          })
        : getNavigationGroupsPage({
            page: groupPage,
            pageSize: Number(groupPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
            search: groupSearchTerm,
            status: groupStatusFilter,
            visibility: groupVisibilityFilter,
            sortBy: "sort_order",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setGroups(response.items);
        setGroupTotalRecords(response.total);
        setGroupTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load navigation groups:", error);
        setGroups([]);
        setGroupTotalRecords(0);
        setGroupTotalPages(0);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load navigation groups."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setGroupsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    groupPage,
    groupPageSize,
    groupSearchTerm,
    groupStatusFilter,
    groupVisibilityFilter,
    showError,
  ]);

  useEffect(() => {
    let isMounted = true;

    const request =
      menuPageSize === "all"
        ? getAllMenus({
            search: menuSearchTerm,
            status: menuStatusFilter,
            visibility: menuVisibilityFilter,
            navigationGroupId: selectedGroupId,
            sortBy: "sort_order",
            sortOrder: "asc",
          })
        : getMenusPage({
            page: menuPage,
            pageSize: Number(menuPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
            search: menuSearchTerm,
            status: menuStatusFilter,
            visibility: menuVisibilityFilter,
            navigationGroupId: selectedGroupId,
            sortBy: "sort_order",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setMenus(response.items);
        setMenuTotalRecords(response.total);
        setMenuTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load menus:", error);
        setMenus([]);
        setMenuTotalRecords(0);
        setMenuTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load menus.");
      })
      .finally(() => {
        if (!isMounted) return;
        setMenusLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    menuPage,
    menuPageSize,
    menuSearchTerm,
    menuStatusFilter,
    menuVisibilityFilter,
    selectedGroupId,
    showError,
  ]);

  useEffect(() => {
    let isMounted = true;

    const request =
      actionPageSize === "all"
        ? getAllMenuActions({
            search: actionSearchTerm,
            status: actionStatusFilter,
            visibility: actionVisibilityFilter,
            menuId: selectedActionMenuId,
            sortBy: "sort_order",
            sortOrder: "asc",
          })
        : getMenuActionsPage({
            page: actionPage,
            pageSize: Number(actionPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
            search: actionSearchTerm,
            status: actionStatusFilter,
            visibility: actionVisibilityFilter,
            menuId: selectedActionMenuId,
            sortBy: "sort_order",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setActions(response.items);
        setActionTotalRecords(response.total);
        setActionTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load menu actions:", error);
        setActions([]);
        setActionTotalRecords(0);
        setActionTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load menu actions."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setActionsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    actionPage,
    actionPageSize,
    actionSearchTerm,
    actionStatusFilter,
    actionVisibilityFilter,
    selectedActionMenuId,
    showError,
  ]);

  const refreshLookups = async () => {
    const [groupsResponse, menusResponse, actionsResponse, permissionResponse] =
      await loadLookups();

    setAllGroups(groupsResponse.items);
    setAllMenus(menusResponse.items);
    setAllActions(actionsResponse.items);
    setPermissions(permissionResponse.items);
  };

  const handleGroupSuccess = () => {
    const wasEditing = Boolean(editingGroup);

    setDrawerMode(null);
    setEditingGroup(null);
    setFormSubmitting(false);

    showSuccess(
      wasEditing
        ? "Navigation group updated successfully."
        : "Navigation group created successfully."
    );

    void loadGroups(false);
    void refreshLookups();
    refreshLiveNavigation();
  };

  const handleMenuSuccess = () => {
    const wasEditing = Boolean(editingMenu);

    setDrawerMode(null);
    setEditingMenu(null);
    setFormSubmitting(false);

    showSuccess(
      wasEditing ? "Menu updated successfully." : "Menu created successfully."
    );

    void loadMenus(false);
    void refreshLookups();
    refreshLiveNavigation();
  };

  const handleActionSuccess = () => {
    const wasEditing = Boolean(editingAction);

    setDrawerMode(null);
    setEditingAction(null);
    setFormSubmitting(false);

    showSuccess(
      wasEditing
        ? "Menu action updated successfully."
        : "Menu action created successfully."
    );

    void loadActions(false);
    void refreshLookups();
    refreshLiveNavigation();
  };

  const handleCloseDrawer = () => {
    setDrawerMode(null);
    setEditingGroup(null);
    setEditingMenu(null);
    setEditingAction(null);
    setFormSubmitting(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;

    try {
      setConfirmLoading(true);

      if (confirmState.target === "group") {
        if (confirmState.action === "inactive") {
          await deactivateNavigationGroup(confirmState.item.id);
          showSuccess("Navigation group marked as inactive successfully.");
        }

        if (confirmState.action === "restore") {
          await restoreNavigationGroup(confirmState.item.id);
          showSuccess("Navigation group restored successfully.");
        }

        if (confirmState.action === "permanent_delete") {
          await permanentlyDeleteNavigationGroup(confirmState.item.id);
          showSuccess("Navigation group permanently deleted successfully.");
        }

        setConfirmState(null);
        await loadGroups(false);
      }

      if (confirmState.target === "menu") {
        if (confirmState.action === "inactive") {
          await deactivateMenu(confirmState.item.id);
          showSuccess("Menu marked as inactive successfully.");
        }

        if (confirmState.action === "restore") {
          await restoreMenu(confirmState.item.id);
          showSuccess("Menu restored successfully.");
        }

        if (confirmState.action === "permanent_delete") {
          await permanentlyDeleteMenu(confirmState.item.id);
          showSuccess("Menu permanently deleted successfully.");
        }

        setConfirmState(null);
        await loadMenus(false);
      }

      if (confirmState.target === "action") {
        if (confirmState.action === "inactive") {
          await deactivateMenuAction(confirmState.item.id);
          showSuccess("Menu action marked as inactive successfully.");
        }

        if (confirmState.action === "restore") {
          await restoreMenuAction(confirmState.item.id);
          showSuccess("Menu action restored successfully.");
        }

        if (confirmState.action === "permanent_delete") {
          await permanentlyDeleteMenuAction(confirmState.item.id);
          showSuccess("Menu action permanently deleted successfully.");
        }

        setConfirmState(null);
        await loadActions(false);
      }

      await refreshLookups();
      refreshLiveNavigation();
    } catch (error) {
      console.error("Navigation builder action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Navigation builder action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState(null);
  };

  const getConfirmTargetName = () => {
    if (confirmState?.target === "group") return "Group";
    if (confirmState?.target === "menu") return "Menu";
    if (confirmState?.target === "action") return "Action";

    return "";
  };

  const getConfirmTitle = () => {
    const target = getConfirmTargetName();

    if (confirmState?.action === "inactive") return `Mark ${target} as Inactive?`;
    if (confirmState?.action === "restore") return `Restore ${target}?`;
    if (confirmState?.action === "permanent_delete") {
      return `Permanently Delete ${target}?`;
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!confirmState) return "";

    const name =
      confirmState.target === "group"
        ? confirmState.item.group_title
        : confirmState.target === "menu"
          ? confirmState.item.menu_title
          : confirmState.item.action_title;

    if (confirmState.action === "inactive") {
      return `Are you sure you want to mark "${name}" as inactive?`;
    }

    if (confirmState.action === "restore") {
      return `Are you sure you want to restore "${name}"?`;
    }

    if (confirmState.action === "permanent_delete") {
      return `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmState?.action === "inactive") return "Mark Inactive";
    if (confirmState?.action === "restore") return "Restore";
    if (confirmState?.action === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmState?.action === "restore") return "success";
    if (confirmState?.action === "inactive") return "warning";

    return "danger";
  };

  const handleGroupPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > groupTotalPages) return;
    setGroupPage(nextPage);
  };

  const handleMenuPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > menuTotalPages) return;
    setMenuPage(nextPage);
  };

  const handleActionPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > actionTotalPages) return;
    setActionPage(nextPage);
  };

  const renderGroupsTable = () => (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <CrudToolbar
        pageSize={groupPageSize}
        onPageSizeChange={(value) => {
          setGroupPageSize(value as CrudPageSizeOption);
          setGroupPage(1);
        }}
        onRefresh={() => {
          void loadGroups(true);
          void refreshLookups();
        }}
        onReset={() => {
          setGroupSearchTerm("");
          setGroupStatusFilter("all");
          setGroupVisibilityFilter("all");
          setGroupPageSize(DEFAULT_CRUD_PAGE_SIZE);
          setGroupPage(1);
        }}
        filters={[
          {
            key: "search",
            label: "Search",
            type: "search",
            value: groupSearchTerm,
            placeholder: "Search group.",
            onChange: (value) => {
              setGroupSearchTerm(value);
              setGroupPage(1);
            },
          },
          {
            key: "visibility",
            label: "Visibility",
            type: "select",
            value: groupVisibilityFilter,
            options: [
              { value: "all", label: "All" },
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
            onChange: (value) => {
              setGroupVisibilityFilter(
                value as NavigationGroupVisibilityFilter
              );
              setGroupPage(1);
            },
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: groupStatusFilter,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            onChange: (value) => {
              setGroupStatusFilter(value as StatusFilter);
              setGroupPage(1);
            },
          },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-sky-50/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">SL</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Group</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Icon</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Parent</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Sort</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Visible</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {groupsLoading ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                  Loading navigation groups...
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                  No navigation group found. Click Add Group to create one.
                </td>
              </tr>
            ) : (
              groups.map((group, index) => {
                const parent = group.parent_group_id
                  ? groupById.get(group.parent_group_id)
                  : null;

                return (
                  <tr
                    key={group.id}
                    className={`transition hover:bg-sky-50/50 ${
                      !group.is_active ? "bg-slate-50 opacity-70" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {groupPageSize === "all"
                        ? index + 1
                        : (groupPage - 1) * numericGroupPageSize + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-blue-600">
                          {renderIcon(group.group_icon, "h-5 w-5")}
                        </div>

                        <div>
                          <div className="font-black text-slate-950">
                            {group.group_title}
                          </div>
                          <div className="mt-1 text-xs font-bold text-slate-500">
                            {group.group_key}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {group.group_icon || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {parent ? parent.group_title : "Root"}
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>Sort {group.sort_order}</CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>
                        {getBooleanLabel(group.is_visible)}
                      </CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudStatusBadge active={group.is_active} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <NavigationGroupRowActions
                        group={group}
                        onEdit={(selected) => {
                          setEditingGroup(selected);
                          setDrawerMode("groups");
                        }}
                        onInactive={(selected) =>
                          setConfirmState({
                            target: "group",
                            action: "inactive",
                            item: selected,
                          })
                        }
                        onRestore={(selected) =>
                          setConfirmState({
                            target: "group",
                            action: "restore",
                            item: selected,
                          })
                        }
                        onPermanentDelete={(selected) =>
                          setConfirmState({
                            target: "group",
                            action: "permanent_delete",
                            item: selected,
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-6 py-5">
        <CrudPagination
          page={groupPage}
          totalPages={groupTotalPages}
          total={groupTotalRecords}
          pageSize={numericGroupPageSize}
          onPageChange={handleGroupPageChange}
        />
      </div>
    </section>
  );

  const renderMenusTable = () => (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <CrudToolbar
        pageSize={menuPageSize}
        onPageSizeChange={(value) => {
          setMenuPageSize(value as CrudPageSizeOption);
          setMenuPage(1);
        }}
        onRefresh={() => {
          void loadMenus(true);
          void refreshLookups();
        }}
        onReset={() => {
          setMenuSearchTerm("");
          setMenuStatusFilter("all");
          setMenuVisibilityFilter("all");
          setGroupFilter("all");
          setMenuPageSize(DEFAULT_CRUD_PAGE_SIZE);
          setMenuPage(1);
        }}
        filters={[
          {
            key: "search",
            label: "Search",
            type: "search",
            value: menuSearchTerm,
            placeholder: "Search menu.",
            onChange: (value) => {
              setMenuSearchTerm(value);
              setMenuPage(1);
            },
          },
          {
            key: "group",
            label: "Group",
            type: "select",
            value: groupFilter,
            options: [
              { value: "all", label: "All Groups" },
              ...allGroups.map((group) => ({
                value: String(group.id),
                label: group.group_title,
              })),
            ],
            onChange: (value) => {
              setGroupFilter(value);
              setMenuPage(1);
            },
          },
          {
            key: "visibility",
            label: "Visibility",
            type: "select",
            value: menuVisibilityFilter,
            options: [
              { value: "all", label: "All" },
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
            onChange: (value) => {
              setMenuVisibilityFilter(value as MenuVisibilityFilter);
              setMenuPage(1);
            },
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: menuStatusFilter,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            onChange: (value) => {
              setMenuStatusFilter(value as StatusFilter);
              setMenuPage(1);
            },
          },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-sky-50/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">SL</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Menu</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Group</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Parent</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Route</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Level / Sort</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Visible</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {menusLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  Loading menus...
                </td>
              </tr>
            ) : menus.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  No menu data found. Click Add Menu to create one.
                </td>
              </tr>
            ) : (
              menus.map((menu, index) => {
                const group = menu.navigation_group_id
                  ? groupById.get(menu.navigation_group_id)
                  : null;
                const parent = menu.parent_menu_id
                  ? menuById.get(menu.parent_menu_id)
                  : null;

                return (
                  <tr
                    key={menu.id}
                    className={`transition hover:bg-sky-50/50 ${
                      !menu.is_active ? "bg-slate-50 opacity-70" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {menuPageSize === "all"
                        ? index + 1
                        : (menuPage - 1) * numericMenuPageSize + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-black text-slate-950">
                        {menu.menu_title}
                      </div>
                      <div className="mt-1 text-xs font-bold text-slate-500">
                        {menu.menu_key}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {group?.group_title || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {parent ? parent.menu_title : "Root"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <span className="line-clamp-1">
                        {getMenuDisplayPath(menu)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <CrudPillBadge>Level {menu.menu_level}</CrudPillBadge>
                        <span className="text-xs font-semibold text-slate-500">
                          Sort {menu.sort_order}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>
                        {getBooleanLabel(menu.is_visible)}
                      </CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudStatusBadge active={menu.is_active} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <MenuRowActions
                        menu={menu}
                        onEdit={(selected) => {
                          setEditingMenu(selected);
                          setDrawerMode("menus");
                        }}
                        onInactive={(selected) =>
                          setConfirmState({
                            target: "menu",
                            action: "inactive",
                            item: selected,
                          })
                        }
                        onRestore={(selected) =>
                          setConfirmState({
                            target: "menu",
                            action: "restore",
                            item: selected,
                          })
                        }
                        onPermanentDelete={(selected) =>
                          setConfirmState({
                            target: "menu",
                            action: "permanent_delete",
                            item: selected,
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-6 py-5">
        <CrudPagination
          page={menuPage}
          totalPages={menuTotalPages}
          total={menuTotalRecords}
          pageSize={numericMenuPageSize}
          onPageChange={handleMenuPageChange}
        />
      </div>
    </section>
  );

  const renderActionsTable = () => (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <CrudToolbar
        pageSize={actionPageSize}
        onPageSizeChange={(value) => {
          setActionPageSize(value as CrudPageSizeOption);
          setActionPage(1);
        }}
        onRefresh={() => {
          void loadActions(true);
          void refreshLookups();
        }}
        onReset={() => {
          setActionSearchTerm("");
          setActionStatusFilter("all");
          setActionVisibilityFilter("all");
          setActionMenuFilter("all");
          setActionPageSize(DEFAULT_CRUD_PAGE_SIZE);
          setActionPage(1);
        }}
        filters={[
          {
            key: "search",
            label: "Search",
            type: "search",
            value: actionSearchTerm,
            placeholder: "Search action.",
            onChange: (value) => {
              setActionSearchTerm(value);
              setActionPage(1);
            },
          },
          {
            key: "menu",
            label: "Menu",
            type: "select",
            value: actionMenuFilter,
            options: [
              { value: "all", label: "All Menus" },
              ...allMenus.map((menu) => ({
                value: String(menu.id),
                label: menu.menu_title,
              })),
            ],
            onChange: (value) => {
              setActionMenuFilter(value);
              setActionPage(1);
            },
          },
          {
            key: "visibility",
            label: "Visibility",
            type: "select",
            value: actionVisibilityFilter,
            options: [
              { value: "all", label: "All" },
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
            onChange: (value) => {
              setActionVisibilityFilter(value as MenuActionVisibilityFilter);
              setActionPage(1);
            },
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: actionStatusFilter,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            onChange: (value) => {
              setActionStatusFilter(value as StatusFilter);
              setActionPage(1);
            },
          },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-sky-50/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">SL</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Menu</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Permission Key</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Button</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Sort</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Visible</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {actionsLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  Loading menu actions...
                </td>
              </tr>
            ) : actions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  No menu action found. Click Add Action to create one.
                </td>
              </tr>
            ) : (
              actions.map((action, index) => {
                const menu = menuById.get(action.menu_id);

                return (
                  <tr
                    key={action.id}
                    className={`transition hover:bg-sky-50/50 ${
                      !action.is_active ? "bg-slate-50 opacity-70" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {actionPageSize === "all"
                        ? index + 1
                        : (actionPage - 1) * numericActionPageSize + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-black text-slate-950">
                        {action.action_title}
                      </div>
                      <div className="mt-1 text-xs font-bold text-slate-500">
                        {action.action_key}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {menu?.menu_title || `Menu #${action.menu_id}`}
                    </td>

                    <td className="px-5 py-4">
                      <span className="line-clamp-1 font-mono text-xs font-bold text-slate-600">
                        {action.permission_key}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold">
                          Icon: {action.button_icon || "-"}
                        </span>
                        <span className="text-xs font-bold">
                          Color: {action.button_color || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>Sort {action.sort_order}</CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>
                        {getBooleanLabel(action.is_visible)}
                      </CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudStatusBadge active={action.is_active} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <MenuActionRowActions
                        action={action}
                        onEdit={(selected) => {
                          setEditingAction(selected);
                          setDrawerMode("actions");
                        }}
                        onInactive={(selected) =>
                          setConfirmState({
                            target: "action",
                            action: "inactive",
                            item: selected,
                          })
                        }
                        onRestore={(selected) =>
                          setConfirmState({
                            target: "action",
                            action: "restore",
                            item: selected,
                          })
                        }
                        onPermanentDelete={(selected) =>
                          setConfirmState({
                            target: "action",
                            action: "permanent_delete",
                            item: selected,
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-6 py-5">
        <CrudPagination
          page={actionPage}
          totalPages={actionTotalPages}
          total={actionTotalRecords}
          pageSize={numericActionPageSize}
          onPageChange={handleActionPageChange}
        />
      </div>
    </section>
  );

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-linear-to-br from-white via-slate-50 to-sky-50 shadow-xl shadow-sky-100/60">
          <div className="relative overflow-hidden px-6 py-7">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-20 h-32 w-32 rounded-full bg-cyan-200/30 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-blue-700 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Security Foundation
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                  Navigation Builder
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                  Design, organize, and control AMS sidebar groups, menus,
                  actions, hierarchy, route paths, icons and visibility from one elegant place.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("groups");
                    setEditingGroup(null);
                    setDrawerMode("groups");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("menus");
                    setEditingMenu(null);
                    setDrawerMode("menus");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/80 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-sky-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Menu
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("actions");
                    setEditingAction(null);
                    setDrawerMode("actions");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/80 px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Action
                </button>

                <button
                  type="button"
                  onClick={() => showSuccess("Export feature will be implemented in the next phase.")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => showSuccess("Import feature will be implemented in the next phase.")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
              </div>
            </div>

            <div className="relative mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total Groups"
                value={summary.totalGroups}
                hint="Sidebar sections"
                icon={<Layers3 className="h-5 w-5" />}
              />
              <SummaryCard
                label="Total Menus"
                value={summary.totalMenus}
                hint="Navigation entries"
                icon={<MenuIcon className="h-5 w-5" />}
              />
              <SummaryCard
                label="Total Actions"
                value={summary.totalActions}
                hint="Buttons and operations"
                icon={<MousePointerClick className="h-5 w-5" />}
              />
              <SummaryCard
                label="Hidden Items"
                value={summary.hiddenItems}
                hint="Groups, menus, actions"
                icon={<EyeOff className="h-5 w-5" />}
              />
            </div>
          </div>

          <div className="border-t border-sky-100 bg-white/70 px-6 py-4 backdrop-blur">
            <div className="inline-flex rounded-2xl border border-sky-100 bg-sky-50/80 p-1 shadow-sm">
              {[
                { key: "groups" as const, label: "Groups", icon: Layers3 },
                { key: "menus" as const, label: "Menus", icon: MenuIcon },
                {
                  key: "actions" as const,
                  label: "Actions",
                  icon: MousePointerClick,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition ${
                      selected
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {successMessage || errorMessage ? (
          <div>
            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "groups" ? renderGroupsTable() : null}
        {activeTab === "menus" ? renderMenusTable() : null}
        {activeTab === "actions" ? renderActionsTable() : null}
      </div>

      <CrudDrawer
        isOpen={Boolean(drawerMode)}
        title={
          drawerMode === "groups"
            ? editingGroup
              ? "Edit Navigation Group"
              : "Create Navigation Group"
            : drawerMode === "menus"
              ? editingMenu
                ? "Edit Menu"
                : "Create Menu"
              : editingAction
                ? "Edit Menu Action"
                : "Create Menu Action"
        }
        description={
          drawerMode === "groups"
            ? "Create and maintain sidebar sections, icons, ordering, visibility and group-level access."
            : drawerMode === "menus"
              ? "Create and maintain navigation menu hierarchy, route path, icon, permission key and visibility."
              : "Create and maintain menu buttons/actions, permission key, icon, color, ordering and visibility."
        }
        onClose={handleCloseDrawer}
        maxWidthClassName="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseDrawer}
              disabled={formSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={
                drawerMode === "groups"
                  ? groupFormId
                  : drawerMode === "menus"
                    ? menuFormId
                    : menuActionFormId
              }
              disabled={formSubmitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {formSubmitting
                ? "Saving..."
                : drawerMode === "groups"
                  ? editingGroup
                    ? "Update Group"
                    : "Save Group"
                  : drawerMode === "menus"
                    ? editingMenu
                      ? "Update Menu"
                      : "Save Menu"
                    : editingAction
                      ? "Update Action"
                      : "Save Action"}
            </button>
          </>
        }
      >
        {drawerMode === "groups" ? (
          <NavigationGroupForm
            key={editingGroup ? `edit-group-${editingGroup.id}` : "create-group"}
            initialData={editingGroup}
            groups={allGroups}
            onSuccess={handleGroupSuccess}
            onCancel={handleCloseDrawer}
            formId={groupFormId}
            hideFooter
            onSubmittingChange={setFormSubmitting}
          />
        ) : null}

        {drawerMode === "menus" ? (
          <MenuForm
            key={editingMenu ? `edit-menu-${editingMenu.id}` : "create-menu"}
            initialData={editingMenu}
            navigationGroups={allGroups}
            menus={allMenus}
            onSuccess={handleMenuSuccess}
            onCancel={handleCloseDrawer}
            formId={menuFormId}
            hideFooter
            onSubmittingChange={setFormSubmitting}
          />
        ) : null}

        {drawerMode === "actions" ? (
          <MenuActionForm
            key={
              editingAction
                ? `edit-menu-action-${editingAction.id}`
                : "create-menu-action"
            }
            initialData={editingAction}
            menus={allMenus}
            permissions={permissions}
            onSuccess={handleActionSuccess}
            onCancel={handleCloseDrawer}
            formId={menuActionFormId}
            hideFooter
            onSubmittingChange={setFormSubmitting}
          />
        ) : null}
      </CrudDrawer>

      <ConfirmModal
        open={Boolean(confirmState)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </>
  );
}

export default function MenusPage() {
  return <MenusContent />;
}
''', encoding="utf-8")

text = page_path.read_text(encoding="utf-8")
checks = {
    "actions tab type": 'type BuilderTab = "groups" | "menus" | "actions"' in text,
    "MenuAction imports": "MenuActionForm" in text and "MenuActionRowActions" in text,
    "menu action service imports": "getMenuActionsPage" in text and "deactivateMenuAction" in text,
    "actions table": "renderActionsTable" in text,
    "add action button": "Add Action" in text,
    "drawer action form": "Create Menu Action" in text and "MenuActionForm" in text,
}

print("C23.7B Actions tab integrated into Navigation Builder.")
print("\nVERIFY")
for name, ok in checks.items():
    print(f"{'OK ' if ok else 'BAD'} - {name}")

if not all(checks.values()):
    raise RuntimeError("C23.7B verification failed.")
'@ | python -
Then run:

cd E:\Audit\AMS\frontend

npm run lint
npm run build
Browser test
Go to:

/security/menus
Check:

✅ Groups tab still works
✅ Menus tab still works
✅ Actions tab visible
✅ Actions table loads
✅ Add Action drawer opens
✅ Edit Action drawer opens
✅ Action create/update works
✅ Inactive / Restore works
✅ Permanent delete shows backend validation if mappings exist
Then status:

cd E:\Audit\AMS

git status --short
Expected:

 M frontend/src/app/(protected)/security/menus/page.tsx
?? frontend/src/components/menus/MenuActionForm.tsx
?? frontend/src/components/menus/MenuActionRowActions.tsx
?? frontend/src/services/menuAction.ts
?? frontend/src/types/menuAction.ts
?? "Dynamic Navigation v2.md"

C23.7B Actions tab integrated into Navigation Builder.

VERIFY
OK  - actions tab type
OK  - MenuAction imports
OK  - menu action service imports
OK  - actions table
OK  - add action button
OK  - drawer action form
PS E:\Audit\AMS> cd E:\Audit\AMS\frontend
PS E:\Audit\AMS\frontend> 
PS E:\Audit\AMS\frontend> npm run lint

> frontend@0.1.0 lint
> eslint


E:\Audit\AMS\frontend\src\app\(protected)\security\menus\page.tsx
  8:3  warning  'Eye' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)

PS E:\Audit\AMS\frontend> npm run build

> frontend@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 6.5s
✓ Finished TypeScript in 11.6s    
✓ Collecting page data using 7 workers in 1881ms    
✓ Generating static pages using 7 workers (38/38) in 962ms
✓ Finalizing page optimization in 40ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/backend/[...path]
├ ƒ /api/branches
├ ƒ /api/branches/[id]
├ ƒ /api/branches/[id]/inactive
├ ƒ /api/companies
├ ƒ /api/companies/[id]
├ ƒ /api/departments
├ ƒ /api/departments/[id]
├ ƒ /api/departments/[id]/inactive
├ ƒ /api/departments/[id]/restore
├ ƒ /api/designations
├ ƒ /api/designations/[id]
├ ƒ /api/designations/[id]/inactive
├ ƒ /api/designations/[id]/restore
├ ƒ /api/employees
├ ƒ /api/employees/[id]
├ ƒ /api/employees/[id]/inactive
├ ƒ /api/employees/[id]/photo
├ ƒ /api/employees/[id]/restore
├ ƒ /api/me/navigation
├ ○ /audit-entities
├ ○ /audit-entity-addresses
├ ○ /audit-entity-business-activities
├ ○ /audit-entity-contacts
├ ○ /audit-entity-directors
├ ○ /audit-entity-exchange-listings
├ ○ /audit-entity-facilities
├ ○ /audit-entity-financial-snapshots
├ ○ /audit-entity-licenses
├ ○ /audit-entity-tax-assessments
├ ○ /audit-subjects
├ ○ /branches
├ ○ /companies
├ ○ /dashboard
├ ○ /departments
├ ○ /designations
├ ○ /employees
├ ○ /login
├ ○ /security/menu-action-permissions
├ ○ /security/menu-permissions
├ ○ /security/menus
├ ○ /security/permissions
├ ○ /security/role-permissions
├ ○ /security/roles
├ ○ /security/user-roles
└ ○ /security/users


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

PS E:\Audit\AMS\frontend> cd E:\Audit\AMS         
PS E:\Audit\AMS> 
PS E:\Audit\AMS> git status --short
 M frontend/src/app/(protected)/security/menus/page.tsx
?? "Dynamic Navigation v2.md"
?? frontend/src/components/menus/MenuActionForm.tsx
?? frontend/src/components/menus/MenuActionRowActions.tsx
?? frontend/src/services/menuAction.ts
?? frontend/src/types/menuAction.ts
PS E:\Audit\AMS> 

Thought for 4s
ভালো ✅ Build pass হয়েছে, কিন্তু lint-এ 1টা warning আছে:

'Eye' is defined but never used
এটা clean করে তারপর final commit করবো।

C23.7C — Fix unused Eye import
Run:

cd E:\Audit\AMS

@'
from pathlib import Path

path = Path(r"frontend\src\app\(protected)\security\menus\page.tsx")
text = path.read_text(encoding="utf-8")

text = text.replace("  Eye,\n", "")

path.write_text(text, encoding="utf-8")

print("Removed unused Eye import from Navigation Builder page.")

after = path.read_text(encoding="utf-8")
if "  Eye,\n" in after:
    raise RuntimeError("Eye import still exists.")
print("OK - unused import removed.")
'@ | python -
Then rerun:

cd E:\Audit\AMS\frontend

npm run lint
npm run build
Expected:

✅ lint no warning
✅ build pass
Then browser test:

/security/menus
Check:

✅ Groups tab works
✅ Menus tab works
✅ Actions tab visible
✅ Actions table loads
✅ Add Action drawer opens
✅ Edit Action drawer opens
✅ Inactive / Restore buttons show
সব ঠিক থাকলে commit:

cd E:\Audit\AMS

git add `
  "frontend/src/app/(protected)/security/menus/page.tsx" `
  "frontend/src/components/menus/MenuActionForm.tsx" `
  "frontend/src/components/menus/MenuActionRowActions.tsx" `
  "frontend/src/services/menuAction.ts" `
  "frontend/src/types/menuAction.ts"

git commit -m "feat: add navigation builder actions tab"

git push origin main

git status --short
Final expected:

?? "Dynamic Navigation v2.md"

done

Thought for a few seconds
Great ✅ Final verification দাও:

cd E:\Audit\AMS

git log --oneline -3
git status --short
Expected latest commit:

feat: add navigation builder actions tab
Expected status:

?? "Dynamic Navigation v2.md"
Output দিলে আমি C23.7 officially close করবো.


PS E:\Audit\AMS> cd E:\Audit\AMS
PS E:\Audit\AMS> 
PS E:\Audit\AMS> git log --oneline -3
a19de85 (HEAD -> main, origin/main) feat: add navigation builder actions tab
5f92341 feat: add navigation builder groups and menus tabs
bfbaf21 feat: polish sidebar theme and mobile navigation
PS E:\Audit\AMS> git status --short
?? "Dynamic Navigation v2.md"
PS E:\Audit\AMS> 

Memory updated
Thought for a couple of seconds
Confirmed ✅ C23.7 officially closed.

a19de85 (HEAD -> main, origin/main) feat: add navigation builder actions tab
5f92341 feat: add navigation builder groups and menus tabs
bfbaf21 feat: polish sidebar theme and mobile navigation
Final status clean আছে, শুধু expected untracked doc:

?? "Dynamic Navigation v2.md"
C23.7 Completed
✅ Navigation Builder Actions tab added
✅ Menu Actions CRUD frontend added
✅ Add/Edit Action drawer added
✅ Action inactive/restore/permanent delete added
✅ Actions table with filter/search/status/visibility/menu filter
✅ Existing menu-action-permissions mapping page untouched
✅ lint/build passed
✅ committed + pushed
Security Navigation Builder এখন:

Security → Menus
├── Groups
├── Menus
└── Actions
RBAC mapping pages remain separate:

/security/menu-permissions
/security/menu-action-permissions
/security/role-permissions
/security/user-roles
Next best checkpoint: full Security/RBAC pages UI consistency audit — duplicate না করে existing pages polish/integration check.



