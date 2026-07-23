"use client";

import {
  Check,
  X,
  type LucideIcon,
} from "lucide-react";

import type {
  AuditAcceptAnswerValue,
} from "@/services/auditAcceptanceProcedure";

type YesNoSelectorProps = {
  value: AuditAcceptAnswerValue | null;
  questionLabel: string;
  disabled?: boolean;
  onChange: (
    value: AuditAcceptAnswerValue | null,
  ) => void;
};

type AnswerOption = {
  value: AuditAcceptAnswerValue;
  label: string;
  icon: LucideIcon;
  selectedClassName: string;
};

const ANSWER_OPTIONS: AnswerOption[] = [
  {
    value: "yes",
    label: "Yes",
    icon: Check,
    selectedClassName:
      "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm",
  },
  {
    value: "no",
    label: "No",
    icon: X,
    selectedClassName:
      "border-rose-300 bg-rose-50 text-rose-700 shadow-sm",
  },
];

const UNSELECTED_CLASS_NAME =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50";

export default function YesNoSelector({
  value,
  questionLabel,
  disabled = false,
  onChange,
}: YesNoSelectorProps) {
  function handleSelect(
    nextValue: AuditAcceptAnswerValue,
  ) {
    onChange(
      value === nextValue
        ? null
        : nextValue,
    );
  }

  return (
    <div
      role="group"
      aria-label={questionLabel}
      className="flex w-full gap-2 sm:w-auto"
    >
      {ANSWER_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => handleSelect(option.value)}
            className={[
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2",
              "rounded-xl border px-4 py-2.5 text-sm font-bold transition",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-slate-400 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "sm:min-w-28 sm:flex-none",
              isSelected
                ? option.selectedClassName
                : UNSELECTED_CLASS_NAME,
            ].join(" ")}
          >
            <Icon
              size={17}
              aria-hidden="true"
            />

            {option.label}
          </button>
        );
      })}
    </div>
  );
}