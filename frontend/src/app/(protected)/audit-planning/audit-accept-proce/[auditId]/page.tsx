"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";

import AcceptanceSection from "@/components/audit-acceptance/AcceptanceSection";
import { useModuleActions } from "@/hooks/useModuleActions";

import {
  getAuditAcceptancePage,
  saveAuditAcceptanceResponses,
  type AuditAcceptAnswerValue,
  type AuditAcceptItem,
  type AuditAcceptPageResponse,
} from "@/services/auditAcceptanceProcedure";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type AnswerState = Record<
  number,
  AuditAcceptAnswerValue | null
>;

const MODULE_KEY = "audit_accept_proce";

function buildAnswerState(
  items: AuditAcceptItem[],
): AnswerState {
  return items.reduce<AnswerState>(
    (answerState, item) => {
      if (item.response_type === "yes_no") {
        answerState[item.item_id] =
          item.answer_value;
      }

      return answerState;
    },
    {},
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(parsedDate);
}

export default function AuditAcceptancePage() {
  const params = useParams<{
    auditId: string;
  }>();

  const auditId = Number(params.auditId);

  const acceptanceActions =
    useModuleActions(MODULE_KEY);

  const [data, setData] =
    useState<AuditAcceptPageResponse | null>(
      null,
    );

  const [answers, setAnswers] =
    useState<AnswerState>({});

  const [openSectionIds, setOpenSectionIds] =
    useState<Set<number>>(
      () => new Set<number>(),
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  const [isDirty, setIsDirty] =
    useState(false);

  const [message, setMessage] =
    useState<PageMessage | null>(null);

  const sections = useMemo(
    () =>
      data?.items.filter(
        (item) =>
          item.item_type === "section",
      ) ?? [],
    [data],
  );

  const itemsByParent = useMemo(() => {
    const groupedItems = new Map<
      number,
      AuditAcceptItem[]
    >();

    if (!data) {
      return groupedItems;
    }

    data.items.forEach((item) => {
      if (item.parent_item_id == null) {
        return;
      }

      const parentItems =
        groupedItems.get(
          item.parent_item_id,
        ) ?? [];

      parentItems.push(item);

      groupedItems.set(
        item.parent_item_id,
        parentItems,
      );
    });

    return groupedItems;
  }, [data]);

  const answerableItems = useMemo(
    () =>
      data?.items.filter(
        (item) =>
          item.response_type === "yes_no",
      ) ?? [],
    [data],
  );

  const answeredCount = useMemo(
    () =>
      answerableItems.filter(
        (item) =>
          answers[item.item_id] != null,
      ).length,
    [answerableItems, answers],
  );

  const totalQuestionCount =
    answerableItems.length;

  const unansweredCount = Math.max(
    totalQuestionCount - answeredCount,
    0,
  );

  const progressPercentage =
    totalQuestionCount > 0
      ? Math.round(
          (answeredCount /
            totalQuestionCount) *
            100,
        )
      : 0;

  async function loadPage() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response =
        await getAuditAcceptancePage(
          auditId,
        );

      const sectionIds = response.items
        .filter(
          (item) =>
            item.item_type ===
            "section",
        )
        .map((item) => item.item_id);

      setData(response);
      setAnswers(
        buildAnswerState(
          response.items,
        ),
      );
      setOpenSectionIds(
        new Set(sectionIds),
      );
      setIsDirty(false);
    } catch (error) {
      setData(null);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load Acceptance Procedures.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (
      !Number.isInteger(auditId) ||
      auditId <= 0
    ) {
      return;
    }

    let isCancelled = false;

    void Promise.resolve().then(
      async () => {
        if (isCancelled) {
          return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
          const response =
            await getAuditAcceptancePage(
              auditId,
            );

          if (isCancelled) {
            return;
          }

          const sectionIds =
            response.items
              .filter(
                (item) =>
                  item.item_type ===
                  "section",
              )
              .map(
                (item) =>
                  item.item_id,
              );

          setData(response);
          setAnswers(
            buildAnswerState(
              response.items,
            ),
          );
          setOpenSectionIds(
            new Set(sectionIds),
          );
          setIsDirty(false);
        } catch (error) {
          if (isCancelled) {
            return;
          }

          setData(null);
          setMessage({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Failed to load Acceptance Procedures.",
          });
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [auditId]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent,
    ) {
      event.preventDefault();
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, [isDirty]);

  function handleAnswerChange(
    itemId: number,
    value: AuditAcceptAnswerValue | null,
  ) {
    if (
      !acceptanceActions.canUpdate ||
      submitLoading
    ) {
      return;
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [itemId]: value,
    }));

    setIsDirty(true);

    setMessage((currentMessage) =>
      currentMessage?.type === "success"
        ? null
        : currentMessage,
    );
  }

  function toggleSection(
    sectionId: number,
  ) {
    setOpenSectionIds(
      (currentSectionIds) => {
        const nextSectionIds =
          new Set(currentSectionIds);

        if (
          nextSectionIds.has(sectionId)
        ) {
          nextSectionIds.delete(
            sectionId,
          );
        } else {
          nextSectionIds.add(sectionId);
        }

        return nextSectionIds;
      },
    );
  }

  function expandAllSections() {
    setOpenSectionIds(
      new Set(
        sections.map(
          (section) =>
            section.item_id,
        ),
      ),
    );
  }

  function collapseAllSections() {
    setOpenSectionIds(
      new Set<number>(),
    );
  }

  function handleRefresh() {
    if (
      isDirty &&
      !window.confirm(
        "Discard unsaved changes and reload the page?",
      )
    ) {
      return;
    }

    void loadPage();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !data ||
      !acceptanceActions.canUpdate ||
      submitLoading ||
      !isDirty
    ) {
      return;
    }

    if (answerableItems.length === 0) {
      setMessage({
        type: "error",
        text: "No answerable Acceptance Procedure items were found.",
      });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const response =
        await saveAuditAcceptanceResponses(
          auditId,
          {
            template_id:
              data.template.template_id,
            answers:
              answerableItems.map(
                (item) => ({
                  item_id:
                    item.item_id,
                  answer_value:
                    answers[
                      item.item_id
                    ] ?? null,
                }),
              ),
          },
        );

      setData(response.data);
      setAnswers(
        buildAnswerState(
          response.data.items,
        ),
      );
      setIsDirty(false);

      setMessage({
        type: "success",
        text: response.message,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to save Acceptance Procedures.",
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  if (!acceptanceActions.canView) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-rose-700"
          />

          <div>
            <h1 className="text-lg font-black text-rose-900">
              Access denied
            </h1>

            <p className="mt-1 text-sm leading-6 text-rose-700">
              You do not have permission to view
              Acceptance Procedures.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    !Number.isInteger(auditId) ||
    auditId <= 0
  ) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-rose-700"
          />

          <div>
            <h1 className="text-lg font-black text-rose-900">
              Invalid Audit ID
            </h1>

            <p className="mt-1 text-sm leading-6 text-rose-700">
              A valid numeric Audit ID is required
              to load Acceptance Procedures.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <div className="text-center">
          <Loader2
            size={34}
            aria-hidden="true"
            className="mx-auto animate-spin text-slate-600"
          />

          <p className="mt-3 text-sm font-bold text-slate-600">
            Loading Acceptance Procedures...
          </p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-rose-700"
          />

          <div className="flex-1">
            <h1 className="text-lg font-black text-rose-900">
              Unable to load Acceptance Procedures
            </h1>

            <p className="mt-1 text-sm leading-6 text-rose-700">
              {message?.text ||
                "Acceptance Procedures data is unavailable."}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadPage()
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <RefreshCw
                size={17}
                aria-hidden="true"
              />
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 pb-6"
    >
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
                <ClipboardCheck
                  size={28}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                  Audit Planning
                </p>

                <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                  Acceptance Procedures
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Complete the applicable
                  acceptance questions and save
                  the responses for this audit.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/20">
                Audit #{data.audit.audit_id}
              </span>

              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/20">
                {data.audit.audit_year}
              </span>

              {!acceptanceActions.canUpdate ? (
                <span className="rounded-xl bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-200 ring-1 ring-amber-300/30">
                  View only
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Client
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {data.audit.client_name}
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Audit
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {data.audit.audit_name ||
                data.audit.audit_type}
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Year End
            </p>

            <p className="mt-1 flex items-center gap-2 font-bold text-slate-900">
              <CalendarDays
                size={16}
                aria-hidden="true"
                className="text-slate-500"
              />

              {formatDate(
                data.audit.year_end_date,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Template
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {data.template.template_name}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              Version {data.template.version}
              {data.template.reference_no
                ? ` · ${data.template.reference_no}`
                : ""}
            </p>
          </div>
        </div>
      </header>

      {message ? (
        <section
          role={
            message.type === "error"
              ? "alert"
              : "status"
          }
          className={[
            "flex items-start gap-3 rounded-2xl border p-4",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
        >
          {message.type === "success" ? (
            <CheckCircle2
              size={20}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
          ) : (
            <AlertCircle
              size={20}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
          )}

          <p className="text-sm font-bold">
            {message.text}
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900">
                  Completion progress
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {answeredCount} of{" "}
                  {totalQuestionCount} questions
                  answered
                </p>
              </div>

              <span className="text-2xl font-black text-slate-900">
                {progressPercentage}%
              </span>
            </div>

            <div
              className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
              aria-label={`${progressPercentage}% completed`}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
              <p className="text-xl font-black text-emerald-700">
                {answeredCount}
              </p>

              <p className="text-xs font-bold text-emerald-700">
                Answered
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
              <p className="text-xl font-black text-amber-700">
                {unansweredCount}
              </p>

              <p className="text-xs font-bold text-amber-700">
                Remaining
              </p>
            </div>
          </div>
        </div>
      </section>

      {data.template.intro_text ? (
        <section className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <ShieldCheck
            size={22}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-sky-700"
          />

          <p className="whitespace-pre-line text-sm leading-7 text-sky-900">
            {data.template.intro_text}
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-slate-900">
            Procedure sections
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Expand only the sections you need,
            or show all sections together.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={expandAllSections}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ChevronsDown
              size={17}
              aria-hidden="true"
            />
            Expand all
          </button>

          <button
            type="button"
            onClick={collapseAllSections}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ChevronsUp
              size={17}
              aria-hidden="true"
            />
            Collapse all
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={submitLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </section>

      <div className="space-y-4">
        {sections.length > 0 ? (
          sections.map((section) => (
            <AcceptanceSection
              key={section.item_id}
              section={section}
              items={
                itemsByParent.get(
                  section.item_id,
                ) ?? []
              }
              answers={answers}
              isOpen={openSectionIds.has(
                section.item_id,
              )}
              disabled={
                !acceptanceActions.canUpdate ||
                submitLoading
              }
              onToggle={() =>
                toggleSection(
                  section.item_id,
                )
              }
              onAnswerChange={
                handleAnswerChange
              }
            />
          ))
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <ClipboardCheck
              size={30}
              aria-hidden="true"
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 font-bold text-slate-700">
              No Acceptance Procedure
              sections were found.
            </p>
          </section>
        )}
      </div>

      <section className="sticky bottom-4 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-slate-900">
              {isDirty
                ? "You have unsaved changes"
                : "All changes are saved"}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {acceptanceActions.canUpdate
                ? `${answeredCount} of ${totalQuestionCount} questions currently answered.`
                : "You have view-only access to this page."}
            </p>
          </div>

          <button
            type="submit"
            disabled={
              !acceptanceActions.canUpdate ||
              !isDirty ||
              submitLoading
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLoading ? (
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

            {submitLoading
              ? "Saving..."
              : "Save Responses"}
          </button>
        </div>
      </section>
    </form>
  );
}