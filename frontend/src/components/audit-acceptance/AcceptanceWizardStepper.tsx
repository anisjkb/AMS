"use client";

import { CheckCircle2 } from "lucide-react";

export type AcceptanceWizardStep = 1 | 2 | 3;

type AcceptanceWizardStepperProps = {
  activeStep: AcceptanceWizardStep;
  availableSteps?: AcceptanceWizardStep[];
  onStepSelect?: (
    step: AcceptanceWizardStep,
  ) => void;
};

const STEPS: Array<{
  step: AcceptanceWizardStep;
  title: string;
  description: string;
}> = [
  {
    step: 1,
    title: "Procedure Questions",
    description:
      "Complete and save the required acceptance procedures.",
  },
  {
    step: 2,
    title: "Acceptance Conclusion",
    description:
      "Record the decision, safeguards and declarations.",
  },
  {
    step: 3,
    title: "Review & Submit",
    description:
      "Review the saved record and submit it for sign-off.",
  },
];

export default function AcceptanceWizardStepper({
  activeStep,
  availableSteps = [1],
  onStepSelect,
}: AcceptanceWizardStepperProps) {
  return (
    <section
      aria-label="Acceptance workflow steps"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="grid md:grid-cols-3">
        {STEPS.map((item, index) => {
          const isActive =
            activeStep === item.step;

          const isCompleted =
            activeStep > item.step;

          const isAvailable =
            availableSteps.includes(item.step);

          return (
            <button
              key={item.step}
              type="button"
              disabled={
                !isAvailable ||
                !onStepSelect
              }
              aria-current={
                isActive
                  ? "step"
                  : undefined
              }
              onClick={() =>
                onStepSelect?.(item.step)
              }
              className={[
                "relative flex gap-4 p-5 text-left transition",
                index > 0
                  ? "border-t border-slate-200 md:border-l md:border-t-0"
                  : "",
                isActive
                  ? "bg-violet-50"
                  : "bg-white",
                isAvailable && onStepSelect
                  ? "cursor-pointer hover:bg-slate-50"
                  : "cursor-default",
                "disabled:opacity-100",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black",
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isActive
                      ? "bg-violet-700 text-white"
                      : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {isCompleted ? (
                  <CheckCircle2
                    size={20}
                    aria-hidden="true"
                  />
                ) : (
                  item.step
                )}
              </span>

              <span>
                <span
                  className={[
                    "block font-black",
                    isActive
                      ? "text-violet-950"
                      : "text-slate-800",
                  ].join(" ")}
                >
                  {item.title}
                </span>

                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}