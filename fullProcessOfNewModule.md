Production access control-এর জন্য এটা দরকার নেই।

## Real module-এর permission কিভাবে declare করবে?

যে module সত্যি আছে, যেমন **Company**, তার জন্য permission declare করবে:

```text
menu.company.view
api.company.create
api.company.update
api.company.inactive
api.company.delete
button.company.create
button.company.update
button.company.inactive
button.company.delete
```

এখানে `company` real module, কারণ:

```text
✅ Company page আছে
✅ Company backend API আছে
✅ Company sidebar menu আছে
✅ Company buttons আছে
```

## নতুন module add করতে হলে full process

ধরো নতুন module হবে `Audit Plan`। তাহলে শুধু permission create করলে হবে না। এই full cycle লাগবে:

```text
1. Backend model/schema/repository/service/api create
2. Frontend page create
3. Navigation menu seed create
4. Permissions seed create
5. Menu permission mapping
6. Menu action/button seed
7. Menu action permission mapping
8. Role Permissions assign
9. User Roles assign
10. Logout/Login করে test
```

## সহজ rule

```text
Permission = চাবি
Module/Page/API/Button = দরজা
Role Permission = কার হাতে চাবি থাকবে
User Role = কোন user সেই role পাবে
```

চাবি বানালেই দরজা auto তৈরি হয় না।

তাই `test.permission.view` হলো শুধু test key। Real কাজের জন্য existing module যেমন `company`, `branch`, `department`, `designation`, `employee`, `role`, `user` এগুলোর permission declare করবে।
