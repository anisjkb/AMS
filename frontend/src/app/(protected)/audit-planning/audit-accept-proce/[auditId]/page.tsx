"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
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

import AcceptanceCompletionPanel, {
  buildAcceptanceCompletionFormState,
  type AcceptanceCompletionFormState,
} from "@/components/audit-acceptance/AcceptanceCompletionPanel";
import AcceptanceReviewPanel, {
  type AcceptanceYesResponse,
} from "@/components/audit-acceptance/AcceptanceReviewPanel";
import AcceptanceSection from "@/components/audit-acceptance/AcceptanceSection";
import AcceptanceWizardStepper, {
  type AcceptanceWizardStep,
} from "@/components/audit-acceptance/AcceptanceWizardStepper";
import AcceptanceWorkflowPanel, {
  type AcceptanceSignFormState,
} from "@/components/audit-acceptance/AcceptanceWorkflowPanel";
import { useModuleActions } from "@/hooks/useModuleActions";

import {
  getAuditAcceptanceCompletionState,
  getAuditAcceptancePage,
  listAuditAcceptanceSignerOptions,
  saveAuditAcceptanceCompletion,
  saveAuditAcceptanceResponses,
  signAuditAcceptanceEngagementPartner,
  submitAuditAcceptanceCompletion,
  type AuditAcceptAnswerValue,
  type AuditAcceptCompletionStateResponse,
  type AuditAcceptItem,
  type AuditAcceptPageResponse,
  type AuditAcceptSignerOption,
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

const EDITABLE_WORKFLOW_STATUSES = new Set([
  "draft",
  "changes_requested",
  "reopened",
]);

function nullableText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0
    ? trimmedValue
    : null;
}

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
  const router = useRouter();

  const [
    pendingConfirmation,
    setPendingConfirmation,
  ] = useState<"back" | "refresh" | "submit" | "sign" | null>(
    null,
  );

  const [activeStep, setActiveStep] =
    useState<AcceptanceWizardStep>(1);

  const [
    showYesResponses,
    setShowYesResponses,
  ] = useState(false);

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

  const [
    completionState,
    setCompletionState,
  ] =
    useState<AuditAcceptCompletionStateResponse | null>(
      null,
    );

  const [
    completionForm,
    setCompletionForm,
  ] =
    useState<AcceptanceCompletionFormState | null>(
      null,
    );

  const [
    completionDirty,
    setCompletionDirty,
  ] = useState(false);

  const [
    completionSaveLoading,
    setCompletionSaveLoading,
  ] = useState(false);

  const [
    signerOptions,
    setSignerOptions,
  ] = useState<AuditAcceptSignerOption[]>(
    [],
  );

  const [
    signForm,
    setSignForm,
  ] = useState<AcceptanceSignFormState>({
    employee_id: "",
    declaration_text: "",
    remarks: "",
  });

  const [
    workflowSubmitLoading,
    setWorkflowSubmitLoading,
  ] = useState(false);

  const [
    signLoading,
    setSignLoading,
  ] = useState(false);

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

  const workflowStatus =
    completionState?.completion.workflow_status ??
    "draft";

  const workflowVersion =
    completionState?.completion.workflow_version ??
    1;

  const workflowIsEditable =
    completionState !== null &&
    EDITABLE_WORKFLOW_STATUSES.has(
      workflowStatus,
    );

  const canEditWorkflow =
    acceptanceActions.canUpdate &&
    workflowIsEditable;

  const canSubmitWorkflow =
    acceptanceActions.canSubmit &&
    workflowIsEditable;

  const canSignWorkflow =
    acceptanceActions.canSign &&
    workflowStatus ===
      "pending_partner_signoff";

  const isBusy =
    submitLoading ||
    completionSaveLoading ||
    workflowSubmitLoading ||
    signLoading;

  const hasUnsavedChanges =
    isDirty ||
    completionDirty;

  const requiredUnansweredCount =
    useMemo(
      () =>
        answerableItems.filter(
          (item) =>
            item.is_required &&
            answers[item.item_id] == null,
        ).length,
      [answerableItems, answers],
    );

  const yesResponses =
    useMemo<AcceptanceYesResponse[]>(
      () =>
        answerableItems
          .filter(
            (item) =>
              answers[item.item_id] ===
              "yes",
          )
          .map((item) => {
            const parentSection =
              sections.find(
                (section) =>
                  section.item_id ===
                  item.parent_item_id,
              );

            return {
              itemId: item.item_id,
              itemNo: item.item_no,
              label:
                item.title ||
                item.content ||
                item.item_key,
              sectionTitle:
                parentSection?.title ||
                parentSection?.content ||
                parentSection?.item_no ||
                "Procedure section",
            };
          }),
      [
        answerableItems,
        answers,
        sections,
      ],
    );

  const confirmationCount =
    useMemo(() => {
      if (!completionForm) {
        return 0;
      }

      return [
        completionForm
          .confirm_relevant_information,
        completionForm
          .confirm_independence_evaluated,
        completionForm
          .confirm_threats_addressed,
        completionForm
          .confirm_safeguards_applied,
        completionForm
          .confirm_conclusion_documented,
      ].filter(Boolean).length;
    }, [completionForm]);

  const completionValidationMessages =
    useMemo(() => {
      if (!completionForm) {
        return [
          "Acceptance Conclusion details are unavailable.",
        ];
      }

      const issues: string[] = [];

      if (
        !completionForm.acceptance_decision
      ) {
        issues.push(
          "Select an Acceptance Decision.",
        );
      }

      if (
        completionForm
          .conclusion_remarks
          .trim()
          .length === 0
      ) {
        issues.push(
          "Record the conclusion and supporting remarks.",
        );
      }

      if (
        !completionForm
          .no_safeguard_required &&
        completionForm
          .safeguards_text
          .trim()
          .length === 0
      ) {
        issues.push(
          "Describe the safeguards applied, or confirm that no safeguard is required.",
        );
      }

      if (confirmationCount < 5) {
        issues.push(
          "Complete all five required confirmations.",
        );
      }


      return issues;
    }, [
      completionForm,
      confirmationCount,
    ]);

  const reviewReady =
    requiredUnansweredCount === 0 &&
    Boolean(completionState?.exists) &&
    completionValidationMessages
      .length === 0 &&
    !hasUnsavedChanges;

  const reviewValidationMessages =
    useMemo(() => {
      const issues: string[] = [];

      if (requiredUnansweredCount > 0) {
        issues.push(
          `${requiredUnansweredCount} required procedure question${
            requiredUnansweredCount === 1
              ? ""
              : "s"
          } remain unanswered.`,
        );
      }

      if (!completionState?.exists) {
        issues.push(
          "Save the Acceptance Conclusion draft.",
        );
      }

      issues.push(
        ...completionValidationMessages,
      );

      if (hasUnsavedChanges) {
        issues.push(
          "Save all current changes.",
        );
      }

      return Array.from(
        new Set(issues),
      );
    }, [
      requiredUnansweredCount,
      completionState?.exists,
      completionValidationMessages,
      hasUnsavedChanges,
    ]);

  const availableWizardSteps =
    useMemo<AcceptanceWizardStep[]>(
      () => {
        if (!workflowIsEditable) {
          return [3];
        }

        const steps:
          AcceptanceWizardStep[] = [1];

        if (
          requiredUnansweredCount === 0 &&
          !isDirty
        ) {
          steps.push(2);
        }

        if (reviewReady) {
          steps.push(3);
        }

        return steps;
      },
      [
        requiredUnansweredCount,
        isDirty,
        reviewReady,
        workflowIsEditable,
      ],
    );

  const displayedWizardStep:
    AcceptanceWizardStep =
      workflowIsEditable
        ? activeStep
        : 3;

  async function loadPage() {
    setIsLoading(true);
    setMessage(null);

    try {
      const [
        response,
        completionResponse,
        signerResponse,
      ] = await Promise.all([
        getAuditAcceptancePage(auditId),
        getAuditAcceptanceCompletionState(
          auditId,
        ),
        listAuditAcceptanceSignerOptions(),
      ]);

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

      setCompletionState(
        completionResponse,
      );

      setCompletionForm(
        buildAcceptanceCompletionFormState(
          completionResponse.completion,
        ),
      );

      setSignerOptions(
        signerResponse.items,
      );

      setSignForm({
        employee_id: "",
        declaration_text: "",
        remarks: "",
      });

      setIsDirty(false);
      setCompletionDirty(false);
    } catch (error) {
      setData(null);
      setCompletionState(null);
      setCompletionForm(null);
      setCompletionDirty(false);
      setSignerOptions([]);

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
          const [
            response,
            completionResponse,
            signerResponse,
          ] = await Promise.all([
            getAuditAcceptancePage(auditId),
            getAuditAcceptanceCompletionState(
              auditId,
            ),
            listAuditAcceptanceSignerOptions(),
          ]);

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

          setCompletionState(
            completionResponse,
          );

          setCompletionForm(
            buildAcceptanceCompletionFormState(
              completionResponse.completion,
            ),
          );

          setSignerOptions(
            signerResponse.items,
          );

          setSignForm({
            employee_id: "",
            declaration_text: "",
            remarks: "",
          });

          setIsDirty(false);
          setCompletionDirty(false);
        } catch (error) {
          if (isCancelled) {
            return;
          }

          setData(null);
          setCompletionState(null);
          setCompletionForm(null);
          setCompletionDirty(false);
          setSignerOptions([]);

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
    if (!hasUnsavedChanges) {
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
  }, [hasUnsavedChanges]);

  function handleAnswerChange(
    itemId: number,
    value: AuditAcceptAnswerValue | null,
  ) {
    if (
      !canEditWorkflow ||
      isBusy
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

  function handleBackToSelection() {
    if (hasUnsavedChanges) {
      setPendingConfirmation("back");
      return;
    }

    router.push(
      "/audit-planning/audit-accept-proce",
    );
  }

  function handleRefresh() {
    if (hasUnsavedChanges) {
      setPendingConfirmation("refresh");
      return;
    }

    void loadPage();
  }

  function closeDiscardConfirmation() {
    setPendingConfirmation(null);
  }

  function confirmDiscardChanges() {
    const action = pendingConfirmation;

    setPendingConfirmation(null);

    if (action === "back") {
      router.push(
        "/audit-planning/audit-accept-proce",
      );
      return;
    }

    if (action === "refresh") {
      void loadPage();
      return;
    }

    if (action === "submit") {
      void handleSubmitWorkflow(true);
      return;
    }

    if (action === "sign") {
      void handleEngagementPartnerSign(true);
    }
  }
  async function saveQuestionnaireDraft() {
    if (
      !data ||
      !canEditWorkflow ||
      isBusy
    ) {
      return false;
    }

    if (!isDirty) {
      return true;
    }

    if (answerableItems.length === 0) {
      setMessage({
        type: "error",
        text: "No answerable Acceptance Procedure items were found.",
      });

      return false;
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

      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to save Acceptance Procedures.",
      });

      return false;
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await saveQuestionnaireDraft();
  }

  function handleCompletionFieldChange<
    K extends keyof AcceptanceCompletionFormState,
  >(
    field: K,
    value: AcceptanceCompletionFormState[K],
  ) {
    if (
      !canEditWorkflow ||
      isBusy ||
      !completionForm
    ) {
      return;
    }

    setCompletionForm({
      ...completionForm,
      [field]: value,
    });

    setCompletionDirty(true);
  }

  async function saveCompletionDraft() {
    if (
      !data ||
      !completionState ||
      !completionForm ||
      !canEditWorkflow ||
      isBusy
    ) {
      return false;
    }

    if (!completionDirty) {
      return completionState.exists;
    }

    setCompletionSaveLoading(true);
    setMessage(null);

    try {
      const response =
        await saveAuditAcceptanceCompletion(
          auditId,
          {
            template_id:
              data.template.template_id,
            file_no: nullableText(
              completionForm.file_no,
            ),
            safeguards_text:
              completionForm
                .no_safeguard_required
                ? null
                : nullableText(
                    completionForm
                      .safeguards_text,
                  ),
            no_safeguard_required:
              completionForm
                .no_safeguard_required,
            acceptance_decision:
              completionForm
                .acceptance_decision,
            conclusion_remarks:
              nullableText(
                completionForm
                  .conclusion_remarks,
              ),
            confirm_relevant_information:
              completionForm
                .confirm_relevant_information,
            confirm_independence_evaluated:
              completionForm
                .confirm_independence_evaluated,
            confirm_threats_addressed:
              completionForm
                .confirm_threats_addressed,
            confirm_safeguards_applied:
              completionForm
                .confirm_safeguards_applied,
            confirm_conclusion_documented:
              completionForm
                .confirm_conclusion_documented,

          },
        );

      setCompletionState({
        ...completionState,
        exists:
          response.data.completion_id !==
          null,
        completion: response.data,
      });

      setCompletionForm(
        buildAcceptanceCompletionFormState(
          response.data,
        ),
      );

      setCompletionDirty(false);

      setMessage({
        type: "success",
        text: response.message,
      });

      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to save Acceptance Conclusion.",
      });

      return false;
    } finally {
      setCompletionSaveLoading(false);
    }
  }

  async function handleSaveCompletion() {
    await saveCompletionDraft();
  }

  async function handleSaveAndContinue() {
    if (requiredUnansweredCount > 0) {
      setMessage({
        type: "error",
        text:
          `${requiredUnansweredCount} required procedure question${
            requiredUnansweredCount === 1
              ? ""
              : "s"
          } remain unanswered.`,
      });

      return;
    }

    const saved =
      await saveQuestionnaireDraft();

    if (!saved) {
      return;
    }

    setActiveStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSaveAndReview() {
    if (
      completionValidationMessages
        .length > 0
    ) {
      setMessage({
        type: "error",
        text:
          completionValidationMessages[0],
      });

      return;
    }

    const saved =
      await saveCompletionDraft();

    if (!saved) {
      return;
    }

    setActiveStep(3);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleWizardStepSelect(
    step: AcceptanceWizardStep,
  ) {
    if (!workflowIsEditable) {
      return;
    }

    if (step === displayedWizardStep) {
      return;
    }

    if (
      !availableWizardSteps.includes(
        step,
      )
    ) {
      return;
    }

    if (hasUnsavedChanges) {
      setMessage({
        type: "error",
        text:
          "Save the current changes before moving to another step.",
      });

      return;
    }

    setActiveStep(step);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePreviousWizardStep() {
    if (hasUnsavedChanges) {
      setMessage({
        type: "error",
        text:
          "Save the current changes before returning to the previous step.",
      });

      return;
    }

    setActiveStep(
      displayedWizardStep === 3
        ? 2
        : 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleSignFormChange<
    K extends keyof AcceptanceSignFormState,
  >(
    field: K,
    value: AcceptanceSignFormState[K],
  ) {
    if (isBusy) {
      return;
    }

    setSignForm({
      ...signForm,
      [field]: value,
    });
  }

  async function handleSubmitWorkflow(confirmed = false) {
    if (
      !completionState ||
      !canSubmitWorkflow ||
      !completionState.exists ||
      isBusy
    ) {
      return;
    }

    if (hasUnsavedChanges) {
      setMessage({
        type: "error",
        text:
          "Save all questionnaire and completion changes before submitting.",
      });
      return;
    }

    if (!confirmed) {
      setPendingConfirmation("submit");
      return;
    }

    setWorkflowSubmitLoading(true);
    setMessage(null);

    try {
      const response =
        await submitAuditAcceptanceCompletion(
          auditId,
          {
            expected_workflow_version:
              workflowVersion,
          },
        );

      setCompletionState({
        ...completionState,
        exists: true,
        completion: response.data,
      });

      setCompletionForm(
        buildAcceptanceCompletionFormState(
          response.data,
        ),
      );

      setCompletionDirty(false);

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
            : "Failed to submit the Acceptance workflow.",
      });
    } finally {
      setWorkflowSubmitLoading(false);
    }
  }

  async function handleEngagementPartnerSign(confirmed = false) {
    if (
      !completionState ||
      !canSignWorkflow ||
      isBusy
    ) {
      return;
    }

    const employeeId = Number(
      signForm.employee_id,
    );

    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      setMessage({
        type: "error",
        text:
          "Select the Employee who is signing as Engagement Partner.",
      });
      return;
    }

    if (!confirmed) {
      setPendingConfirmation("sign");
      return;
    }

    setSignLoading(true);
    setMessage(null);

    try {
      const response =
        await signAuditAcceptanceEngagementPartner(
          auditId,
          {
            employee_id: employeeId,
            expected_workflow_version:
              workflowVersion,
            declaration_text:
              nullableText(
                signForm.declaration_text,
              ),
            remarks: nullableText(
              signForm.remarks,
            ),
          },
        );

      const nextSignoffs =
        completionState.signoffs.filter(
          (signoff) =>
            !(
              signoff.is_current &&
              signoff.signoff_role ===
                response.data.signoff
                  .signoff_role &&
              signoff.workflow_version ===
                response.data.signoff
                  .workflow_version
            ),
        );

      setCompletionState({
        ...completionState,
        exists: true,
        completion:
          response.data.completion,
        signoffs: [
          ...nextSignoffs,
          response.data.signoff,
        ],
      });

      setCompletionForm(
        buildAcceptanceCompletionFormState(
          response.data.completion,
        ),
      );

      setSignForm({
        employee_id: "",
        declaration_text: "",
        remarks: "",
      });

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
            : "Failed to apply the Engagement Partner sign-off.",
      });
    } finally {
      setSignLoading(false);
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
              <button
                type="button"
                onClick={handleBackToSelection}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <ArrowLeft
                  size={16}
                  aria-hidden="true"
                />

                Back to Audit Selection
              </button>

              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/20">
                Audit #{data.audit.audit_id}
              </span>

              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/20">
                {data.audit.audit_year}
              </span>

              {!canEditWorkflow ? (
                <span className="rounded-xl bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-200 ring-1 ring-amber-300/30">
                  Workflow locked
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
                  Procedure progress
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

      <AcceptanceWizardStepper
        activeStep={
          displayedWizardStep
        }
        availableSteps={
          availableWizardSteps
        }
        onStepSelect={
          workflowIsEditable
            ? handleWizardStepSelect
            : undefined
        }
      />

      {displayedWizardStep === 2 &&
      completionState &&
      completionForm ? (
        <AcceptanceCompletionPanel
          exists={completionState.exists}
          workflowStatus={
            workflowStatus
          }
          workflowVersion={
            workflowVersion
          }
          form={completionForm}
          canEdit={canEditWorkflow}
          isDirty={completionDirty}
          isSaving={
            completionSaveLoading
          }
          onChange={
            handleCompletionFieldChange
          }
          onSave={() =>
            void handleSaveCompletion()
          }
        />
      ) : null}

      {displayedWizardStep === 3 &&
      completionState &&
      completionForm ? (
        <AcceptanceReviewPanel
          clientName={
            data.audit.client_name
          }
          auditName={
            data.audit.audit_name
          }
          auditType={
            data.audit.audit_type
          }
          auditYear={
            data.audit.audit_year
          }
          auditId={
            data.audit.audit_id
          }
          answeredCount={
            answeredCount
          }
          totalQuestionCount={
            totalQuestionCount
          }
          confirmationCount={
            confirmationCount
          }
          acceptanceDecision={
            completionForm
              .acceptance_decision
          }
          noSafeguardRequired={
            completionForm
              .no_safeguard_required
          }
          safeguardsText={
            completionForm
              .safeguards_text
          }
          conclusionRemarks={
            completionForm
              .conclusion_remarks
          }
          yesResponses={
            yesResponses
          }
          showYesResponses={
            showYesResponses
          }
          onToggleYesResponses={() =>
            setShowYesResponses(
              (current) => !current,
            )
          }
          reviewReady={reviewReady}
          validationMessages={
            reviewValidationMessages
          }
        />
      ) : null}

      {displayedWizardStep === 3 &&
      completionState &&
      !workflowIsEditable ? (
        <AcceptanceWorkflowPanel
          workflowStatus={
            workflowStatus
          }
          workflowVersion={
            workflowVersion
          }
          completionExists={
            completionState.exists
          }
          signoffs={
            completionState.signoffs
          }
          signerOptions={
            signerOptions
          }
          canSubmit={
            canSubmitWorkflow
          }
          canSign={canSignWorkflow}
          hasUnsavedChanges={
            hasUnsavedChanges
          }
          isBusy={isBusy}
          isSubmitting={
            workflowSubmitLoading
          }
          isSigning={signLoading}
          signForm={signForm}
          onSignFormChange={
            handleSignFormChange
          }
          onSubmit={() =>
            void handleSubmitWorkflow()
          }
          onSign={() =>
            void handleEngagementPartnerSign()
          }
        />
      ) : null}

      {displayedWizardStep === 1 ? (
        <>
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
            disabled={isBusy}
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
                !canEditWorkflow ||
                isBusy
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

        </>
      ) : null}

{pendingConfirmation ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeDiscardConfirmation();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="workflow-confirmation-title"
            aria-describedby="workflow-confirmation-description"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.45)]"
          >
            <div
              className={[
                "border-b bg-gradient-to-r via-white p-6 sm:p-7",
                pendingConfirmation === "sign"
                  ? "border-violet-100 from-violet-50 to-indigo-50"
                  : pendingConfirmation === "submit"
                    ? "border-amber-100 from-amber-50 to-orange-50"
                    : "border-rose-100 from-rose-50 to-amber-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-8",
                    pendingConfirmation === "sign"
                      ? "bg-violet-100 text-violet-700 ring-violet-50"
                      : pendingConfirmation === "submit"
                        ? "bg-amber-100 text-amber-700 ring-amber-50"
                        : "bg-rose-100 text-rose-700 ring-rose-50",
                  ].join(" ")}
                >
                  <AlertCircle
                    size={24}
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "text-xs font-black uppercase tracking-[0.18em]",
                      pendingConfirmation === "sign"
                        ? "text-violet-700"
                        : pendingConfirmation === "submit"
                          ? "text-amber-700"
                          : "text-rose-700",
                    ].join(" ")}
                  >
                    {pendingConfirmation === "submit" ||
                    pendingConfirmation === "sign"
                      ? "Confirmation required"
                      : "Action required"}
                  </p>

                  <h2
                    id="workflow-confirmation-title"
                    className="mt-1 text-2xl font-black tracking-tight text-slate-950"
                  >
                    {pendingConfirmation === "submit"
                      ? "Submit for Partner Sign-off"
                      : pendingConfirmation === "sign"
                        ? "Confirm Engagement Partner Sign-off"
                        : "Unsaved changes"}
                  </h2>

                  <p
                    id="workflow-confirmation-description"
                    className="mt-2 text-sm font-normal leading-6 text-slate-600"
                  >
                    {pendingConfirmation === "back"
                      ? "Returning to Audit Selection will discard the changes made on this page."
                      : pendingConfirmation === "refresh"
                        ? "Reloading this page will discard the changes made since your last save."
                        : pendingConfirmation === "submit"
                          ? "This acceptance record will be submitted for Engagement Partner review. Editing will be locked after submission."
                          : "The selected Employee will be recorded as the Engagement Partner signer for the current workflow version."}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close confirmation"
                  onClick={closeDiscardConfirmation}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl font-medium text-slate-400 transition hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-7">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {pendingConfirmation === "submit"
                        ? "Submission review"
                        : pendingConfirmation === "sign"
                          ? "Sign-off review"
                          : "Current questionnaire"}
                    </p>

                    <p className="mt-1 text-xs font-normal leading-5 text-slate-500">
                      {pendingConfirmation === "submit"
                        ? "Saved answers and conclusion details will be sent for Partner review."
                        : pendingConfirmation === "sign"
                          ? "Review the selected signer and sign-off details before confirming."
                          : "Previously saved information will remain unchanged."}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-white px-4 py-2 text-center shadow-sm ring-1 ring-slate-200">
                    <p className="text-lg font-black text-slate-950">
                      {answeredCount}/{totalQuestionCount}
                    </p>

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Answered
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDiscardConfirmation}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  {pendingConfirmation === "submit"
                    ? "Continue reviewing"
                    : pendingConfirmation === "sign"
                      ? "Review again"
                      : "Keep editing"}
                </button>

                <button
                  type="button"
                  onClick={confirmDiscardChanges}
                  disabled={isBusy}
                  className={[
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    pendingConfirmation === "sign"
                      ? "bg-violet-700 shadow-violet-700/20 hover:bg-violet-600 focus-visible:ring-violet-500"
                      : pendingConfirmation === "submit"
                        ? "bg-amber-700 shadow-amber-700/20 hover:bg-amber-600 focus-visible:ring-amber-500"
                        : "bg-rose-600 shadow-rose-600/20 hover:bg-rose-700 focus-visible:ring-rose-500",
                  ].join(" ")}
                >
                  {pendingConfirmation === "back"
                    ? "Discard & return"
                    : pendingConfirmation === "refresh"
                      ? "Discard & reload"
                      : pendingConfirmation === "submit"
                        ? "Submit for review"
                        : "Confirm sign-off"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
      <section className="sticky bottom-3 z-30 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur sm:px-4">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex min-h-8 items-center rounded-lg bg-slate-950 px-3 text-xs font-black text-white">
              Step {displayedWizardStep}/3
            </span>

            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700">
              <span className="text-slate-500">
                Answered
              </span>

              <strong className="text-slate-950">
                {answeredCount}/{totalQuestionCount}
              </strong>
            </span>

            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700">
              <span className="text-rose-500">
                Yes
              </span>

              <strong>
                {yesResponses.length}
              </strong>
            </span>

            {displayedWizardStep >= 2 ? (
              <>
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-bold text-violet-700">
                  <span className="text-violet-500">
                    Declarations
                  </span>

                  <strong>
                    {confirmationCount}/5
                  </strong>
                </span>

                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-bold capitalize text-sky-700">
                  <span className="text-sky-500">
                    Decision
                  </span>

                  <strong>
                    {completionForm
                      ?.acceptance_decision
                      ? completionForm
                          .acceptance_decision
                          .split("_")
                          .join(" ")
                      : "Pending"}
                  </strong>
                </span>
              </>
            ) : null}

            <span
              className={[
                "inline-flex min-h-8 items-center rounded-lg px-3 text-xs font-black",
                !workflowIsEditable
                  ? "bg-slate-100 text-slate-700"
                  : hasUnsavedChanges
                    ? "bg-amber-100 text-amber-800"
                    : displayedWizardStep === 3 &&
                        reviewReady
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {!workflowIsEditable
                ? workflowStatus
                    .split("_")
                    .join(" ")
                : hasUnsavedChanges
                  ? "Unsaved changes"
                  : displayedWizardStep === 3 &&
                      reviewReady
                    ? "Ready to submit"
                    : "Saved"}
            </span>
          </div>

          {displayedWizardStep === 1 ? (
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              <button
                type="submit"
                disabled={
                  !canEditWorkflow ||
                  !isDirty ||
                  isBusy
                }
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitLoading ? (
                  <Loader2
                    size={16}
                    aria-hidden="true"
                    className="animate-spin"
                  />
                ) : (
                  <Save
                    size={16}
                    aria-hidden="true"
                  />
                )}

                {submitLoading
                  ? "Saving..."
                  : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSaveAndContinue()
                }
                disabled={
                  !canEditWorkflow ||
                  isBusy
                }
                className="inline-flex min-h-9 items-center justify-center rounded-lg bg-violet-700 px-3.5 py-2 text-xs font-black text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save & Continue
              </button>
            </div>
          ) : null}

          {displayedWizardStep === 2 ? (
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={
                  handlePreviousWizardStep
                }
                disabled={isBusy}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSaveAndReview()
                }
                disabled={
                  !canEditWorkflow ||
                  isBusy
                }
                className="inline-flex min-h-9 items-center justify-center rounded-lg bg-violet-700 px-3.5 py-2 text-xs font-black text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save & Review
              </button>
            </div>
          ) : null}

          {displayedWizardStep === 3 ? (
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {workflowIsEditable ? (
                <button
                  type="button"
                  onClick={
                    handlePreviousWizardStep
                  }
                  disabled={isBusy}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
              ) : null}

              {workflowIsEditable ? (
                <button
                  type="button"
                  onClick={() =>
                    void handleSubmitWorkflow()
                  }
                  disabled={
                    !reviewReady ||
                    !canSubmitWorkflow ||
                    isBusy
                  }
                  className="inline-flex min-h-9 items-center justify-center rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {workflowSubmitLoading
                    ? "Submitting..."
                    : "Submit for Partner Sign-off"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </form>
  );
}
















