হ্যাঁ, এই mapping থেকে Exit Meeting report-এর বেশিরভাগ field নির্ভুলভাবে relate করা যাবে। সংযুক্ত format অনুযায়ী final dynamic mapping হবে এমন: 

| Exit Meeting Report Field        | Dynamic Source                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| Meeting Date                     | `meeting_master.meeting_date`                                                            |
| Client Name                      | `audit_master.client_id → audit_entity`                                                  |
| Auditing Year                    | `audit_master.audit_year`                                                                |
| Nature of Work                   | `audit_master → audit_type`                                                              |
| Place of Meeting                 | `meeting_master.meeting_venue`                                                           |
| Audit Period                     | `audit_master.audit_start_date` এবং `audit_end_date`                                     |
| Visit Dates                      | সংশ্লিষ্ট Audit Master-এর `audit_visit_info.visit_date`, distinct এবং date order অনুযায়ী |
| Participants from M Hannan & Co. | `meeting_participants → internal_audit_team → audit_team / audit_team_member`            |
| Participants from Audit Client   | `meeting_participants → client_entity_team → audit_entity_contact`                       |
| Participant Designation          | Employee/Team Member বা Entity Contact-এর designation relation                           |
| Signature                        | Print report-এ blank signature cell                                                      |
| Observations/Findings            | `audit_visit_observations`                                                               |
| Management Response/Remarks      | বর্তমান schema অনুযায়ী `observation_decision` বা management-response equivalent field    |
| Chairman of Meeting              | Meeting Participant list থেকে selected client participant                                |
| Firm Header                      | Entrance Meeting report-এর existing firm/header configuration                            |

### গুরুত্বপূর্ণ relationship

**General Discussion Issue** এবং **Audit Visit Observation** এক জিনিস নয়।

* `General Discussion Issue` ব্যবহার হবে standard/default discussion points হিসেবে
* `Audit Visit Observation` ব্যবহার হবে actual audit findings হিসেবে
* Exit Meeting report-এর **Observations/Findings** table-এ actual finalized Visit Findings দেখানোই সঠিক
* Management response বর্তমানে `observation_decision` field-এ থাকলে সেটিই report-এর **Management Response/Remarks** column-এ যাবে

### Chairman selection

Chairman hardcoded হবে না।

```text
Meeting Participant list
→ Client Entity Participant
→ Selected as Chairman
→ Name and designation printed at report end
```

এজন্য existing Entrance Minute architecture-এ chairman reference already থাকলে সেটি reuse করব। না থাকলে Exit Minute record-এ participant reference field যোগ করা হবে।

### Report behaviour

* Findings যতগুলো থাকবে, সব automatically render হবে
* Visit dates distinct এবং chronological order-এ থাকবে
* Page 2 থেকে table header repeat হবে
* Serial number continuous থাকবে
* Long text অনুযায়ী row height automatic হবে
* HTML, Print A4 এবং PDF থাকবে
* কোনো client, participant, finding বা response hardcoded হবে না

## Step 1: Actual field names confirm করি

এখন শুধু এই PowerShell command চালান:

```powershell
cd E:\Audit\AMS\backend

Get-Content .\app\models\meeting_master.py
Get-Content .\app\models\meeting_participant.py
Get-Content .\app\models\audit_visit_info.py
Get-Content .\app\models\audit_visit_observation.py
```

Output পাঠান। এরপর actual fields দেখে শুধু **Step 2** দেব।

in database keep meeting minutes locked date and locked by user id and save the data templet for future inspection and regenerate meting minutes from the saved data


এটি খুব গুরুত্বপূর্ণ requirement, এবং **live table join থেকে report regenerate করলেই যথেষ্ট হবে না**। ভবিষ্যতে participant, designation, address, finding বা client information পরিবর্তিত হলে পুরোনো Meeting Minutes-ও বদলে যেতে পারে। তাই আমরা **immutable snapshot design** ব্যবহার করব। 🔒

### প্রস্তাবিত locking design

Draft অবস্থায় report live database থেকে তৈরি হবে। Lock করার সময় সম্পূর্ণ report data JSON snapshot হিসেবে save হবে:

* `is_locked`
* `locked_at`
* `locked_by_user_id`
* `snapshot_version`
* `template_key`
* `snapshot_data` as PostgreSQL `JSONB`

Lock হওয়ার পরে:

* Minute-এর meeting/chairman/content আর edit করা যাবে না
* Report সবসময় saved snapshot থেকে regenerate হবে
* Source tables পরে পরিবর্তিত হলেও locked report অপরিবর্তিত থাকবে
* Future inspection-এ কে, কখন lock করেছে দেখা যাবে
* নতুন report template এলেও পুরোনো snapshot পুরোনো template version দিয়ে regenerate করা যাবে

Entrance এবং Exit Meeting উভয়ের জন্য একই rule থাকবে।

## Step 4: Existing service, repository, user model এবং migration inspect করুন

এখন শুধু নিচের PowerShell commands চালান:

```powershell
cd E:\Audit\AMS\backend

Write-Host "User Model" -ForegroundColor Cyan
Get-Content .\app\models\user.py

Write-Host ""
Write-Host "Entrance Minute Repository" -ForegroundColor Cyan
Get-Content .\app\repositories\meeting_minute\entrance_meeting_minute_repository.py

Write-Host ""
Write-Host "Entrance Minute Service" -ForegroundColor Cyan
Get-Content .\app\services\meeting_minute\entrance_meeting_minute_service.py

Write-Host ""
Write-Host "Entrance Minute API" -ForegroundColor Cyan
Get-Content .\app\api\v1\meeting_minute\entrance_meeting_minutes.py

Write-Host ""
Write-Host "Entrance Minute Migrations" -ForegroundColor Cyan
Select-String `
  -Path .\alembic\versions\*.py `
  -Pattern "entrance_meeting_minutes" `
  -CaseSensitive:$false |
Select-Object Path, LineNumber, Line
```

পুরো output পাঠান। এরপর existing report composition দেখে snapshot এবং locking-এর exact database structure নির্ধারণ করব।
