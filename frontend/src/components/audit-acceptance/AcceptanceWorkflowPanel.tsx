"use client";

import {
  BadgeCheck,
  Clock3,
  Loader2,
  PenLine,
  Send,
  Users,
} from "lucide-react";

import type {
  AuditAcceptSignoff,
  AuditAcceptSignerOption,
  AuditAcceptWorkflowStatus,
} from "@/services/auditAcceptanceProcedure";

export type AcceptanceSignFormState = {
  employee_id: string;
  declaration_text: string;
  remarks: string;
};

type AcceptanceWorkflowPanelProps = {
  workflowStatus: AuditAcceptWorkflowStatus;
  workflowVersion: number;
  completionExists: boolean;
  signoffs: AuditAcceptSignoff[];
  signerOptions: AuditAcceptSignerOption[];

  canSubmit: boolean;
  canSign: boolean;
  hasUnsavedChanges: boolean;
  isBusy: boolean;
  isSubmitting: boolean;
  isSigning: boolean;

  signForm: AcceptanceSignFormState;

  onSignFormChange: <
    K extends keyof AcceptanceSignFormState,
  >(
    field: K,
    value: AcceptanceSignFormState[K],
  ) => void;

  onSubmit: () => void;
  onSign: () => void;
};

const EDITABLE_STATUSES =
  new Set<AuditAcceptWorkflowStatus>([
    "draft",
    "changes_requested",
    "reopened",
  ]);

function formatWorkflowStatus(
  status: AuditAcceptWorkflowStatus,
) {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatSignoffRole(role: string) {
  return role
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

export default function AcceptanceWorkflowPanel({
  workflowStatus,
  workflowVersion,
  completionExists,
  signoffs,
  signerOptions,
  canSubmit,
  canSign,
  hasUnsavedChanges,
  isBusy,
  isSubmitting,
  isSigning,
  signForm,
  onSignFormChange,
  onSubmit,
  onSign,
}: AcceptanceWorkflowPanelProps) {
  const isEditableStatus =
    EDITABLE_STATUSES.has(workflowStatus);

  const submitReady =
    isEditableStatus &&
    completionExists &&
    canSubmit &&
    !hasUnsavedChanges &&
    !isBusy;

  const signReady =
    workflowStatus ===
      "pending_partner_signoff" &&
    canSign &&
    Number(signForm.employee_id) > 0 &&
    !isBusy;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
              <Clock3
                size={22}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-black">
                Acceptance Workflow
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                Submit the completed record and
                capture the authorised Employee
                sign-off.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black ring-1 ring-white/15">
              {formatWorkflowStatus(
                workflowStatus,
              )}
            </span>

            <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black ring-1 ring-white/15">
              Version {workflowVersion}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {isEditableStatus ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <Send
                size={21}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div className="min-w-0 flex-1">
                <h3 className="font-black text-amber-950">
                  Submit for Partner Sign-off
                </h3>

                <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
                  Submission locks the questionnaire
                  and completion details until the
                  workflow is reopened or changes are
                  requested.
                </p>

                {!completionExists ? (
                  <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-amber-900">
                    Save the Acceptance completion
                    draft before submitting.
                  </p>
                ) : null}

                {hasUnsavedChanges ? (
                  <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-amber-900">
                    Save all questionnaire and
                    completion changes before
                    submitting.
                  </p>
                ) : null}

                {!canSubmit ? (
                  <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-amber-900">
                    You do not have permission to
                    submit this workflow.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!submitReady}
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2
                      size={18}
                      aria-hidden="true"
                      className="animate-spin"
                    />
                  ) : (
                    <Send
                      size={18}
                      aria-hidden="true"
                    />
                  )}

                  {isSubmitting
                    ? "Submitting..."
                    : "Submit for Partner Sign-off"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {workflowStatus ===
        "pending_partner_signoff" ? (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <div className="flex items-start gap-3">
              <PenLine
                size={21}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-violet-700"
              />

              <div className="min-w-0 flex-1">
                <h3 className="font-black text-violet-950">
                  Engagement Partner Sign-off
                </h3>

                <p className="mt-1 text-sm font-semibold leading-6 text-violet-900">
                  Select the actual signer from the
                  active Employee list. Their name
                  and designation will be captured
                  as an immutable signing snapshot.
                </p>

                {!canSign ? (
                  <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-violet-900">
                    You do not have permission to
                    sign this workflow.
                  </p>
                ) : null}

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div>
                    <label
                      htmlFor="acceptance-signer"
                      className="text-sm font-black text-violet-950"
                    >
                      Signing Employee
                    </label>

                    <select
                      id="acceptance-signer"
                      value={
                        signForm.employee_id
                      }
                      disabled={
                        !canSign || isBusy
                      }
                      onChange={(event) =>
                        onSignFormChange(
                          "employee_id",
                          event.target.value,
                        )
                      }
                      className="mt-2 min-h-11 w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        Select active Employee
                      </option>

                      {signerOptions.map(
                        (signer) => (
                          <option
                            key={
                              signer.employee_id
                            }
                            value={
                              signer.employee_id
                            }
                          >
                            {signer.employee_name}
                            {" — "}
                            {
                              signer.designation_name
                            }
                          </option>
                        ),
                      )}
                    </select>

                    {signerOptions.length ===
                    0 ? (
                      <p className="mt-2 text-xs font-bold text-rose-700">
                        No active Employee signer
                        is currently available.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="acceptance-sign-declaration"
                      className="text-sm font-black text-violet-950"
                    >
                      Declaration
                    </label>

                    <textarea
                      id="acceptance-sign-declaration"
                      value={
                        signForm.declaration_text
                      }
                      disabled={
                        !canSign || isBusy
                      }
                      onChange={(event) =>
                        onSignFormChange(
                          "declaration_text",
                          event.target.value,
                        )
                      }
                      rows={3}
                      placeholder="Optional partner declaration."
                      className="mt-2 w-full rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm font-normal leading-6 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="acceptance-sign-remarks"
                    className="text-sm font-black text-violet-950"
                  >
                    Sign-off Remarks
                  </label>

                  <textarea
                    id="acceptance-sign-remarks"
                    value={signForm.remarks}
                    disabled={
                      !canSign || isBusy
                    }
                    onChange={(event) =>
                      onSignFormChange(
                        "remarks",
                        event.target.value,
                      )
                    }
                    rows={3}
                    placeholder="Optional sign-off remarks."
                    className="mt-2 w-full rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm font-normal leading-6 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={onSign}
                  disabled={!signReady}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigning ? (
                    <Loader2
                      size={18}
                      aria-hidden="true"
                      className="animate-spin"
                    />
                  ) : (
                    <PenLine
                      size={18}
                      aria-hidden="true"
                    />
                  )}

                  {isSigning
                    ? "Signing..."
                    : "Sign as Engagement Partner"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {workflowStatus ===
        "pending_consultation" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sky-950">
            <Users
              size={21}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-sky-700"
            />

            <div>
              <h3 className="font-black">
                Consultation Pending
              </h3>

              <p className="mt-1 text-sm font-semibold leading-6">
                Engagement Partner sign-off is
                complete. The workflow is awaiting
                the required second-partner or
                specialist consultation.
              </p>
            </div>
          </div>
        ) : null}

        {workflowStatus === "completed" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <BadgeCheck
              size={22}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-emerald-700"
            />

            <div>
              <h3 className="font-black">
                Acceptance Workflow Completed
              </h3>

              <p className="mt-1 text-sm font-semibold leading-6">
                The required acceptance review and
                sign-off have been completed.
              </p>
            </div>
          </div>
        ) : null}

        {signoffs.length > 0 ? (
          <div>
            <div className="flex items-center gap-2">
              <BadgeCheck
                size={20}
                aria-hidden="true"
                className="text-emerald-700"
              />

              <h3 className="font-black text-slate-900">
                Sign-off History
              </h3>
            </div>

            <div className="mt-3 grid gap-3">
              {signoffs.map((signoff) => (
                <article
                  key={signoff.signoff_id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-900">
                        {signoff.signed_by_name}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {signoff
                          .signed_by_designation ||
                          "Designation not recorded"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                        {formatSignoffRole(
                          signoff.signoff_role,
                        )}
                      </span>

                      <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                        Version{" "}
                        {signoff.workflow_version}
                      </span>

                      {signoff.is_current ? (
                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-black text-emerald-800">
                          Current
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-bold text-slate-500">
                    Signed{" "}
                    {formatDateTime(
                      signoff.signed_at,
                    )}
                  </p>

                  {signoff.declaration_text ? (
                    <p className="mt-3 rounded-xl bg-white p-3 text-sm font-normal leading-6 text-slate-700 ring-1 ring-slate-200">
                      {
                        signoff.declaration_text
                      }
                    </p>
                  ) : null}

                  {signoff.remarks ? (
                    <p className="mt-3 text-sm font-normal leading-6 text-slate-600">
                      Remarks: {signoff.remarks}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
