"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Printer } from "lucide-react";

import {
  getEntranceMeetingMinuteReport,
  type EntranceMeetingMinuteReport,
  type EntranceMeetingOfficeReportItem,
  type EntranceMeetingParticipantReportItem,
} from "@/services/meetingMinutes/entranceMeetingMinute";

function formatDate(value: string | null | undefined) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date(value))
    .replaceAll("/", ".");
}

function padRows<T>(items: T[], minimumRows = 4): (T | null)[] {
  const rows: (T | null)[] = [...items];

  while (rows.length < minimumRows) {
    rows.push(null);
  }

  return rows;
}

function findOffice(
  offices: EntranceMeetingOfficeReportItem[],
  keyword: string,
  fallbackIndex: number,
) {
  return (
    offices.find((office) =>
      office.label?.toLowerCase().includes(keyword.toLowerCase()),
    )?.address ||
    offices[fallbackIndex]?.address ||
    ""
  );
}

function ParticipantTable({
  participants,
}: {
  participants: EntranceMeetingParticipantReportItem[];
}) {
  const rows = padRows(participants, 4);

  return (
    <table className="report-table">
      <thead>
        <tr>
          <th className="w-14">Sl#</th>
          <th>Name</th>
          <th>Designation</th>
          <th>Signature</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((participant, index) => (
          <tr key={`${participant?.participant_id ?? "blank"}-${index}`}>
            <td>{index + 1}</td>
            <td>{participant?.participant_name || ""}</td>
            <td>{participant?.designation || ""}</td>
            <td />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function EntranceMeetingMinuteReportPage() {
  const params = useParams<{ minuteId: string }>();
  const [data, setData] = useState<EntranceMeetingMinuteReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const minuteId = Number(params.minuteId);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setIsLoading(true);
      setMessage(null);

      try {
        const response = await getEntranceMeetingMinuteReport(minuteId);

        if (!cancelled) {
          setData(response);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Failed to load Entrance Meeting Minutes report.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (minuteId) {
      void loadReport();
    }

    return () => {
      cancelled = true;
    };
  }, [minuteId]);

  const offices = useMemo(() => data?.offices ?? [], [data?.offices]);

  const headOffice = useMemo(() => findOffice(offices, "head", 0), [offices]);
  const factoryOffice = useMemo(() => findOffice(offices, "factory", 1), [offices]);
  const otherOffice = useMemo(() => findOffice(offices, "other", 2), [offices]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" />
          Loading Entrance Meeting Minutes report...
        </div>
      </div>
    );
  }

  if (message || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl border border-red-100 bg-white p-6 text-red-600 shadow-sm">
          {message || "Report data not found."}
        </div>
      </div>
    );
  }

  const minute = data.minute;
  const briefingPerson =
    data.client_participants[0]?.participant_name || minute.chairman_name || "";
  const clientName = minute.client_name || minute.client_code || "";
  const discussions = data.discussions;

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="no-print mx-auto mb-4 flex w-[210mm] items-center justify-between">
        <Link
          href="/audit-meetings/minutes/entrance"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Printer size={16} />
          Print A4
        </button>
      </div>

      <main className="a4-page mx-auto bg-white text-black shadow-xl">
        <div className="report-content">
          <p className="firm-header">
            M Hannan Co., Chartered Accountants, Saj Bhaban, Unit# B, 27 Bijoy Nagar, Dhaka-1000
          </p>

          <div className="title-row">
            <h1>ENTRANCE MEETING WITH THE MANAGEMENT</h1>
            <div className="date-box-row">
              <strong>Meeting Date:</strong>
              <span className="value-box small-box">{formatDate(minute.meeting_date)}</span>
            </div>
          </div>

          <div className="field-row">
            <label>Name of the Organization:</label>
            <span className="value-box">{clientName}</span>
          </div>

          <div className="program-row">
            <label>Name of Program:</label>
            <strong>{minute.meeting_type || ""}</strong>
          </div>

          <div className="field-row">
            <label>Venue:</label>
            <span className="value-box">{minute.meeting_venue || ""}</span>
          </div>

          <div className="field-row short-field">
            <label>Year of Audit:</label>
            <span className="value-box">{minute.audit_year || ""}</span>
          </div>

          <h2>Participants from M Hannan &amp; Co.:</h2>
          <ParticipantTable participants={data.internal_participants} />

          <h2>Participants from Audit Client:</h2>
          <ParticipantTable participants={data.client_participants} />

          <p className="paragraph">
            In entrance meeting, <span className="inline-value">{briefingPerson}</span>{" "}
            from <span className="inline-value">{clientName}</span>
          </p>

          <p className="paragraph">
            brief the activities and objectives of the Entity, Project, accounting
            system, audit planning, audit time schedule and determine the contact
            person who will assist the auditor.
          </p>

          <h2 className="underline-heading">Target Audit start and finishing date:</h2>

          <div className="date-grid">
            <span>Start date:</span>
            <span className="value-box">{formatDate(minute.audit_start_date)}</span>
            <span>End date:</span>
            <span className="value-box">{formatDate(minute.audit_end_date)}</span>
          </div>

          <h2 className="underline-heading">Offices to be audited:</h2>

          <div className="office-row">
            <label>a) Head Office:</label>
            <span className="value-box">{headOffice}</span>
          </div>
          <div className="office-row">
            <label>b) Factory office:</label>
            <span className="value-box">{factoryOffice}</span>
          </div>
          <div className="office-row">
            <label>c) Other office:</label>
            <span className="value-box">{otherOffice}</span>
          </div>

          <h2>General Discussions and Decisions:</h2>

          <ol className="discussion-list">
            {discussions.length > 0 ? (
              discussions.map((discussion) => (
                <li key={discussion.id}>
                  <span>{discussion.title}</span>
                  {discussion.decision ? (
                    <span> Decision: {discussion.decision}</span>
                  ) : null}
                </li>
              ))
            ) : (
              <li>There is no other matter/agenda to be discussed in the meeting.</li>
            )}
          </ol>

          {discussions.length > 0 ? (
            <p className="paragraph">
              There is no other matter/agenda to be discussed in the meeting.
            </p>
          ) : null}

          <div className="signature-block">
            <strong>{minute.chairman_name || ""}</strong>
            <span>Chairman of the meeting</span>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .a4-page {
            width: 190mm !important;
            min-height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .report-content {
            padding: 0 !important;
          }
        }

        .a4-page {
          width: 210mm;
          min-height: 297mm;
        }

        .report-content {
          padding: 12mm;
          font-family: "Times New Roman", Times, serif;
          font-size: 14px;
          line-height: 1.28;
        }

        .firm-header {
          font-size: 14px;
          margin-bottom: 22mm;
        }

        .title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        h1 {
          font-size: 18px;
          font-weight: 700;
          text-decoration: underline;
          margin: 0;
        }

        h2 {
          font-size: 16px;
          font-weight: 700;
          margin: 10px 0 4px;
        }

        .underline-heading {
          text-decoration: underline;
        }

        .date-box-row {
          display: grid;
          grid-template-columns: auto 54mm;
          align-items: center;
          gap: 8px;
          font-size: 16px;
        }

        .field-row {
          display: grid;
          grid-template-columns: 58mm 1fr;
          align-items: center;
          gap: 4px;
          margin-bottom: 6px;
          font-size: 16px;
          font-weight: 700;
        }

        .field-row label,
        .program-row label {
          font-weight: 700;
        }

        .program-row {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .short-field {
          grid-template-columns: 38mm 58mm;
        }

        .value-box {
          display: block;
          min-height: 7mm;
          border: 1px solid #222;
          padding: 3px 5px;
          font-weight: 400;
        }

        .small-box {
          text-align: center;
        }

        .inline-value {
          display: inline-block;
          min-width: 55mm;
          font-weight: 400;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .report-table th,
        .report-table td {
          border: 1px solid #222;
          padding: 4px;
          height: 8mm;
          vertical-align: middle;
        }

        .report-table th {
          font-weight: 400;
          text-align: center;
        }

        .paragraph {
          margin: 8px 0;
          text-align: justify;
          font-size: 16px;
        }

        .date-grid {
          display: grid;
          grid-template-columns: 32mm 58mm 25mm 1fr;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .office-row {
          display: grid;
          grid-template-columns: 38mm 1fr;
          align-items: center;
          gap: 4px;
          margin-bottom: 3px;
          font-size: 16px;
        }

        .discussion-list {
          margin: 0;
          padding-left: 18px;
          font-size: 16px;
          text-align: justify;
        }

        .discussion-list li {
          margin-bottom: 5px;
        }

        .signature-block {
          margin-top: 18mm;
          margin-left: auto;
          width: 65mm;
          text-align: left;
          font-size: 15px;
        }

        .signature-block strong,
        .signature-block span {
          display: block;
        }
      `}</style>
    </div>
  );
}
