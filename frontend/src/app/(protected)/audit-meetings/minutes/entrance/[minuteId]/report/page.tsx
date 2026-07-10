"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";

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

function safeText(value: string | null | undefined) {
  return value?.trim() || "";
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
  const rows = participants;

  return (
    <table className="report-table">
      <thead>
        <tr>
          <th className="sl-column">Sl#</th>
          <th>Name</th>
          <th>Designation</th>
          <th>Signature</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((participant, index) => (
          <tr key={participant.participant_id}>
            <td className="text-center">{index + 1}</td>
            <td>{safeText(participant.participant_name)}</td>
            <td>{safeText(participant.designation)}</td>
            <td />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function EntranceMeetingMinuteReportPage() {
  const params = useParams<{ minuteId: string }>();
  const reportRef = useRef<HTMLElement | null>(null);

  const [data, setData] = useState<EntranceMeetingMinuteReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
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
  const clientName = safeText(minute.client_name) || safeText(minute.client_code);
  const briefingPerson =
    safeText(data.client_participants[0]?.participant_name) ||
    safeText(minute.chairman_name);
  const discussions = data.discussions;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setPdfLoading(true);
    setMessage(null);

    let exportSource: HTMLElement | null = null;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const page = reportRef.current;
      exportSource =
        (page.querySelector(".report-content") as HTMLElement | null) || page;

      exportSource.classList.add("pdf-export-mode");

      await new Promise((resolve) => window.setTimeout(resolve, 80));

      const canvas = await html2canvas(exportSource, {
        backgroundColor: "#ffffff",
        scale: 2.25,
        useCORS: true,
        logging: false,
        windowWidth: exportSource.scrollWidth,
        windowHeight: exportSource.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = {
        top: 10,
        right: 12,
        bottom: 10,
        left: 12,
      };

      const usableWidth = pdfWidth - margin.left - margin.right;
      const usableHeight = pdfHeight - margin.top - margin.bottom;

      const pageSliceHeightPx = Math.floor(
        (canvas.width * usableHeight) / usableWidth,
      );

      const minRemainingPx = Math.floor((canvas.width * 7) / usableWidth);

      let sourceY = 0;
      let pageIndex = 0;

      while (sourceY < canvas.height) {
        const remainingHeight = canvas.height - sourceY;

        if (remainingHeight < minRemainingPx) {
          break;
        }

        const sliceHeight = Math.min(pageSliceHeightPx, remainingHeight);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const context = pageCanvas.getContext("2d");

        if (!context) {
          throw new Error("Failed to prepare PDF canvas context.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        );

        if (pageIndex > 0) {
          pdf.addPage();
        }

        const imageHeight = (sliceHeight * usableWidth) / canvas.width;
        const imageData = pageCanvas.toDataURL("image/png", 1);

        pdf.addImage(
          imageData,
          "PNG",
          margin.left,
          margin.top,
          usableWidth,
          imageHeight,
          undefined,
          "FAST",
        );

        sourceY += sliceHeight;
        pageIndex += 1;
      }

      pdf.save(`entrance-meeting-minutes-${minute.minute_id}.pdf`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to generate Entrance Meeting Minutes PDF.",
      );
    } finally {
      exportSource?.classList.remove("pdf-export-mode");
      setPdfLoading(false);
    }
  };

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

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download PDF
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Printer size={16} />
            Print A4
          </button>
        </div>
      </div>

      {message ? (
        <div className="no-print mx-auto mb-4 w-[210mm] rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-red-600 shadow-sm">
          {message}
        </div>
      ) : null}

      <main ref={reportRef} className="a4-page mx-auto bg-white text-black shadow-xl">
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
            <span className="program-value">
              {safeText(minute.meeting_type) || "Statutory Audit / Management Audit / Internal Audit"}
            </span>
          </div>

          <div className="field-row">
            <label>Venue:</label>
            <span className="value-box">{safeText(minute.meeting_venue)}</span>
          </div>

          <div className="field-row short-field">
            <label>Year of Audit:</label>
            <span className="value-box">{safeText(minute.audit_year)}</span>
          </div>

          <h2>Participants from M Hannan &amp; Co.:</h2>
          <ParticipantTable participants={data.internal_participants} />

          <h2>Participants from Audit Client:</h2>
          <ParticipantTable participants={data.client_participants} />

          <p className="paragraph entrance-briefing">
            In entrance meeting, <strong>{briefingPerson}</strong> from{" "}
            <strong>{clientName}</strong> brief the activities and objectives of the
            Entity, Project, accounting system, audit planning, audit time schedule
            and determine the contact person who will assist the auditor.
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
              discussions.map((discussion) => {
                const discussionText =
                  safeText(discussion.description) || safeText(discussion.title);
                const decisionText = safeText(discussion.decision);

                return (
                  <li key={discussion.id}>
                    <span>{discussionText}</span>
                    {decisionText ? <span> Decision: {decisionText}</span> : null}
                  </li>
                );
              })
            ) : (
              <li>There is no other matter/agenda to be discussed in the meeting.</li>
            )}
          </ol>

          <div className="signature-block">
            <strong>{safeText(minute.chairman_name)}</strong>
            <span>Chairman of the meeting</span>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 210mm;
            min-height: 297mm;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .a4-page {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .report-content {
            padding: 11mm 12mm !important;
          }
        }

        .a4-page {
          width: 210mm;
          min-height: 297mm;
        }

        .pdf-capture-mode {
          box-shadow: none !important;
        }

        .report-content {
          padding: 11mm 12mm;
          font-family: "Times New Roman", Times, serif;
          font-size: 13.5px;
          line-height: 1.24;
        }

        .firm-header {
          font-size: 14px;
          margin: 0 0 20mm;
        }

        .title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        h1 {
          font-size: 18px;
          font-weight: 700;
          text-decoration: underline;
          margin: 0;
        }

        h2 {
          font-size: 15.5px;
          font-weight: 700;
          margin: 8px 0 3px;
        }

        .underline-heading {
          text-decoration: underline;
        }

        .date-box-row {
          display: grid;
          grid-template-columns: auto 49mm;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          white-space: nowrap;
        }

        .field-row {
          display: grid;
          grid-template-columns: 56mm 1fr;
          align-items: center;
          gap: 4px;
          margin-bottom: 5px;
          font-size: 15.5px;
          font-weight: 700;
        }

        .field-row label,
        .program-row label {
          font-weight: 700;
        }

        .program-row {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
          font-size: 15.5px;
        }

        .program-value {
          font-weight: 700;
        }

        .short-field {
          grid-template-columns: 37mm 58mm;
        }

        .value-box {
          display: block;
          min-height: 6.5mm;
          border: 1px solid #222;
          padding: 2px 5px;
          font-weight: 400;
        }

        .small-box {
          text-align: center;
        }

        .inline-value {
          display: inline-block;
          min-width: 54mm;
          font-weight: 400;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 7px;
          font-size: 13.5px;
        }

        .report-table th,
        .report-table td {
          border: 1px solid #222;
          padding: 3px 4px;
          height: 7.5mm;
          vertical-align: middle;
        }

        .report-table th {
          font-weight: 400;
          text-align: center;
        }

        .sl-column {
          width: 13mm;
        }

        .text-center {
          text-align: center;
        }

        .paragraph {
          margin: 7px 0;
          text-align: justify;
          font-size: 15.5px;
        }

        .date-grid {
          display: grid;
          grid-template-columns: 30mm 56mm 23mm 1fr;
          align-items: center;
          gap: 5px;
          margin-bottom: 7px;
          font-size: 15.5px;
        }

        .office-row {
          display: grid;
          grid-template-columns: 37mm 1fr;
          align-items: center;
          gap: 4px;
          margin-bottom: 3px;
          font-size: 15.5px;
        }

        .discussion-list {
          margin: 0;
          padding-left: 18px;
          font-size: 15.5px;
          text-align: justify;
        }

        .discussion-list li {
          margin-bottom: 4px;
        }

        .signature-block {
          margin-top: 16mm;
          margin-left: auto;
          width: 65mm;
          text-align: left;
          font-size: 14.5px;
        }

        .signature-block strong,
        .signature-block span {
          display: block;
        }

        /* PDF export mode - controlled A4 margins and clean box alignment */
        .report-content.pdf-export-mode {
          width: 186mm !important;
          min-height: auto !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          background: #ffffff !important;
          font-size: 12.6px !important;
          line-height: 1.18 !important;
        }

        .pdf-export-mode .firm-header {
          margin-bottom: 7mm !important;
        }

        .pdf-export-mode h1 {
          font-size: 16px !important;
          line-height: 1.12 !important;
        }

        .pdf-export-mode h2 {
          margin: 2.5mm 0 1.2mm !important;
          font-size: 13.8px !important;
        }

        .pdf-export-mode .field-row {
          margin-bottom: 2mm !important;
          font-size: 13.6px !important;
        }

        .pdf-export-mode .program-row {
          margin-bottom: 2.2mm !important;
          font-size: 13.6px !important;
        }

        .pdf-export-mode .value-box {
          display: flex !important;
          align-items: center !important;
          min-height: 5.8mm !important;
          padding: 0 4.5px !important;
          line-height: 1.05 !important;
          box-sizing: border-box !important;
        }

        .pdf-export-mode .date-box-row {
          grid-template-columns: auto 46mm !important;
          font-size: 13.8px !important;
        }

        .pdf-export-mode .report-table {
          margin-bottom: 2.6mm !important;
          font-size: 12.2px !important;
          line-height: 1.08 !important;
        }

        .pdf-export-mode .report-table th,
        .pdf-export-mode .report-table td {
          padding: 1.15mm 1.5mm !important;
          vertical-align: middle !important;
        }

        .pdf-export-mode .paragraph,
        .pdf-export-mode .entrance-briefing {
          margin: 1.8mm 0 2.4mm !important;
          text-align: justify !important;
          line-height: 1.2 !important;
        }

        .pdf-export-mode .date-grid {
          margin: 1.2mm 0 2.4mm !important;
        }

        .pdf-export-mode .office-row {
          margin-bottom: 1.35mm !important;
        }

        .pdf-export-mode .discussion-list {
          margin: 1.2mm 0 4mm 0 !important;
          padding-left: 8mm !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
          font-size: 12.8px !important;
          line-height: 1.18 !important;
        }

        .pdf-export-mode .discussion-list li {
          margin-bottom: 1.15mm !important;
          padding-left: 1.2mm !important;
          text-align: justify !important;
        }

        .pdf-export-mode .signature-block {
          margin-top: 9mm !important;
          margin-right: 14mm !important;
          font-size: 13px !important;
          line-height: 1.15 !important;
        }

        /* Refined A4 report design overrides */
        .report-content {
          padding: 10mm 12mm 9mm !important;
          font-size: 13.2px !important;
          line-height: 1.22 !important;
        }

        .firm-header {
          margin: 0 0 9mm !important;
          padding-bottom: 2.5mm !important;
          border-bottom: 1.5px solid #111 !important;
          text-align: center !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          letter-spacing: 0.1px !important;
        }

        .title-row {
          align-items: flex-start !important;
          margin-bottom: 4mm !important;
        }

        h1 {
          font-size: 17px !important;
          line-height: 1.18 !important;
        }

        h2 {
          margin: 3.2mm 0 1.5mm !important;
          font-size: 14.6px !important;
          line-height: 1.15 !important;
        }

        .field-row {
          margin-bottom: 2.5mm !important;
          gap: 3mm !important;
          font-size: 14.4px !important;
        }

        .program-row {
          margin-bottom: 2.8mm !important;
          font-size: 14.4px !important;
        }

        .value-box {
          min-height: 6mm !important;
          padding: 1.4px 5px !important;
        }

        .report-table {
          margin-bottom: 3.2mm !important;
          font-size: 12.9px !important;
        }

        .report-table th,
        .report-table td {
          padding-top: 1.6mm !important;
          padding-bottom: 1.6mm !important;
        }

        .paragraph {
          margin: 2.2mm 0 !important;
          text-align: justify !important;
        }

        .entrance-briefing {
          margin-top: 2.5mm !important;
          margin-bottom: 3.2mm !important;
          text-align: justify !important;
        }

        .entrance-briefing strong {
          font-weight: 400 !important;
        }

        .date-grid {
          margin: 1.5mm 0 3mm !important;
        }

        .office-row {
          margin-bottom: 1.8mm !important;
        }

        .discussion-list {
          margin: 1.5mm 0 5mm 0 !important;
          padding-left: 9mm !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
          font-size: 13.8px !important;
          line-height: 1.28 !important;
        }

        .discussion-list li {
          margin-bottom: 1.5mm !important;
          padding-left: 1.5mm !important;
          text-align: justify !important;
        }

        .discussion-list li::marker {
          font-weight: 700 !important;
        }

        .signature-block {
          margin-top: 13mm !important;
          margin-right: 16mm !important;
        }

        @media print {
          .report-content {
            padding: 9mm 11mm 8mm !important;
          }

          .firm-header {
            margin-bottom: 8mm !important;
          }

          .signature-block {
            margin-top: 11mm !important;
          }
        }

      `}</style>
    </div>
  );
}
