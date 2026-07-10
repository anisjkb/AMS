import asyncio
from datetime import date, datetime
from html import escape
from urllib.parse import quote

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.meeting_minute.entrance_meeting_minute_repository import (
    EntranceMeetingMinuteRepository,
)
from app.schemas.meeting_minute.entrance_meeting_minute import (
    EntranceMeetingMinuteCreate,
    EntranceMeetingMinuteUpdate,
)


class EntranceMeetingMinuteService:
    def __init__(self, db: AsyncSession):
        self.repository = EntranceMeetingMinuteRepository(db)

    async def list_entrance_meeting_minutes(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            meeting_id=meeting_id,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_entrance_meeting_minute(self, minute_id: int):
        item = await self.repository.get_by_id(minute_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrance Meeting Minutes record not found.",
            )

        return item

    async def _validate_meeting_and_chairman(
        self,
        meeting_id: int,
        chairman_participant_id: int,
    ):
        meeting = await self.repository.get_active_meeting(meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Meeting Master record is invalid or inactive.",
            )

        chairman = await self.repository.get_active_participant_for_meeting(
            participant_id=chairman_participant_id,
            meeting_id=meeting_id,
        )

        if not chairman:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected chairman must be an active participant of the selected meeting.",
            )

    async def create_entrance_meeting_minute(
        self,
        payload: EntranceMeetingMinuteCreate,
        created_by: str | None,
    ):
        await self._validate_meeting_and_chairman(
            meeting_id=payload.meeting_id,
            chairman_participant_id=payload.chairman_participant_id,
        )

        item = await self.repository.create(
            data=payload.model_dump(),
            created_by=created_by,
        )

        return {
            "message": "Entrance Meeting Minutes record created successfully.",
            "data": item,
        }

    async def update_entrance_meeting_minute(
        self,
        minute_id: int,
        payload: EntranceMeetingMinuteUpdate,
        updated_by: str | None,
    ):
        existing = await self.get_entrance_meeting_minute(minute_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        meeting_id = update_data.get("meeting_id", existing["meeting_id"])
        chairman_participant_id = update_data.get(
            "chairman_participant_id",
            existing["chairman_participant_id"],
        )

        await self._validate_meeting_and_chairman(
            meeting_id=meeting_id,
            chairman_participant_id=chairman_participant_id,
        )

        item = await self.repository.update(
            minute_id=minute_id,
            data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Entrance Meeting Minutes record updated successfully.",
            "data": item,
        }

    async def deactivate_entrance_meeting_minute(
        self,
        minute_id: int,
        updated_by: str | None,
    ):
        await self.get_entrance_meeting_minute(minute_id)

        item = await self.repository.update_is_active(
            minute_id=minute_id,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Entrance Meeting Minutes record deactivated successfully.",
            "data": item,
        }

    async def restore_entrance_meeting_minute(
        self,
        minute_id: int,
        updated_by: str | None,
    ):
        await self.get_entrance_meeting_minute(minute_id)

        item = await self.repository.update_is_active(
            minute_id=minute_id,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Entrance Meeting Minutes record restored successfully.",
            "data": item,
        }

    async def permanent_delete_entrance_meeting_minute(self, minute_id: int):
        await self.get_entrance_meeting_minute(minute_id)

        deleted = await self.repository.permanent_delete(minute_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrance Meeting Minutes record not found.",
            )

        return {
            "message": "Entrance Meeting Minutes record permanently deleted successfully.",
            "data": None,
        }

    async def get_report(self, minute_id: int):
        minute = await self.get_entrance_meeting_minute(minute_id)

        internal_participants = await self.repository.list_report_participants(
            meeting_id=minute["meeting_id"],
            source_type="internal_audit_team",
        )

        client_participants = await self.repository.list_report_participants(
            meeting_id=minute["meeting_id"],
            source_type="client_entity_team",
        )

        discussions = await self.repository.list_report_discussions(
            audit_type=minute["meeting_type"] or "",
        )

        offices = await self.repository.list_report_offices(
            client_id=minute["client_id"] or 0,
        )

        return {
            "minute": minute,
            "internal_participants": internal_participants,
            "client_participants": client_participants,
            "discussions": discussions,
            "offices": offices,
        }

    def _safe(self, value) -> str:
        if value is None:
            return ""
        return escape(str(value).strip())

    def _format_date(self, value) -> str:
        if not value:
            return ""

        if isinstance(value, datetime):
            return value.strftime("%d.%m.%Y")

        if isinstance(value, date):
            return value.strftime("%d.%m.%Y")

        try:
            return date.fromisoformat(str(value)[:10]).strftime("%d.%m.%Y")
        except ValueError:
            return self._safe(value)

    def _find_office(self, offices: list[dict], keyword: str, fallback_index: int) -> str:
        keyword_lower = keyword.lower()

        for office in offices:
            label = str(office.get("label") or "").lower()
            if keyword_lower in label:
                return self._safe(office.get("address"))

        if len(offices) > fallback_index:
            return self._safe(offices[fallback_index].get("address"))

        return ""

    def _participant_rows(self, participants: list[dict]) -> str:
        if not participants:
            return """
                <tr>
                  <td colspan="4" class="empty-cell">No participants found.</td>
                </tr>
            """

        rows = []
        for index, participant in enumerate(participants, start=1):
            rows.append(
                f"""
                <tr>
                  <td class="text-center">{index}</td>
                  <td>{self._safe(participant.get("participant_name"))}</td>
                  <td>{self._safe(participant.get("designation"))}</td>
                  <td></td>
                </tr>
                """
            )

        return "".join(rows)

    def _discussion_rows(self, discussions: list[dict]) -> str:
        if not discussions:
            return "<li>There is no other matter/agenda to be discussed in the meeting.</li>"

        rows = []
        for discussion in discussions:
            text = self._safe(discussion.get("description")) or self._safe(
                discussion.get("title")
            )
            decision = self._safe(discussion.get("decision"))

            if decision:
                text = f"{text} Decision: {decision}"

            rows.append(f"<li>{text}</li>")

        return "".join(rows)

    def _build_pdf_html(self, report: dict) -> str:
        minute = report["minute"]
        internal_participants = report["internal_participants"]
        client_participants = report["client_participants"]
        discussions = report["discussions"]
        offices = report["offices"]

        client_name = self._safe(minute.get("client_name")) or self._safe(
            minute.get("client_code")
        )
        briefing_person = (
            self._safe(client_participants[0].get("participant_name"))
            if client_participants
            else self._safe(minute.get("chairman_name"))
        )

        head_office = self._find_office(offices, "head", 0)
        factory_office = self._find_office(offices, "factory", 1)
        other_office = self._find_office(offices, "other", 2)

        return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Entrance Meeting Minutes {self._safe(minute.get("minute_id"))}</title>
  <style>
    @page {{
      size: A4;
      margin: 10mm 11mm 10mm 11mm;
    }}

    * {{
      box-sizing: border-box;
    }}

    html,
    body {{
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: "Times New Roman", Times, serif;
      font-size: 12.2px;
      line-height: 1.17;
    }}

    .firm-header {{
      margin: 0 0 6.5mm;
      padding-bottom: 2mm;
      border-bottom: 1px solid #111;
      text-align: center;
      font-size: 13.2px;
      font-weight: 700;
      line-height: 1.1;
      break-after: avoid;
      page-break-after: avoid;
    }}

    .title-row {{
      display: grid;
      grid-template-columns: 1fr 76mm;
      align-items: start;
      gap: 5mm;
      margin-bottom: 3mm;
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    h1 {{
      margin: 0;
      font-size: 15.2px;
      line-height: 1.1;
      font-weight: 700;
      text-decoration: underline;
    }}

    h2 {{
      margin: 2.4mm 0 1mm;
      font-size: 12.9px;
      line-height: 1.1;
      font-weight: 700;
      break-after: avoid;
      page-break-after: avoid;
    }}

    .date-box-row {{
      display: grid;
      grid-template-columns: auto 42mm;
      align-items: center;
      gap: 2.5mm;
      font-size: 12.8px;
      white-space: nowrap;
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .field-row {{
      display: grid;
      grid-template-columns: 58mm 1fr;
      align-items: center;
      gap: 3mm;
      margin-bottom: 1.8mm;
      font-size: 12.8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .program-row {{
      display: flex;
      gap: 2mm;
      margin-bottom: 1.9mm;
      font-size: 12.8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .short-field {{
      grid-template-columns: 38mm 60mm;
    }}

    .value-box {{
      display: block;
      min-height: 5.4mm;
      height: auto;
      border: 0.7px solid #111;
      padding: 1mm 1.6mm 0.8mm;
      line-height: 1.13;
      font-weight: 400;
      overflow: visible;
    }}

    .small-box {{
      text-align: center;
    }}

    .report-table {{
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2.4mm;
      font-size: 11.6px;
      line-height: 1.05;
      break-inside: auto;
      page-break-inside: auto;
    }}

    .report-table thead {{
      display: table-header-group;
    }}

    .report-table tbody {{
      display: table-row-group;
    }}

    .report-table tr {{
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .report-table th,
    .report-table td {{
      border: 0.7px solid #111;
      padding: 1.15mm 1.4mm;
      vertical-align: middle;
    }}

    .report-table th {{
      font-weight: 400;
      text-align: center;
    }}

    .sl-column {{
      width: 12mm;
    }}

    .text-center {{
      text-align: center;
    }}

    .empty-cell {{
      text-align: center;
      color: #555;
      font-style: italic;
    }}

    .paragraph,
    .entrance-briefing {{
      margin: 2mm 0 2.2mm;
      text-align: justify;
      line-height: 1.18;
      break-inside: avoid;
      page-break-inside: avoid;
      orphans: 3;
      widows: 3;
    }}

    .date-grid {{
      display: grid;
      grid-template-columns: auto 48mm auto 48mm;
      align-items: center;
      gap: 2mm;
      margin: 1.2mm 0 2.2mm;
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .office-row {{
      display: grid;
      grid-template-columns: 40mm 1fr;
      align-items: center;
      gap: 2mm;
      margin-bottom: 1.2mm;
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .discussion-list {{
      margin: 1.2mm 0 4mm 0;
      padding-left: 8mm;
      list-style-type: decimal;
      list-style-position: outside;
      font-size: 11.9px;
      line-height: 1.16;
      break-inside: auto;
      page-break-inside: auto;
    }}

    .discussion-list li {{
      margin-bottom: 1mm;
      padding-left: 1mm;
      text-align: justify;
      break-inside: avoid;
      page-break-inside: avoid;
      orphans: 3;
      widows: 3;
    }}

    .discussion-list li::marker {{
      font-weight: 700;
    }}

    .signature-block {{
      width: 62mm;
      margin-top: 7mm;
      margin-left: auto;
      margin-right: 22mm;
      margin-bottom: 0;
      font-size: 12.2px;
      line-height: 1.12;
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .signature-block strong,
    .signature-block span {{
      display: block;
    }}
  </style>
</head>
<body>
  <p class="firm-header">
    M Hannan Co., Chartered Accountants, Saj Bhaban, Unit# B, 27 Bijoy Nagar, Dhaka-1000
  </p>

  <div class="title-row">
    <h1>ENTRANCE MEETING WITH THE MANAGEMENT</h1>
    <div class="date-box-row">
      <strong>Meeting Date:</strong>
      <span class="value-box small-box">{self._format_date(minute.get("meeting_date"))}</span>
    </div>
  </div>

  <div class="field-row">
    <label><strong>Name of the Organization:</strong></label>
    <span class="value-box">{client_name}</span>
  </div>

  <div class="program-row">
    <label><strong>Name of Program:</strong></label>
    <span><strong>{self._safe(minute.get("meeting_type"))}</strong></span>
  </div>

  <div class="field-row">
    <label><strong>Venue:</strong></label>
    <span class="value-box">{self._safe(minute.get("meeting_venue"))}</span>
  </div>

  <div class="field-row short-field">
    <label><strong>Year of Audit:</strong></label>
    <span class="value-box">{self._safe(minute.get("audit_year"))}</span>
  </div>

  <h2>Participants from M Hannan &amp; Co.:</h2>
  <table class="report-table">
    <thead>
      <tr>
        <th class="sl-column">Sl#</th>
        <th>Name</th>
        <th>Designation</th>
        <th>Signature</th>
      </tr>
    </thead>
    <tbody>{self._participant_rows(internal_participants)}</tbody>
  </table>

  <h2>Participants from Audit Client:</h2>
  <table class="report-table">
    <thead>
      <tr>
        <th class="sl-column">Sl#</th>
        <th>Name</th>
        <th>Designation</th>
        <th>Signature</th>
      </tr>
    </thead>
    <tbody>{self._participant_rows(client_participants)}</tbody>
  </table>

  <p class="entrance-briefing">
    In entrance meeting, <strong>{briefing_person}</strong> from <strong>{client_name}</strong>
    brief the activities and objectives of the Entity, Project, accounting system,
    audit planning, audit time schedule and determine the contact person who will
    assist the auditor.
  </p>

  <h2><u>Target Audit start and finishing date:</u></h2>

  <div class="date-grid">
    <span>Start date:</span>
    <span class="value-box">{self._format_date(minute.get("audit_start_date"))}</span>
    <span>End date:</span>
    <span class="value-box">{self._format_date(minute.get("audit_end_date"))}</span>
  </div>

  <h2><u>Offices to be audited:</u></h2>

  <div class="office-row">
    <label>a) Head Office:</label>
    <span class="value-box">{head_office}</span>
  </div>
  <div class="office-row">
    <label>b) Factory office:</label>
    <span class="value-box">{factory_office}</span>
  </div>
  <div class="office-row">
    <label>c) Other office:</label>
    <span class="value-box">{other_office}</span>
  </div>

  <h2>General Discussions and Decisions:</h2>
  <ol class="discussion-list">
    {self._discussion_rows(discussions)}
  </ol>

  <div class="signature-block">
    <strong>{self._safe(minute.get("chairman_name"))}</strong>
    <span>Chairman of the meeting</span>
  </div>
</body>
</html>"""

    def _generate_pdf_sync(self, html: str) -> bytes:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Playwright is not installed. Run: pip install playwright && python -m playwright install chromium",
            ) from exc

        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(
                    headless=True,
                    args=["--no-sandbox", "--disable-dev-shm-usage"],
                )

                try:
                    page = browser.new_page(
                        viewport={"width": 794, "height": 1123},
                        device_scale_factor=1,
                    )

                    page.goto(
                        "data:text/html;charset=utf-8," + quote(html),
                        wait_until="load",
                    )
                    page.emulate_media(media="print")
                    page.wait_for_timeout(300)

                    body_text = page.locator("body").inner_text(timeout=5000).strip()
                    if not body_text:
                        raise RuntimeError("PDF HTML rendered blank body before PDF generation.")

                    pdf_bytes = page.pdf(
                        format="A4",
                        print_background=True,
                        prefer_css_page_size=True,
                    )

                    if len(pdf_bytes) < 10000:
                        raise RuntimeError("Generated PDF is unexpectedly small or blank.")

                    return pdf_bytes
                finally:
                    try:
                        browser.close()
                    except Exception:
                        pass
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate PDF: {exc}",
            ) from exc

    async def generate_pdf(self, minute_id: int) -> bytes:
        report = await self.get_report(minute_id)
        html = self._build_pdf_html(report)

        return await asyncio.to_thread(self._generate_pdf_sync, html)
