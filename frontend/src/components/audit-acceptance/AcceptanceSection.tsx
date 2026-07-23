"use client";

import {
  AlertTriangle,
  ChevronDown,
  CircleCheckBig,
  FileSignature,
  Info,
} from "lucide-react";

import YesNoSelector from "@/components/audit-acceptance/YesNoSelector";

import type {
  AuditAcceptAnswerValue,
  AuditAcceptItem,
} from "@/services/auditAcceptanceProcedure";

type AcceptanceSectionProps = {
  section: AuditAcceptItem;
  items: AuditAcceptItem[];
  answers: Record<
    number,
    AuditAcceptAnswerValue | null
  >;
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onAnswerChange: (
    itemId: number,
    value: AuditAcceptAnswerValue | null,
  ) => void;
};

type ItemContentProps = {
  item: AuditAcceptItem;
};

function getItemLabel(item: AuditAcceptItem) {
  return (
    item.title ||
    item.content ||
    item.item_no ||
    item.item_key
  );
}

function ItemContent({
  item,
}: ItemContentProps) {
  if (!item.content) {
    return null;
  }

  return (
    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
      {item.content}
    </p>
  );
}

export default function AcceptanceSection({
  section,
  items,
  answers,
  isOpen,
  disabled = false,
  onToggle,
  onAnswerChange,
}: AcceptanceSectionProps) {
  const questions = items.filter(
    (item) => item.response_type === "yes_no",
  );

  const answeredCount = questions.filter(
    (item) => answers[item.item_id] != null,
  ).length;

  const sectionTitle =
    section.title ||
    section.content ||
    section.item_no ||
    "Acceptance Procedure Section";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={[
          "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
          "transition hover:bg-slate-50",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-inset focus-visible:ring-slate-400",
          isOpen
            ? "border-b border-slate-200 bg-slate-50/70"
            : "bg-white",
        ].join(" ")}
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            {section.item_no ? (
              <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                {section.item_no}
              </span>
            ) : null}

            <span className="text-base font-black text-slate-900">
              {sectionTitle}
            </span>
          </span>

          <span className="mt-1 block text-xs font-semibold text-slate-500">
            {answeredCount} of {questions.length} answered
          </span>
        </span>

        <ChevronDown
          size={20}
          aria-hidden="true"
          className={[
            "shrink-0 text-slate-500 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen ? (
        <div className="space-y-4 p-5">
          {section.title && section.content ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <ItemContent item={section} />
            </div>
          ) : null}

          {items.map((item) => {
            const itemLabel = getItemLabel(item);

            if (item.item_type === "question") {
              return (
                <article
                  key={item.item_id}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        {item.item_no ? (
                          <span className="mt-0.5 shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">
                            {item.item_no}
                          </span>
                        ) : null}

                        <div className="min-w-0">
                          <p className="font-bold leading-6 text-slate-800">
                            {item.title ||
                              item.content ||
                              item.item_key}

                            {item.is_required ? (
                              <span
                                className="ml-1 text-rose-600"
                                aria-label="Required"
                              >
                                *
                              </span>
                            ) : null}
                          </p>

                          {item.title ? (
                            <ItemContent item={item} />
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <YesNoSelector
                      value={
                        answers[item.item_id] ??
                        null
                      }
                      questionLabel={itemLabel}
                      disabled={disabled}
                      onChange={(value) =>
                        onAnswerChange(
                          item.item_id,
                          value,
                        )
                      }
                    />
                  </div>
                </article>
              );
            }

            if (item.item_type === "note") {
              return (
                <article
                  key={item.item_id}
                  className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4"
                >
                  <Info
                    size={20}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-sky-700"
                  />

                  <div>
                    {item.title ? (
                      <p className="font-bold text-sky-900">
                        {item.title}
                      </p>
                    ) : null}

                    <ItemContent item={item} />
                  </div>
                </article>
              );
            }

            if (item.item_type === "safeguard") {
              return (
                <article
                  key={item.item_id}
                  className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
                >
                  <AlertTriangle
                    size={20}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <div>
                    {item.title ? (
                      <p className="font-bold text-amber-900">
                        {item.title}
                      </p>
                    ) : null}

                    <ItemContent item={item} />
                  </div>
                </article>
              );
            }

            if (item.item_type === "conclusion") {
              return (
                <article
                  key={item.item_id}
                  className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <CircleCheckBig
                    size={20}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />

                  <div>
                    {item.title ? (
                      <p className="font-bold text-emerald-900">
                        {item.title}
                      </p>
                    ) : null}

                    <ItemContent item={item} />
                  </div>
                </article>
              );
            }

            if (item.item_type === "signature") {
              return (
                <article
                  key={item.item_id}
                  className="flex gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
                >
                  <FileSignature
                    size={20}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-slate-600"
                  />

                  <div>
                    {item.title ? (
                      <p className="font-bold text-slate-800">
                        {item.title}
                      </p>
                    ) : null}

                    <ItemContent item={item} />
                  </div>
                </article>
              );
            }

            return null;
          })}
        </div>
      ) : null}
    </section>
  );
}