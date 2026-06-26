হ্যাঁ, **existing all page refactor হবে**, কিন্তু একসাথে সব page ভেঙে refactor করবো না। এটা করলে bug বেশি হবে। আমরা **safe migration strategy** follow করবো।

তোমার uploaded file list-এ দেখা যাচ্ছে already অনেক protected page আছে, যেমন `audit-entities`, `audit-entity-addresses`, `audit-entity-business-activities`, `audit-entity-contacts`, `audit-entity-directors`, `audit-entity-exchange-listings`, `audit-entity-facilities`, `audit-entity-financial-snapshots`, `audit-entity-licenses`, `audit-entity-tax-assessments` ইত্যাদি। 
আর existing `Company` page already কিছু common component use করছে: `DataTableToolbar`, `DataTablePagination`, `ModuleHero`, `PageActionBar`, `RightDrawer`। 

So আমাদের কাজ হবে existing pattern নষ্ট না করে এটাকে আরো generic/enterprise করা।

---

## Final decision

Existing page গুলো **ধাপে ধাপে refactor** হবে।

```text
Big bang refactor করবো না
↓
প্রথমে common CRUD foundation বানাবো
↓
তারপর একেকটা page convert করবো
↓
প্রতিটা page convert করার পর lint + build + browser test
```

---

## কোন page আগে refactor হবে?

Priority হবে এইভাবে:

```text
Phase 1 — Audit Entity Profile attached modules
1. Tax Assessments
2. Financial Snapshots
3. Facilities / Factories
4. Entity Licenses
5. Directors / Owners
6. Entity Contacts
7. Entity Addresses
8. Exchange Listings
9. Business Activities
10. Audit Entities
```

এই group-এ same type UI বেশি: hero, filter, table, pagination, right drawer, create/edit/delete/restore.

তারপর:

```text
Phase 2 — Core Organization modules
Company
Branch
Department
Designation
Employee
```

এগুলো already কিছু common component use করে, তাই refactor সহজ হবে।

শেষে:

```text
Phase 3 — Security/RBAC pages
Roles
Permissions
Users
Role Permissions
User Roles
Menu Permissions
Menu Action Permissions
```

Security pages এখন stable আছে, তাই এগুলো আগে touch করবো না।

---

## কীভাবে manage করবো?

আমরা নতুন common folder বানাবো:

```text
src/components/crud/
```

তার ভিতরে থাকবে:

```text
EnterpriseCrudPage.tsx
CrudToolbar.tsx
CrudTable.tsx
CrudPagination.tsx
CrudDrawer.tsx
CrudStatusBadge.tsx
CrudRowActions.tsx
fields/CrudTextField.tsx
fields/CrudSelectField.tsx
fields/CrudDateField.tsx
fields/CrudNumberField.tsx
fields/CrudTextAreaField.tsx
fields/CrudCheckboxField.tsx
```

আর config থাকবে:

```text
src/config/crud/
taxAssessmentConfig.tsx
financialSnapshotConfig.tsx
facilityConfig.tsx
licenseConfig.tsx
directorConfig.tsx
contactConfig.tsx
addressConfig.tsx
```

---

## Page file কত ছোট হবে?

এখন যেমন `Tax Assessments` page অনেক বড়, refactor করার পরে page হবে প্রায় ২০–৩০ line:

```tsx
"use client";

import { FileSpreadsheet } from "lucide-react";
import EnterpriseCrudPage from "@/components/crud/EnterpriseCrudPage";
import { taxAssessmentConfig } from "@/config/crud/taxAssessmentConfig";

export default function AuditEntityTaxAssessmentsPage() {
  return (
    <EnterpriseCrudPage
      moduleKey="audit_entity_tax_assessment"
      title="Tax Assessments"
      eyebrow="Audit Entity Profile"
      description="Maintain year-wise tax assessment information."
      icon={FileSpreadsheet}
      config={taxAssessmentConfig}
    />
  );
}
```

বাকি সব field, filter, table column, drawer section config file-এ থাকবে।

---

## Important rule

আমরা backend change করবো না। Existing service/API function যতদূর possible same থাকবে।

Refactor mainly হবে frontend UI layer:

```text
page.tsx বড় code কমানো
common toolbar
common table
common pagination
common drawer
common form fields
common permission action rendering
```

---

## Immediate next best step

আগে আমরা **Step C1 — CRUD common foundation** বানাবো। তারপর প্রথমে `Tax Assessments` page convert করবো, কারণ এটা newest এবং এখন আমরা পুরো structure জানি।

তারপর same engine দিয়ে `Financial Snapshots`, `Facilities`, `Licenses`, `Contacts`, `Directors` convert করবো।

মানে yes — existing page refactor হবে, কিন্তু **safe, module-by-module, build-pass checkpoint** দিয়ে।
