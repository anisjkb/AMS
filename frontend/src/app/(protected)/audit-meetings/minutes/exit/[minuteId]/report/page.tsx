"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileCheck2, Loader2, Printer } from "lucide-react";

import {
  getExitMeetingMinuteReport,
  type ExitMeetingFindingReportItem,
  type ExitMeetingMinuteReport,
  type ExitMeetingParticipantReportItem,
} from "@/services/meetingMinutes/exitMeetingMinute";

function safeText(value: string | null | undefined) {
  return value?.trim() || "";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replaceAll("/", ".");
}

function formatAuditPeriod(startDate: string | null, endDate: string | null) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    return `${start} to ${end}`;
  }

  return start || end;
}

function buildFindingText(item: ExitMeetingFindingReportItem) {
  const values = [
    safeText(item.discussion_point),
    safeText(item.observation_discussion),
  ].filter(Boolean);

  return [...new Set(values)].join("\n\n");
}

function ParticipantTable({
  participants,
}: {
  participants: ExitMeetingParticipantReportItem[];
}) {
  return (
    <table className="report-table participant-table">
      <thead>
        <tr>
          <th className="serial-column">SL</th>
          <th>Name</th>
          <th>Designation</th>
          <th className="signature-column">Signature</th>
        </tr>
      </thead>

      <tbody>
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <tr key={participant.participant_id}>
              <td className="center-cell">{index + 1}</td>

              <td>{safeText(participant.participant_name)}</td>

              <td>{safeText(participant.designation)}</td>

              <td className="blank-signature-cell" />
            </tr>
          ))
        ) : (
          <tr>
            <td className="center-cell">1</td>
            <td />
            <td />
            <td className="blank-signature-cell" />
          </tr>
        )}
      </tbody>
    </table>
  );
}

function FindingsTable({
  findings,
}: {
  findings: ExitMeetingFindingReportItem[];
}) {
  return (
    <table className="report-table findings-table">
      <thead>
        <tr>
          <th className="serial-column">SL</th>

          <th className="visit-date-column">Visit Date</th>

          <th>Findings / Discussion</th>

          <th>Management Response / Decision</th>
        </tr>
      </thead>

      <tbody>
        {findings.length > 0 ? (
          findings.map((finding, index) => (
            <tr key={finding.visit_observation_id}>
              <td className="center-cell">{index + 1}</td>

              <td className="center-cell">{formatDate(finding.visit_date)}</td>

              <td className="pre-line-cell">{buildFindingText(finding)}</td>

              <td className="pre-line-cell">
                {safeText(finding.observation_decision)}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="center-cell">1</td>
            <td />
            <td>No finding has been recorded.</td>
            <td />
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default function ExitMeetingReportPage() {
  const params = useParams<{ minuteId: string }>();

  const minuteId = Number(params.minuteId);

  const [data, setData] = useState<ExitMeetingMinuteReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      if (!Number.isInteger(minuteId) || minuteId <= 0) {
        setMessage("Invalid Exit Meeting Minutes ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setMessage(null);

      try {
        const response = await getExitMeetingMinuteReport(minuteId);

        if (!cancelled) {
          setData(response);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Failed to load Exit Meeting Minutes report.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [minuteId]);

  const visitDates = useMemo(() => {
    if (!data) return [];

    const values = [
      ...data.visit_dates,
      ...data.findings.map((finding) => finding.visit_date),
    ].filter((value): value is string => Boolean(value));

    return [...new Set(values)].sort();
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <div className="flex items-center gap-3 font-semibold">
          <Loader2 className="animate-spin" />
          Loading Exit Meeting report...
        </div>
      </div>
    );
  }

  if (message || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-lg rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-red-600">
            {message || "Report data was not found."}
          </p>

          <Link
            href="/audit-meetings/minutes/exit"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to Exit Minutes
          </Link>
        </div>
      </div>
    );
  }

  const { minute } = data;

  const clientName =
    safeText(minute.client_name) || safeText(minute.client_code);

  const natureOfWork =
    safeText(minute.audit_type) ||
    safeText(minute.meeting_type) ||
    safeText(minute.audit_name);

  const auditPeriod = formatAuditPeriod(
    minute.audit_start_date,
    minute.audit_end_date,
  );

  const documentStatus = minute.is_locked
    ? `LOCKED SNAPSHOT v${minute.snapshot_version}`
    : "DRAFT — LIVE DATABASE DATA";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-screen min-h-screen bg-slate-100 py-6">
      <div className="no-print mx-auto mb-4 flex w-[210mm] flex-wrap items-center justify-between gap-3">
        <Link
          href="/audit-meetings/minutes/exit"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className={
              minute.is_locked
                ? "inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700"
                : "inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700"
            }
          >
            <FileCheck2 size={16} />
            {documentStatus}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </div>

      <main className="a4-page report-shell mx-auto bg-white text-black shadow-xl">
        <div className="report-content">
          <header className="firm-header">
            M Hannan &amp; Co., Chartered Accountants, Saj Bhaban, Unit# B, 27
            Bijoy Nagar, Dhaka-1000
          </header>

          <section className="title-section">
            <h1>MINUTES OF EXIT MEETING WITH THE MANAGEMENT</h1>

            <div className="meeting-date-box">
              <strong>Meeting Date:</strong>
              <span>{formatDate(minute.meeting_date)}</span>
            </div>
          </section>

          <section className="document-status-row">
            <span>{documentStatus}</span>

            {minute.is_locked ? (
              <span>
                Workflow:{" "}
                {safeText(minute.workflow_status).replaceAll("_", " ")}
              </span>
            ) : null}
          </section>

          <section className="metadata-section">
            <div className="metadata-row">
              <strong>Name of the Client:</strong>
              <span>{clientName}</span>
            </div>

            <div className="metadata-row">
              <strong>Auditing Year:</strong>
              <span>{safeText(minute.audit_year)}</span>
            </div>

            <div className="metadata-row">
              <strong>Nature of Work:</strong>
              <span>{natureOfWork}</span>
            </div>

            <div className="metadata-row">
              <strong>Place of Meeting:</strong>
              <span>{safeText(minute.meeting_venue)}</span>
            </div>

            <div className="metadata-row">
              <strong>Audit Period:</strong>
              <span>{auditPeriod}</span>
            </div>

            <div className="metadata-row">
              <strong>Audit Visit Date(s):</strong>
              <span>{visitDates.map(formatDate).join(", ")}</span>
            </div>
          </section>

          <section className="participant-section">
            <h2>Participants from M Hannan &amp; Co.</h2>

            <ParticipantTable participants={data.internal_participants} />
          </section>

          <section className="participant-section">
            <h2>Participants from Audit Client</h2>

            <ParticipantTable participants={data.client_participants} />
          </section>

          {safeText(minute.meeting_note1) ? (
            <section className="meeting-note-section">
              <h2>Meeting Note</h2>
              <p>{safeText(minute.meeting_note1)}</p>
            </section>
          ) : null}

          <section className="findings-section">
            <h2>Findings and Management Response</h2>

            <FindingsTable findings={data.findings} />
          </section>

          <section className="signature-section">
            <div className="chairman-signature">
              <div className="signature-space" />

              <p className="signature-line">Signature</p>

              <strong>{safeText(minute.chairman_name)}</strong>

              <span>{safeText(minute.chairman_designation)}</span>

              <span>Chairman of the Meeting</span>
            </div>
          </section>

          {minute.is_locked ? (
            <footer className="document-control">
              <p>Snapshot Version: {minute.snapshot_version}</p>

              <p>Locked At: {formatDate(minute.locked_at)}</p>

              {minute.snapshot_hash ? (
                <p className="hash-text">SHA-256: {minute.snapshot_hash}</p>
              ) : null}
            </footer>
          ) : (
            <footer className="document-control draft-control">
              This report is generated from live database information and has
              not yet been locked.
            </footer>
          )}
        </div>
      </main>

      <style jsx global>{`
        @page {
          size: A4;
          margin: 10mm 10mm 11mm;
        }

        * {
          box-sizing: border-box;
        }

        .a4-page {
          width: 210mm;
          min-height: 297mm;
        }

        .report-content {
          min-height: 297mm;
          padding: 11mm 12mm 12mm;
          font-family: "Times New Roman", Times, serif;
          font-size: 13px;
          line-height: 1.3;
          color: #000;
        }

        .firm-header {
          margin-bottom: 7mm;
          border-bottom: 1.5px solid #111;
          padding-bottom: 2.5mm;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
        }

        .title-section {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: start;
          gap: 8mm;
          margin-bottom: 3mm;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .title-section h1 {
          margin: 0;
          text-align: center;
          font-size: 16px;
          line-height: 1.2;
          text-decoration: underline;
        }

        .meeting-date-box {
          display: grid;
          grid-template-columns: auto 34mm;
          gap: 2mm;
          align-items: center;
          white-space: nowrap;
          font-size: 12.5px;
        }

        .meeting-date-box span {
          min-height: 6mm;
          border: 0.8px solid #111;
          padding: 1mm 1.5mm;
          text-align: center;
        }

        .document-status-row {
          display: flex;
          justify-content: space-between;
          gap: 4mm;
          margin-bottom: 4mm;
          border: 0.8px solid #555;
          padding: 1.3mm 2mm;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          break-inside: avoid;
        }

        .metadata-section {
          margin-bottom: 4mm;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .metadata-row {
          display: grid;
          grid-template-columns: 43mm 1fr;
          align-items: stretch;
          margin-bottom: 1.3mm;
        }

        .metadata-row strong {
          padding: 1.1mm 1.5mm;
        }

        .metadata-row span {
          min-height: 6mm;
          border: 0.8px solid #111;
          padding: 1mm 1.7mm;
        }

        h2 {
          margin: 3.5mm 0 1.5mm;
          font-size: 13.5px;
          line-height: 1.2;
          text-decoration: underline;
        }

        .participant-section {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .report-table thead {
          display: table-header-group;
        }

        .report-table th,
        .report-table td {
          border: 0.8px solid #111;
          padding: 1.5mm 1.7mm;
          vertical-align: top;
          overflow-wrap: anywhere;
        }

        .report-table th {
          background: #f1f5f9;
          text-align: center;
          font-weight: 700;
        }

        .report-table tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .participant-table td {
          height: 8mm;
          vertical-align: middle;
        }

        .serial-column {
          width: 11mm;
        }

        .signature-column {
          width: 39mm;
        }

        .visit-date-column {
          width: 25mm;
        }

        .blank-signature-cell {
          min-height: 8mm;
        }

        .center-cell {
          text-align: center;
          vertical-align: middle !important;
        }

        .pre-line-cell {
          white-space: pre-line;
          text-align: justify;
        }

        .meeting-note-section {
          margin-top: 3mm;
          break-inside: avoid;
        }

        .meeting-note-section p {
          margin: 0;
          border: 0.8px solid #111;
          padding: 2mm;
          text-align: justify;
          white-space: pre-line;
        }

        .findings-section {
          margin-top: 4mm;
        }

        .findings-table {
          font-size: 12px;
        }

        .findings-table td {
          min-height: 12mm;
          line-height: 1.28;
        }

        .signature-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 12mm;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .chairman-signature {
          width: 68mm;
          text-align: center;
        }

        .signature-space {
          height: 14mm;
        }

        .signature-line {
          margin: 0 0 2mm;
          border-top: 0.8px solid #111;
          padding-top: 1mm;
        }

        .chairman-signature strong,
        .chairman-signature span {
          display: block;
          margin-top: 0.8mm;
        }

        .document-control {
          margin-top: 9mm;
          border-top: 0.6px solid #777;
          padding-top: 1.5mm;
          font-size: 9px;
          color: #444;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .document-control p {
          margin: 0.5mm 0;
        }

        .hash-text {
          overflow-wrap: anywhere;
          font-family: Consolas, "Courier New", monospace;
        }

        .draft-control {
          text-align: center;
          font-style: italic;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .report-shell,
          .report-shell * {
            visibility: visible !important;
          }

          .no-print {
            display: none !important;
          }

          .report-shell {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .report-content {
            min-height: auto !important;
            padding: 0 !important;
          }

          .report-table thead {
            display: table-header-group !important;
          }

          .report-table tfoot {
            display: table-footer-group !important;
          }

          .report-table tr,
          .metadata-section,
          .participant-section,
          .signature-section,
          .document-control {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .findings-section {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          .report-table th {
            background: #f1f5f9 !important;
          }

          .report-content,
          .report-table th {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
