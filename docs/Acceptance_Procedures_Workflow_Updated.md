# Acceptance Procedures Workflow

## বিস্তারিত ব্যবহারকারী কার্যপ্রণালী ম্যানুয়াল

এই ম্যানুয়ালটি AMS-এর **Acceptance Procedures** মডিউলে active Audit নির্বাচন, questionnaire সম্পন্ন, উত্তর সংরক্ষণ, saved answer পুনরায় যাচাই এবং নিরাপদ navigation-এর সম্পূর্ণ বর্তমান workflow ব্যাখ্যা করে।

---

## ১. মডিউলটির উদ্দেশ্য

Acceptance Procedures মডিউলের মাধ্যমে Audit শুরু বা চালিয়ে যাওয়ার আগে সংশ্লিষ্ট Client, Engagement Team, Ethical Requirements, Management Integrity এবং Audit সঠিকভাবে সম্পাদনের সক্ষমতা যাচাই করা হয়।

এই মডিউলে:

- নির্দিষ্ট active Audit নির্বাচন করা যায়
- প্রযোজ্য Acceptance Template স্বয়ংক্রিয়ভাবে load হয়
- মোট **৩৩টি Yes/No প্রশ্ন** প্রদর্শিত হয়
- প্রতিটি section আলাদাভাবে expand/collapse করা যায়
- উত্তর দেওয়ার সঙ্গে সঙ্গে completion progress update হয়
- উত্তর database-এ সংরক্ষণ করা যায়
- পূর্বে সংরক্ষিত উত্তর পুনরায় দেখা ও পরিবর্তন করা যায়
- unsaved changes থাকলে page ছাড়ার আগে warning পাওয়া যায়
- questionnaire থেকে selector page-এ ফিরে যাওয়ার জন্য **Back to Audit Selection** button রয়েছে

> গুরুত্বপূর্ণ: সব প্রশ্নে **Yes মানেই ইতিবাচক ফলাফল নয়**। কিছু প্রশ্ন ঝুঁকি, অসঙ্গতি বা নেতিবাচক পরিস্থিতি সম্পর্কে করা হয়েছে। তাই প্রতিটি প্রশ্ন ভালোভাবে পড়ে বাস্তব তথ্য অনুযায়ী উত্তর দিতে হবে।

---

# ২. ব্যবহার শুরুর পূর্বশর্ত

Acceptance Procedures ব্যবহার করার আগে নিচের বিষয়গুলো নিশ্চিত করতে হবে:

| প্রয়োজনীয় বিষয় | বিবরণ |
|---|---|
| User login | ব্যবহারকারীকে AMS-এ login করা থাকতে হবে |
| Audit record | Audit Master-এ সংশ্লিষ্ট Audit তৈরি থাকতে হবে |
| Active Audit | Audit Master record active এবং status `active` হতে হবে |
| Active Client | সংশ্লিষ্ট Client record active হতে হবে |
| Active template | Audit-এর year-end date অনুযায়ী প্রযোজ্য Acceptance Template থাকতে হবে |
| View permission | ব্যবহারকারীর Acceptance Procedures দেখার অনুমতি থাকতে হবে |
| Update permission | উত্তর সংরক্ষণ বা পরিবর্তনের জন্য update permission থাকতে হবে |

### প্রয়োজনীয় system permissions

System Administrator-এর জন্য সংশ্লিষ্ট permissions:

```text
menu.audit_accept_proce.view
api.audit_accept_proce.view
api.audit_accept_proce.update
```

Permissions-এর কাজ:

- `menu.audit_accept_proce.view` — sidebar menu দেখায়
- `api.audit_accept_proce.view` — Audit selector ও questionnaire load করতে দেয়
- `api.audit_accept_proce.update` — উত্তর save/update করতে দেয়

> Audit selector ব্যবহার করার জন্য আলাদা Audit Master list permission প্রয়োজন হয় না। Selector Acceptance Procedures-এর view permission ব্যবহার করে।

---

# ৩. Acceptance Procedures মডিউলে প্রবেশ

## ধাপ ১: AMS-এ Login করুন

Browser থেকে AMS login page খুলুন এবং আপনার User ID ও Password দিয়ে login করুন।

Login সফল হলে Enterprise Dashboard প্রদর্শিত হবে।

---

## ধাপ ২: Sidebar থেকে মডিউলটি খুলুন

বাম পাশের navigation menu থেকে ক্রমানুসারে যান:

```text
Audit
→ Audit Planning
→ Audit Planning Overview
→ Acceptance Procedures
```

**Acceptance Procedures** menu-তে click করলে Audit selection launcher page খুলবে।

---

# ৪. Audit নির্বাচন

Acceptance Procedures launcher page-এ manual Audit ID লিখতে হয় না। System active Audit records থেকে cascading dropdown প্রদর্শন করে।

## Selector-এর ধাপসমূহ

Audit নির্বাচন করতে নিচের ক্রম অনুসরণ করুন:

1. **Audit Year** dropdown থেকে বছর নির্বাচন করুন
2. নির্বাচিত বছরের জন্য **Client** dropdown থেকে Client নির্বাচন করুন
3. নির্বাচিত Client-এর জন্য **Audit Name (Audit ID)** dropdown থেকে Audit নির্বাচন করুন
4. Selected Audit summary যাচাই করুন
5. **Open Acceptance Procedures** button-এ click করুন

Dropdownগুলো নির্ভরশীলভাবে কাজ করে:

```text
Audit Year
   ↓
Client
   ↓
Audit Name (Audit ID)
```

### Dropdown behaviour

- Audit Year নির্বাচন না করা পর্যন্ত Client dropdown disabled থাকতে পারে
- Client নির্বাচন না করা পর্যন্ত Audit Name dropdown disabled থাকতে পারে
- Audit Year পরিবর্তন করলে আগের Client এবং Audit selection reset হবে
- Client পরিবর্তন করলে আগের Audit selection reset হবে
- Audit নির্বাচন হলে selected Audit summary প্রদর্শিত হবে
- Valid Audit নির্বাচন না করা পর্যন্ত **Open Acceptance Procedures** button disabled থাকতে পারে

## কোন Audit records দেখাবে

Selector-এ শুধু নিচের records দেখানো হয়:

- Active Audit Master
- Audit Master status `active`
- Active Client-এর সঙ্গে যুক্ত Audit
- নির্বাচিত Audit Year-এর সঙ্গে মিল থাকা Audit
- নির্বাচিত Client-এর সঙ্গে মিল থাকা Audit

Inactive Audit বা inactive Client dropdown-এ দেখানো হবে না।

## উদাহরণ

```text
Audit Year: 2026
Client: Prime Tech Solutions Ltd
Audit Name: Management Audit-2026 (Audit ID: 3)
```

Audit নির্বাচন হলে summary card-এ সাধারণত দেখা যাবে:

```text
Management Audit-2026 (Audit ID: 3)
Prime Tech Solutions Ltd · Management Audit · 2026
```

Summary সঠিক হলে **Open Acceptance Procedures** button চাপুন।

## Selector load state

Selector data load হওয়ার সময় loading indicator দেখা যেতে পারে।

Data পাওয়া না গেলে empty-state message দেখা যেতে পারে, যেমন:

```text
No active audits are available.
```

Request ব্যর্থ হলে error message এবং retry option দেখা যেতে পারে।

---

# ৫. Questionnaire Page পরিচিতি

Audit load হওয়ার পর page-এর উপরের অংশে Audit সম্পর্কিত গুরুত্বপূর্ণ তথ্য দেখা যাবে।

## Header Information

| Field | অর্থ |
|---|---|
| Client | যে প্রতিষ্ঠানের Audit করা হচ্ছে |
| Audit | Audit-এর নাম অথবা Audit Type |
| Audit Number | বর্তমান Audit ID |
| Audit Year | Audit-এর অর্থবছর বা নির্ধারিত বছর |
| Year End | Audit-এর year-end date |
| Template | ব্যবহৃত Acceptance Procedures template |
| Version | Template version |
| Reference | Template reference number, যেমন `C1.1` |

উদাহরণ:

```text
Client: Prime Tech Solutions Ltd
Audit: Management Audit-2026
Audit #3
Year: 2026
Year End: 02 Jul 2026
Template: Acceptance Procedures
Version: 1.0
Reference: C1.1
```

Audit বা Client ভুল মনে হলে উত্তর দেওয়ার আগে **Back to Audit Selection** button ব্যবহার করে selector page-এ ফিরে সঠিক Audit নির্বাচন করুন।

---

# ৬. Back to Audit Selection Button

Questionnaire header-এর ডান পাশে সাধারণত দেখা যাবে:

```text
Back to Audit Selection
Audit #3
2026
```

## Saved অবস্থায়

কোনো unsaved change না থাকলে **Back to Audit Selection** button চাপলে confirmation ছাড়াই selector page-এ ফিরে যাবে।

Selector page URL:

```text
/audit-planning/audit-accept-proce
```

## Unsaved অবস্থায়

Unsaved changes থাকলে Back button চাপলে confirmation dialog দেখা যাবে:

```text
You have unsaved changes. Return to Audit selection and discard them?
```

এরপর:

- **Cancel** চাপলে questionnaire page-এই থাকা যাবে
- **OK** চাপলে unsaved changes discard হয়ে selector page খুলবে
- উত্তর রাখতে হলে page ছাড়ার আগে **Save Responses** চাপতে হবে

---

# ৭. Section এবং প্রশ্ন বোঝা

Questionnaire-টি একাধিক section-এ বিভক্ত।

উদাহরণ:

```text
Ethical Requirements
Client Integrity
Engagement Considerations
Proper Performance
Conclusion
Signature
```

প্রতিটি section header-এ সাধারণত দেখা যাবে:

- Section number
- Section title
- Section-এর মোট প্রশ্ন
- কতটি প্রশ্ন answered হয়েছে
- Expand/collapse icon

উদাহরণ:

```text
13 Proper Performance
2 of 2 answered
```

এর অর্থ:

- Section নম্বর: 13
- Section নাম: Proper Performance
- মোট ২টি প্রশ্ন
- ২টিই answered

---

# ৮. Section খোলা ও বন্ধ করা

## একটি Section Expand করতে

Section header-এ click করুন।

Expand হলে section-এর প্রশ্নগুলো দেখা যাবে।

## Section Collapse করতে

খোলা section-এর header-এ আবার click করুন।

## সব Section একসঙ্গে নিয়ন্ত্রণ

Page-এ উপলব্ধ controls:

- **Expand All** — সব section খুলবে
- **Collapse All** — সব section বন্ধ করবে

বড় questionnaire দ্রুত review করার জন্য এই controls ব্যবহার করা সুবিধাজনক।

---

# ৯. Yes/No উত্তর প্রদান

প্রতিটি applicable question-এর ডান পাশে দুইটি option থাকবে:

```text
Yes
No
```

## উত্তর দেওয়ার নিয়ম

1. প্রশ্নটি সম্পূর্ণ পড়ুন
2. Client file, engagement information এবং supporting documents যাচাই করুন
3. বাস্তব পরিস্থিতি অনুযায়ী `Yes` অথবা `No` নির্বাচন করুন
4. নির্বাচিত option highlight হবে
5. Progress সঙ্গে সঙ্গে update হবে

### উদাহরণ

প্রশ্ন:

> Are there any issues concerning the integrity of the principal owners, key management or those charged with governance of the entity?

যদি integrity concern থাকে:

```text
Yes
```

Concern না থাকলে:

```text
No
```

এখানে `Yes` একটি risk indication হতে পারে। তাই শুধু সব প্রশ্নে Yes নির্বাচন করা উচিত নয়।

## নির্বাচিত উত্তর সরানো

ভুল করে কোনো option নির্বাচন করলে:

- নির্বাচিত `Yes`-এ আবার click করলে উত্তর unselect হবে
- নির্বাচিত `No`-তে আবার click করলে উত্তর unselect হবে

Unselect হলে প্রশ্নটি আবার unanswered হিসেবে গণ্য হবে।

---

# ১০. Completion Progress

Page-এর উপরের progress section-এ বর্তমান completion status দেখা যাবে।

উদাহরণ:

```text
Completion progress
33 of 33 questions answered
100%

33 Answered
0 Remaining
```

## Progress কীভাবে গণনা হয়

```text
Completion % =
Answered Questions ÷ Total Questions × 100
```

### সম্ভাব্য অবস্থা

| Progress | অর্থ |
|---:|---|
| 0% | কোনো প্রশ্ন answered হয়নি |
| 50% | অর্ধেক প্রশ্ন answered |
| 100% | সব প্রশ্ন answered |

Progress bar প্রতিবার উত্তর পরিবর্তনের সঙ্গে সঙ্গে update হবে।

---

# ১১. Unsaved Changes অবস্থা

কোনো উত্তর নতুন করে select, পরিবর্তন বা unselect করলে page dirty state-এ যাবে।

তখন নিচের sticky save bar-এ দেখা যাবে:

```text
You have unsaved changes
```

এই অবস্থায় নিচের কাজগুলো করলে unsaved answer হারাতে পারে:

- Browser tab বন্ধ করা
- Page refresh করা
- অন্য page-এ যাওয়া
- **Back to Audit Selection** button চাপা

Browser refresh বা tab বন্ধ করার সময় system browser warning দেখাতে পারে।

Back button ব্যবহার করলে application confirmation dialog দেখাবে।

উত্তর রাখতে হলে page ছাড়ার আগে **Save Responses** চাপুন।

---

# ১২. উত্তর সংরক্ষণ

সব প্রয়োজনীয় উত্তর দেওয়ার পর:

1. Page-এর নিচের sticky bar দেখুন
2. Answered এবং Remaining count যাচাই করুন
3. **Save Responses** button-এ click করুন
4. Save চলাকালে button loading অবস্থায় যেতে পারে
5. সফল হলে success message দেখা যাবে

সফল message:

```text
Acceptance Procedures responses saved successfully.
```

Save সফল হওয়ার পর sticky bar-এ দেখা যাবে:

```text
All changes are saved
```

এবং Save button disabled হতে পারে, কারণ নতুন কোনো পরিবর্তন বাকি নেই।

---

# ১৩. উত্তর পরিবর্তন বা সংশোধন

পূর্বে saved answer পরিবর্তন করতে:

1. Acceptance Procedures selector page খুলুন
2. একই Audit Year নির্বাচন করুন
3. একই Client নির্বাচন করুন
4. একই Audit Name (Audit ID) নির্বাচন করুন
5. Questionnaire খুলুন
6. যে section-এর answer পরিবর্তন করতে চান সেটি expand করুন
7. নতুন `Yes` অথবা `No` নির্বাচন করুন
8. Sticky bar-এ unsaved changes message দেখা যাবে
9. **Save Responses** click করুন

নতুন উত্তর পূর্বের saved answer update করবে।

---

# ১৪. Saved Answer যাচাই

উত্তর সফলভাবে save হয়েছে কি না যাচাই করতে:

1. Save success message আসা পর্যন্ত অপেক্ষা করুন
2. Page refresh করুন অথবা **Back to Audit Selection** ব্যবহার করুন
3. একই Audit Year, Client এবং Audit Name আবার নির্বাচন করুন
4. Questionnaire পুনরায় খুলুন
5. পূর্বে নির্বাচিত Yes/No options selected অবস্থায় আছে কি না দেখুন
6. Progress count আগের মতো আছে কি না যাচাই করুন

উদাহরণ:

```text
33 of 33 questions answered
All changes are saved
```

এটি নির্দেশ করে saved data পুনরায় সঠিকভাবে load হয়েছে।

---

# ১৫. View-Only Mode

ব্যবহারকারীর view permission থাকলেও update permission না থাকলে page view-only mode-এ খুলতে পারে।

এই অবস্থায়:

- Saved answers দেখা যাবে
- Section expand/collapse করা যাবে
- Progress দেখা যাবে
- Yes/No পরিবর্তন করা যাবে না
- Save button থাকবে না অথবা disabled থাকবে
- Header-এ `View only` badge দেখা যেতে পারে
- **Back to Audit Selection** ব্যবহার করা যাবে

Permission পরিবর্তনের জন্য System Administrator-এর সঙ্গে যোগাযোগ করতে হবে।

---

# ১৬. Keyboard দিয়ে ব্যবহার

Mouse ছাড়াও keyboard দিয়ে module ব্যবহার করা যায়।

| Key | কাজ |
|---|---|
| `Tab` | পরবর্তী button বা control-এ যাওয়া |
| `Shift + Tab` | পূর্ববর্তী control-এ যাওয়া |
| `Enter` | Focus করা button activate করা |
| `Space` | Yes/No অথবা accordion activate করা |

Keyboard ব্যবহারকারীদের জন্য focus indicator অনুসরণ করে কাজ করতে হবে।

---

# ১৭. সাধারণ Error এবং সমাধান

## Access Denied

Message:

```text
You do not have permission to view Acceptance Procedures.
```

### সম্ভাব্য কারণ

- View action permission নেই
- Role permission inactive
- নতুন permission seed হওয়ার পর পুরোনো login session চালু আছে

### সমাধান

1. Logout করুন
2. আবার login করুন
3. `Ctrl + Shift + R` দিয়ে hard refresh করুন
4. সমস্যা থাকলে Administrator permission যাচাই করবেন

---

## Selector Load Failed

### সম্ভাব্য কারণ

- Backend server unavailable
- Network request ব্যর্থ হয়েছে
- User session expired
- API view permission নেই

### সমাধান

1. Page refresh করুন
2. Retry option থাকলে click করুন
3. Logout করে আবার login করুন
4. Backend service চালু আছে কি না যাচাই করুন
5. Administrator `api.audit_accept_proce.view` permission যাচাই করবেন

---

## Selector Empty

### সম্ভাব্য কারণ

- নির্বাচিত Audit Year-এর জন্য কোনো active Audit নেই
- সংশ্লিষ্ট Client inactive
- Audit Master inactive
- Audit Master status `active` নয়
- Audit record অন্য year-এর

### সমাধান

1. অন্য Audit Year নির্বাচন করে দেখুন
2. Client dropdown-এর available options যাচাই করুন
3. Audit Master-এর active status যাচাই করুন
4. Client-এর active status যাচাই করুন
5. Audit Master-এর status field `active` কি না যাচাই করুন

---

## Questionnaire Unavailable

### সম্ভাব্য কারণ

- Selector থেকে নির্বাচিত Audit পরে inactive করা হয়েছে
- Audit record database-এ আর available নেই
- User permission পরিবর্তন হয়েছে
- Backend service unavailable

### সমাধান

**Back to Audit Selection** ব্যবহার করে available active Audit পুনরায় নির্বাচন করুন।

সমস্যা থাকলে Administrator-কে নিচের তথ্য দিন:

- Audit Year
- Client
- Audit Name
- Audit ID
- Error message
- ঘটনার সময়

---

## No Applicable Template

সম্ভাব্য message:

```text
No active Acceptance Procedures template is applicable to this audit.
```

### সম্ভাব্য কারণ

- Audit year-end date অনুযায়ী active template নেই
- Template effective date range Audit-এর সঙ্গে মিলছে না
- Template inactive

### সমাধান

System Administrator বা Audit Configuration team template effective date ও active status যাচাই করবেন।

---

## Save Button Disabled

### কারণ হতে পারে

- কোনো answer পরিবর্তন করা হয়নি
- সব changes আগেই save হয়েছে
- User-এর update permission নেই
- Save request বর্তমানে processing হচ্ছে

`All changes are saved` দেখা গেলে disabled Save button স্বাভাবিক।

---

## Save Failed

### করণীয়

1. Internet বা local server connection পরীক্ষা করুন
2. Page refresh করার আগে current answers note করুন
3. আবার Save করুন
4. বারবার ব্যর্থ হলে error message Administrator-কে দিন
5. Audit Name, Audit ID এবং ঘটনার সময় উল্লেখ করুন

---

# ১৮. ব্যবহারকারীর জন্য Best Practices

## উত্তর দেওয়ার আগে

- সঠিক Audit Year নির্বাচন করা হয়েছে কি না যাচাই করুন
- সঠিক Client নির্বাচন করা হয়েছে কি না যাচাই করুন
- সঠিক Audit Name (Audit ID) নির্বাচন করা হয়েছে কি না যাচাই করুন
- Audit year এবং year-end date পরীক্ষা করুন
- Client acceptance documents হাতে রাখুন
- প্রতিটি প্রশ্নের wording ভালোভাবে পড়ুন

## উত্তর দেওয়ার সময়

- অনুমানভিত্তিক উত্তর দেবেন না
- Risk-related প্রশ্নে supporting evidence যাচাই করুন
- `Yes` সবসময় positive এবং `No` সবসময় negative—এমন ধরে নেবেন না
- অসম্পূর্ণ তথ্য থাকলে সংশ্লিষ্ট Senior বা Manager-এর সঙ্গে আলোচনা করুন

## Save করার সময়

- Progress count যাচাই করুন
- Unanswered questions আছে কি না দেখুন
- Save success message না আসা পর্যন্ত page বন্ধ করবেন না
- Save শেষে refresh বা পুনরায় Audit খুলে persistence যাচাই করুন

## Page ছাড়ার সময়

- `All changes are saved` দেখা যাচ্ছে কি না যাচাই করুন
- Unsaved changes থাকলে Back button-এর confirmation বুঝে নির্বাচন করুন
- দরকারি উত্তর save না করে **OK** চাপবেন না

---

# ১৯. সম্পূর্ণ Workflow সংক্ষেপ

```text
Login
   ↓
Audit Menu
   ↓
Audit Planning
   ↓
Acceptance Procedures
   ↓
Audit Year নির্বাচন
   ↓
Client নির্বাচন
   ↓
Audit Name (Audit ID) নির্বাচন
   ↓
Selected Audit summary যাচাই
   ↓
Open Acceptance Procedures
   ↓
Client ও Audit তথ্য যাচাই
   ↓
প্রতিটি Section খুলুন
   ↓
প্রশ্ন অনুযায়ী Yes/No দিন
   ↓
Completion Progress যাচাই করুন
   ↓
Save Responses
   ↓
Success Message নিশ্চিত করুন
   ↓
Refresh অথবা পুনরায় Audit খুলে Saved Answers যাচাই করুন
   ↓
Back to Audit Selection
```

---

# ২০. ব্যবহারকারী Completion Checklist

কাজ শেষ করার আগে নিশ্চিত করুন:

- [ ] সঠিক Audit Year নির্বাচন করা হয়েছে
- [ ] সঠিক Client নির্বাচন করা হয়েছে
- [ ] সঠিক Audit Name (Audit ID) নির্বাচন করা হয়েছে
- [ ] Selected Audit summary সঠিক
- [ ] সঠিক year-end date দেখা গেছে
- [ ] প্রযোজ্য template এবং reference যাচাই করা হয়েছে
- [ ] প্রতিটি প্রশ্ন মনোযোগ দিয়ে পড়া হয়েছে
- [ ] সব applicable প্রশ্নের উত্তর দেওয়া হয়েছে
- [ ] Progress `100%` হয়েছে
- [ ] `Save Responses` click করা হয়েছে
- [ ] Success message দেখা গেছে
- [ ] `All changes are saved` দেখা গেছে
- [ ] Refresh বা পুনরায় open করার পর saved answers load হয়েছে
- [ ] Back to Audit Selection button সঠিকভাবে কাজ করছে
- [ ] Unsaved-change confirmation পরীক্ষা করা হয়েছে

---

# ২১. Administrator Checklist

System Administrator নিশ্চিত করবেন:

- Acceptance menu active ও visible
- সঠিক parent menu-এর অধীনে module অবস্থান করছে
- User role-এ menu view permission আছে
- API view/update permissions active
- View এবং Update menu actions configured
- Role permissions active
- Audit Master active
- Audit Master status `active`
- সংশ্লিষ্ট Client active
- Acceptance template active
- Template effective date Audit-এর year-end date-এর সঙ্গে applicable
- Database migration current head-এ আছে
- Selector endpoint permission-safe
- Selector route dynamic Audit route-এর আগে registered
- Inactive Audit বা inactive Client selector-এ না আসে

### সংশ্লিষ্ট API endpoints

```text
GET /audit-acceptance/selector-options
GET /audit-acceptance/{audit_id}
PUT /audit-acceptance/{audit_id}/responses
```

### বর্তমান Acceptance RBAC migration revision

```text
c265acceptactions
```

---

## সমাপ্তি

Acceptance Procedures workflow ব্যবহার করে Audit গ্রহণের আগে গুরুত্বপূর্ণ ethical, operational এবং client-related risk systematically যাচাই করা যায়।

সঠিক Audit Year, Client ও Audit নির্বাচন, প্রশ্নের wording অনুযায়ী সত্যনিষ্ঠ উত্তর, progress verification, successful save confirmation এবং নিরাপদ navigation অনুসরণ করলে ব্যবহারকারী workflowটি সহজে ও নির্ভুলভাবে সম্পন্ন করতে পারবেন। ✅
