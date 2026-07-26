"use client";

import {
  FileCheck2,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";

import type {
  AuditAcceptCompletion,
  AuditAcceptDecision,
  AuditAcceptWorkflowStatus,
} from "@/services/auditAcceptanceProcedure";

export type AcceptanceCompletionFormState = {
  file_no: string;
  safeguards_text: string;
  no_safeguard_required: boolean;
  acceptance_decision: AuditAcceptDecision | null;
  conclusion_remarks: string;
  confirm_relevant_information: boolean;
  confirm_independence_evaluated: boolean;
  confirm_threats_addressed: boolean;
  confirm_safeguards_applied: boolean;
  confirm_conclusion_documented: boolean;
  consultation_required: boolean;
  consultation_remarks: string;
};

type AcceptanceCompletionPanelProps = {
  exists: boolean;
  workflowStatus: AuditAcceptWorkflowStatus;
  workflowVersion: number;
  form: AcceptanceCompletionFormState;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onChange: <
    K extends keyof AcceptanceCompletionFormState,
  >(
    field: K,
    value: AcceptanceCompletionFormState[K],
  ) => void;
  onSave: () => void;
};

const CONFIRMATION_FIELDS = [
  {
    field: "confirm_relevant_information",
    label:
      "All relevant information required for the acceptance decision has been considered.",
  },
  {
    field: "confirm_independence_evaluated",
    label:
      "Independence requirements and potential conflicts have been evaluated.",
  },
  {
    field: "confirm_threats_addressed",
    label:
      "Identified threats to compliance and independence have been addressed.",
  },
  {
    field: "confirm_safeguards_applied",
    label:
      "Necessary safeguards have been applied and documented.",
  },
  {
    field: "confirm_conclusion_documented",
    label:
      "The final acceptance conclusion has been properly documented.",
  },
] as const;

export function buildAcceptanceCompletionFormState(
  completion: AuditAcceptCompletion,
): AcceptanceCompletionFormState {
  return {
    file_no: completion.file_no ?? "",
    safeguards_text:
      completion.safeguards_text ?? "",
    no_safeguard_required:
      completion.no_safeguard_required,
    acceptance_decision:
      completion.acceptance_decision,
    conclusion_remarks:
      completion.conclusion_remarks ?? "",
    confirm_relevant_information:
      completion.confirm_relevant_information,
    confirm_independence_evaluated:
      completion.confirm_independence_evaluated,
    confirm_threats_addressed:
      completion.confirm_threats_addressed,
    confirm_safeguards_applied:
      completion.confirm_safeguards_applied,
    confirm_conclusion_documented:
      completion.confirm_conclusion_documented,
    consultation_required:
      completion.consultation_required,
    consultation_remarks:
      completion.consultation_remarks ?? "",
  };
}

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

export default function AcceptanceCompletionPanel({
  exists,
  workflowStatus,
  workflowVersion,
  form,
  canEdit,
  isDirty,
  isSaving,
  onChange,
  onSave,
}: AcceptanceCompletionPanelProps) {
  const controlsDisabled =
    !canEdit || isSaving;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
              <FileCheck2
                size={22}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Acceptance Completion
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Record safeguards, the acceptance
                decision, required declarations and
                consultation requirements before
                submitting the workflow.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
              {exists
                ? "Draft saved"
                : "Not saved yet"}
            </span>

            <span className="rounded-xl bg-indigo-100 px-3 py-2 text-xs font-black text-indigo-800">
              {formatWorkflowStatus(
                workflowStatus,
              )}
            </span>

            <span className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-black text-slate-700">
              Version {workflowVersion}
            </span>
          </div>
        </div>

        {!canEdit ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <LockKeyhole
              size={20}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-semibold leading-6">
              This workflow is locked in its
              current status. Questionnaire and
              completion fields are view-only.
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="acceptance-file-no"
              className="text-sm font-black text-slate-800"
            >
              File Number
            </label>

            <input
              id="acceptance-file-no"
              type="text"
              value={form.file_no}
              disabled={controlsDisabled}
              onChange={(event) =>
                onChange(
                  "file_no",
                  event.target.value,
                )
              }
              placeholder="Enter audit file number"
              className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="acceptance-decision"
              className="text-sm font-black text-slate-800"
            >
              Acceptance Decision
            </label>

            <select
              id="acceptance-decision"
              value={
                form.acceptance_decision ?? ""
              }
              disabled={controlsDisabled}
              onChange={(event) =>
                onChange(
                  "acceptance_decision",
                  event.target.value
                    ? (event.target
                        .value as AuditAcceptDecision)
                    : null,
                )
              }
              className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                Select decision
              </option>

              <option value="accept">
                Accept
              </option>

              <option value="accept_with_safeguards">
                Accept with safeguards
              </option>

              <option value="do_not_accept">
                Do not accept
              </option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-sky-700"
            />

            <div className="min-w-0 flex-1">
              <h3 className="font-black text-sky-950">
                Safeguards
              </h3>

              <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm font-semibold leading-6 text-sky-900">
                <input
                  type="checkbox"
                  checked={
                    form.no_safeguard_required
                  }
                  disabled={controlsDisabled}
                  onChange={(event) =>
                    onChange(
                      "no_safeguard_required",
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-sky-300"
                />

                <span>
                  No safeguard is required for this
                  acceptance decision.
                </span>
              </label>

              <textarea
                value={form.safeguards_text}
                disabled={
                  controlsDisabled ||
                  form.no_safeguard_required
                }
                onChange={(event) =>
                  onChange(
                    "safeguards_text",
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Describe identified threats and safeguards applied."
                className="mt-4 w-full rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="acceptance-conclusion"
            className="text-sm font-black text-slate-800"
          >
            Conclusion Remarks
          </label>

          <textarea
            id="acceptance-conclusion"
            value={form.conclusion_remarks}
            disabled={controlsDisabled}
            onChange={(event) =>
              onChange(
                "conclusion_remarks",
                event.target.value,
              )
            }
            rows={4}
            placeholder="Record the conclusion and supporting remarks."
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-800">
            Required Confirmations
          </h3>

          <div className="mt-3 grid gap-3">
            {CONFIRMATION_FIELDS.map(
              ({ field, label }) => (
                <label
                  key={field}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold leading-6 text-slate-700 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={form[field]}
                    disabled={controlsDisabled}
                    onChange={(event) =>
                      onChange(
                        field,
                        event.target.checked,
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />

                  <span>{label}</span>
                </label>
              ),
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-black leading-6 text-violet-950">
            <input
              type="checkbox"
              checked={
                form.consultation_required
              }
              disabled={controlsDisabled}
              onChange={(event) =>
                onChange(
                  "consultation_required",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 rounded border-violet-300"
            />

            <span>
              A second partner or specialist
              consultation is required.
            </span>
          </label>

          {form.consultation_required ? (
            <textarea
              value={
                form.consultation_remarks
              }
              disabled={controlsDisabled}
              onChange={(event) =>
                onChange(
                  "consultation_remarks",
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Describe the consultation requirement."
              className="mt-4 w-full rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {isDirty
              ? "Completion details have unsaved changes."
              : "Completion details are saved."}
          </p>

          <button
            type="button"
            onClick={onSave}
            disabled={
              controlsDisabled || !isDirty
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2
                size={18}
                aria-hidden="true"
                className="animate-spin"
              />
            ) : (
              <Save
                size={18}
                aria-hidden="true"
              />
            )}

            {isSaving
              ? "Saving Completion..."
              : "Save Completion Draft"}
          </button>
        </div>
      </div>
    </section>
  );
}
