"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
} from "lucide-react";

import type {
  AuditAcceptDecision,
} from "@/services/auditAcceptanceProcedure";

export type AcceptanceYesResponse = {
  itemId: number;
  itemNo: string | null;
  label: string;
  sectionTitle: string;
};

type AcceptanceReviewPanelProps = {
  clientName: string;
  auditName: string | null;
  auditType: string;
  auditYear: string;
  auditId: number;

  answeredCount: number;
  totalQuestionCount: number;
  confirmationCount: number;

  acceptanceDecision:
    | AuditAcceptDecision
    | null;

  noSafeguardRequired: boolean;
  safeguardsText: string;
  conclusionRemarks: string;yesResponses: AcceptanceYesResponse[];
  showYesResponses: boolean;
  onToggleYesResponses: () => void;

  reviewReady: boolean;
  validationMessages: string[];
};

function formatDecision(
  value: AuditAcceptDecision | null,
) {
  if (!value) {
    return "Not selected";
  }

  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export default function AcceptanceReviewPanel({
  clientName,
  auditName,
  auditType,
  auditYear,
  auditId,
  answeredCount,
  totalQuestionCount,
  confirmationCount,
  acceptanceDecision,
  noSafeguardRequired,
  safeguardsText,
  conclusionRemarks,yesResponses,
  showYesResponses,
  onToggleYesResponses,
  reviewReady,
  validationMessages,
}: AcceptanceReviewPanelProps) {
  const safeguardsStatus =
    noSafeguardRequired
      ? "Not required"
      : safeguardsText.trim().length > 0
        ? "Documented"
        : "Missing";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
            <ClipboardCheck
              size={22}
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-lg font-black">
              Review & Submit
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">
              Review the saved procedure
              responses and acceptance
              conclusion before submitting
              the workflow.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Client
            </p>

            <p className="mt-2 font-black text-slate-900">
              {clientName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Audit
            </p>

            <p className="mt-2 font-black text-slate-900">
              {auditName || auditType}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Audit Year
            </p>

            <p className="mt-2 font-black text-slate-900">
              {auditYear}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Audit ID
            </p>

            <p className="mt-2 font-black text-slate-900">
              #{auditId}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Procedure Responses
            </p>

            <p className="mt-2 text-2xl font-black text-slate-900">
              {answeredCount}/
              {totalQuestionCount}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-black text-slate-900">
              Acceptance conclusion
            </h3>

            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-500">
                  Decision
                </dt>

                <dd className="text-right font-black text-slate-900">
                  {formatDecision(
                    acceptanceDecision,
                  )}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-500">
                  Safeguards
                </dt>

                <dd className="text-right font-black text-slate-900">
                  {safeguardsStatus}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-500">
                  Required confirmations
                </dt>

                <dd className="text-right font-black text-slate-900">
                  {confirmationCount}/5
                </dd>
              </div>

            </dl>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Conclusion remarks
              </p>

              <p className="mt-2 whitespace-pre-line text-sm font-normal leading-6 text-slate-700">
                {conclusionRemarks.trim() ||
                  "No conclusion remarks recorded."}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900">
                  Yes Responses
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Review all procedure
                  questions answered Yes.
                </p>
              </div>

              <span className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-black text-violet-800">
                {yesResponses.length}
              </span>
            </div>

            <button
              type="button"
              aria-expanded={
                showYesResponses
              }
              onClick={
                onToggleYesResponses
              }
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              <ChevronDown
                size={17}
                aria-hidden="true"
                className={[
                  "transition-transform",
                  showYesResponses
                    ? "rotate-180"
                    : "",
                ].join(" ")}
              />

              {showYesResponses
                ? "Hide Yes Responses"
                : "View Yes Responses"}
            </button>

            {showYesResponses ? (
              <div className="mt-4 space-y-3">
                {yesResponses.length > 0 ? (
                  yesResponses.map(
                    (item) => (
                      <article
                        key={item.itemId}
                        className="rounded-xl border border-violet-100 bg-violet-50 p-4"
                      >
                        <p className="text-xs font-black uppercase tracking-wider text-violet-700">
                          {item.sectionTitle}
                        </p>

                        <p className="mt-2 text-sm font-normal leading-6 text-slate-800">
                          {item.itemNo
                            ? `${item.itemNo}. `
                            : ""}
                          {item.label}
                        </p>
                      </article>
                    ),
                  )
                ) : (
                  <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                    No procedure questions
                    are currently answered Yes.
                  </p>
                )}
              </div>
            ) : null}
          </section>
        </div>

        <section
          className={[
            "rounded-2xl border p-5",
            reviewReady
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            {reviewReady ? (
              <CheckCircle2
                size={21}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-emerald-700"
              />
            ) : (
              <AlertTriangle
                size={21}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-amber-700"
              />
            )}

            <div>
              <h3
                className={[
                  "font-black",
                  reviewReady
                    ? "text-emerald-950"
                    : "text-amber-950",
                ].join(" ")}
              >
                {reviewReady
                  ? "Ready for submission"
                  : "Submission requirements"}
              </h3>

              {reviewReady ? (
                <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900">
                  All required procedure
                  questions, conclusion
                  details and declarations
                  are saved.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm font-semibold text-amber-900">
                  {validationMessages.map(
                    (message) => (
                      <li key={message}>
                        • {message}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

