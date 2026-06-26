Company module-এর permission declare করার best enterprise pattern হবে **৩ layer**-এ:

```text
1. Menu permission  → Sidebar/page access
2. API permission   → Backend security protection
3. Button permission → Frontend button hide/show
```

মানে শুধু `button.company.create` দিলে হবে না। Backend protect করতে হলে `api.company.create` লাগবে। Sidebar/menu দেখাতে হলে `menu.company.view` লাগবে।

---

# 1. Company View Permission

Company page/sidebar দেখার জন্য:

```text
permission_key: menu.company.view
resource_type: menu
resource_key: company
action: view
description: View company menu and page.
```

Company list/view API protect করার জন্য:

```text
permission_key: api.company.view
resource_type: api
resource_key: company
action: view
description: View company records.
```

Button/page action হিসেবে view দরকার হলে:

```text
permission_key: button.company.view
resource_type: button
resource_key: company
action: view
description: View company details button.
```

---

# 2. Company Create Permission

Backend API create protection:

```text
permission_key: api.company.create
resource_type: api
resource_key: company
action: create
description: Create company.
```

Frontend create button show/hide:

```text
permission_key: button.company.create
resource_type: button
resource_key: company
action: create
description: Show company create button.
```

---

# 3. Company Update Permission

Backend update API protection:

```text
permission_key: api.company.update
resource_type: api
resource_key: company
action: update
description: Update company.
```

Frontend edit/update button show/hide:

```text
permission_key: button.company.update
resource_type: button
resource_key: company
action: update
description: Show company update button.
```

---

# 4. Company Inactive Permission

যদি company delete না করে শুধু inactive করো, তাহলে:

```text
permission_key: api.company.inactive
resource_type: api
resource_key: company
action: inactive
description: Mark company as inactive.
```

Frontend inactive button:

```text
permission_key: button.company.inactive
resource_type: button
resource_key: company
action: inactive
description: Show company inactive button.
```

যদি inactive থেকে আবার active করার option থাকে, তাহলে restore permission-ও declare করবে:

```text
permission_key: api.company.restore
resource_type: api
resource_key: company
action: restore
description: Restore inactive company.
```

```text
permission_key: button.company.restore
resource_type: button
resource_key: company
action: restore
description: Show company restore button.
```

---

# 5. Company Delete Permission

যদি permanent delete থাকে:

```text
permission_key: api.company.delete
resource_type: api
resource_key: company
action: delete
description: Delete company permanently.
```

Frontend delete button:

```text
permission_key: button.company.delete
resource_type: button
resource_key: company
action: delete
description: Show company delete button.
```

তোমার system-এ যদি naming `permanent_delete` use করো, তাহলে এভাবে declare করবে:

```text
permission_key: api.company.permanent_delete
resource_type: api
resource_key: company
action: permanent_delete
description: Permanently delete company.
```

```text
permission_key: button.company.permanent_delete
resource_type: button
resource_key: company
action: permanent_delete
description: Show company permanent delete button.
```

---

# Company Module-এর Recommended Final Permission List

```text
menu.company.view

api.company.view
api.company.create
api.company.update
api.company.inactive
api.company.restore
api.company.delete

button.company.view
button.company.create
button.company.update
button.company.inactive
button.company.restore
button.company.delete
```

Export/import থাকলে add করবে:

```text
api.company.export
api.company.import

button.company.export
button.company.import
```

---

# Backend Route-এ কীভাবে use করবে

Company create endpoint:

```py
current_user: User = Depends(require_permission("api.company.create"))
```

Company update endpoint:

```py
current_user: User = Depends(require_permission("api.company.update"))
```

Company inactive endpoint:

```py
current_user: User = Depends(require_permission("api.company.inactive"))
```

Company delete endpoint:

```py
current_user: User = Depends(require_permission("api.company.delete"))
```

---

# Frontend Button-এ কীভাবে use করবে

Company page-এ:

```tsx
const { hasAction } = useNavigation();

const canCreate = hasAction("company", "create");
const canUpdate = hasAction("company", "update");
const canInactive = hasAction("company", "inactive");
const canDelete = hasAction("company", "delete");
```

তারপর:

```tsx
{canCreate && <button>Create Company</button>}
{canUpdate && <button>Edit</button>}
{canInactive && <button>Inactive</button>}
{canDelete && <button>Delete</button>}
```

---

# Short Rule

```text
menu.company.view      → sidebar/page দেখাবে
api.company.create     → backend create allow করবে
button.company.create  → frontend create button দেখাবে
```

তাই Company module-এর জন্য **menu + api + button**—এই ৩ ধরনের permission declare করলেই full RBAC control হবে।
