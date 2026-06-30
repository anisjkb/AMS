"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudPillBadge, CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import {
  listAuditDiscussionIssues,
  type AuditDiscussionIssue,
} from "@/services/auditDiscussionIssue";
import { listAuditTeams, type AuditTeam } from "@/services/auditTeam";
import {
  listAuditVisitInfo,
  type AuditVisitInfo,
} from "@/services/auditVisitInfo";
import {
  createAuditVisitObservation,
  deactivateAuditVisitObservation,
  listAuditVisitObservations,
  permanentDeleteAuditVisitObservation,
  restoreAuditVisitObservation,
  updateAuditVisitObservation,
  type AuditVisitObservation,
  type AuditVisitObservationPayload,
} from "@/services/auditVisitObservation";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  issue_id: string;
  audit_type: string;
  discussion_point: string;
  observation_discussion: string;
  observation_decision: string;
  visit_id: string;
  audit_id: string;
  team_id: string;
  observation_note: string;
  status: string;
};

const emptyForm: FormState = {
  issue_id: "",
  audit_type: "",
  discussion_point: "",
  observation_discussion: "",
  observation_decision: "",
  visit_id: "",
  audit_id: "",
  team_id: "",
  observation_note: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "reviewed", label: "Reviewed" },
  { value: "closed", label: "Closed" },
  { value: "inactive", label: "Inactive" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toTitle(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function truncateText(value: string | null | undefined, maxLength = 80) {
  if (!value) return "-";
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength).trim()}...`;
}

function buildVisitLabel(visit: AuditVisitInfo) {
  return `Visit #${visit.visit_id} - ${formatDate(visit.visit_date)} - Audit #${
    visit.audit_id
  }`;
}

function buildIssueLabel(issue: AuditDiscussionIssue) {
  return `${issue.discussion_point} (${issue.audit_type})`;
}

function buildFormFromItem(item: AuditVisitObservation): FormState {
  return {
    issue_id: item.issue_id ? String(item.issue_id) : "",
    audit_type: item.audit_type,
    discussion_point: item.discussion_point,
    observation_discussion: item.observation_discussion,
    observation_decision: item.observation_decision,
    visit_id: item.visit_id ? String(item.visit_id) : "",
    audit_id: item.audit_id ? String(item.audit_id) : "",
    team_id: item.team_id ? String(item.team_id) : "",
    observation_note: item.observation_note ?? "",
    status: item.status,
  };
}

function optionalNumber(value: string) {
  if (!value.trim()) return null;

  return Number.parseInt(value, 10);
}

function buildPayload(form: FormState): AuditVisitObservationPayload {
  return {
    issue_id: optionalNumber(form.issue_id),
    audit_type: form.audit_type.trim(),
    discussion_point: form.discussion_point.trim(),
    observation_discussion: form.observation_discussion.trim(),
    observation_decision: form.observation_decision.trim(),
    visit_id: optionalNumber(form.visit_id),
    audit_id: optionalNumber(form.audit_id),
    team_id: optionalNumber(form.team_id),
    observation_note: form.observation_note.trim() || null,
    status: form.status.trim(),
  };
}

export default function AuditVisitObservationsPage() {
  const visitObservationActions = useModuleActions("audit_visit_observation");

  const [items, setItems] = useState<AuditVisitObservation[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visitFilter, setVisitFilter] = useState("all");
  const [auditTypeFilter, setAuditTypeFilter] = useState("all");

  const [visitOptions, setVisitOptions] = useState<AuditVisitInfo[]>([]);
  const [issueOptions, setIssueOptions] = useState<AuditDiscussionIssue[]>([]);
  const [teamOptions, setTeamOptions] = useState<AuditTeam[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] =
    useState<AuditVisitObservation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] =
    useState<AuditVisitObservation | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = useMemo(() => {
    if (pageSize === "all") {
      return Math.max(Math.min(total || 100, 100), 1);
    }

    return Number(pageSize);
  }, [pageSize, total]);

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;

    return Math.max(Math.ceil(total / numericPageSize), 1);
  }, [numericPageSize, pageSize, total]);

  const isActiveFilter = useMemo(() => {
    if (statusFilter === "all") return undefined;

    return statusFilter === "active";
  }, [statusFilter]);

  const selectedVisitFilter = useMemo(() => {
    if (visitFilter === "all") return undefined;

    return Number.parseInt(visitFilter, 10);
  }, [visitFilter]);

  const selectedAuditTypeFilter = useMemo(() => {
    if (auditTypeFilter === "all") return undefined;

    return auditTypeFilter;
  }, [auditTypeFilter]);

  const visitMap = useMemo(() => {
    return new Map(visitOptions.map((visit) => [visit.visit_id, visit]));
  }, [visitOptions]);

  const issueMap = useMemo(() => {
    return new Map(issueOptions.map((issue) => [issue.issue_id, issue]));
  }, [issueOptions]);

  const auditTypeOptions = useMemo(() => {
    return Array.from(
      new Set(issueOptions.map((issue) => issue.audit_type).filter(Boolean)),
    ).sort((first, second) => first.localeCompare(second));
  }, [issueOptions]);

  const filteredIssueOptions = useMemo(() => {
    if (!form.audit_type) return issueOptions;

    return issueOptions.filter((issue) => issue.audit_type === form.audit_type);
  }, [form.audit_type, issueOptions]);

  const showTopActions = visitObservationActions.showTopActions;
  const showRowActions = visitObservationActions.showRowActions;
  const tableColumnCount = showRowActions ? 9 : 8;

  const loadAuditVisitObservations = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditVisitObservations({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch,
        isActive: isActiveFilter,
        visitId: selectedVisitFilter,
        auditType: selectedAuditTypeFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load Audit Visit Observations.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    isActiveFilter,
    numericPageSize,
    page,
    selectedAuditTypeFilter,
    selectedVisitFilter,
  ]);

  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const [visitsResponse, issuesResponse, teamsResponse] = await Promise.all([
        listAuditVisitInfo({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        listAuditDiscussionIssues({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        listAuditTeams({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
      ]);

      setVisitOptions(visitsResponse.items);
      setIssueOptions(issuesResponse.items);
      setTeamOptions(teamsResponse.items);
    } catch {
      setVisitOptions([]);
      setIssueOptions([]);
      setTeamOptions([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditVisitObservations();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditVisitObservations]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadCatalogs();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadCatalogs]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const applyVisitToForm = (visitId: string) => {
    const visit = visitMap.get(Number.parseInt(visitId, 10));

    setForm((current) => ({
      ...current,
      visit_id: visitId,
      audit_id: visit ? String(visit.audit_id) : current.audit_id,
      team_id: visit ? String(visit.team_id) : current.team_id,
    }));
  };

  const applyIssueToForm = (issueId: string) => {
    const issue = issueMap.get(Number.parseInt(issueId, 10));

    setForm((current) => ({
      ...current,
      issue_id: issueId,
      audit_type: issue?.audit_type ?? current.audit_type,
      discussion_point: issue?.discussion_point ?? current.discussion_point,
      observation_decision:
        issue?.default_decision ?? current.observation_decision,
    }));
  };

  const openCreateDrawer = () => {
    const firstVisit = visitOptions[0];
    const firstIssue = issueOptions[0];

    setDrawerMode("create");
    setSelectedItem(null);
    setForm({
      ...emptyForm,
      visit_id: firstVisit ? String(firstVisit.visit_id) : "",
      audit_id: firstVisit ? String(firstVisit.audit_id) : "",
      team_id: firstVisit ? String(firstVisit.team_id) : "",
      issue_id: firstIssue ? String(firstIssue.issue_id) : "",
      audit_type: firstIssue?.audit_type ?? "",
      discussion_point: firstIssue?.discussion_point ?? "",
      observation_decision: firstIssue?.default_decision ?? "",
    });
    setDrawerOpen(true);
    void loadCatalogs();
  };

  const openEditDrawer = (item: AuditVisitObservation) => {
    setDrawerMode("edit");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
    void loadCatalogs();
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const openConfirm = (item: AuditVisitObservation, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.visit_id.trim()) {
      setMessage({ type: "error", text: "Audit Visit Info is required." });
      return false;
    }

    if (!form.issue_id.trim()) {
      setMessage({ type: "error", text: "Discussion Issue is required." });
      return false;
    }

    if (!form.audit_type.trim()) {
      setMessage({ type: "error", text: "Audit Type is required." });
      return false;
    }

    if (!form.discussion_point.trim()) {
      setMessage({ type: "error", text: "Discussion Point is required." });
      return false;
    }

    if (!form.observation_discussion.trim()) {
      setMessage({ type: "error", text: "Observation Discussion is required." });
      return false;
    }

    if (!form.observation_decision.trim()) {
      setMessage({ type: "error", text: "Observation Decision is required." });
      return false;
    }

    if (!form.status.trim()) {
      setMessage({ type: "error", text: "Status is required." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitLoading(true);
    setMessage(null);

    try {
      const successText =
        drawerMode === "create"
          ? "Audit Visit Observation record created successfully."
          : "Audit Visit Observation record updated successfully.";

      if (drawerMode === "create") {
        await createAuditVisitObservation(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditVisitObservation(
          selectedItem.visit_observation_id,
          buildPayload(form),
        );
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditVisitObservations();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Audit Visit Observation request failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmItem || !confirmAction) return;

    setSubmitLoading(true);
    setMessage(null);

    try {
      if (confirmAction === "delete") {
        await deactivateAuditVisitObservation(confirmItem.visit_observation_id);
        setMessage({
          type: "success",
          text: "Audit Visit Observation record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditVisitObservation(confirmItem.visit_observation_id);
        setMessage({
          type: "success",
          text: "Audit Visit Observation record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditVisitObservation(
          confirmItem.visit_observation_id,
        );
        setMessage({
          type: "success",
          text: "Audit Visit Observation record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadAuditVisitObservations();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-950 to-blue-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                Audit Core
              </p>
              <h1 className="mt-2 text-3xl font-black">
                Audit Visit Observations
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Record visit-wise observations, discussions and audit decisions.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {visitObservationActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {visitObservationActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {visitObservationActions.canImport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Import
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPageSize(value as CrudPageSizeOption);
            resetToFirstPage();
          }}
          onRefresh={loadAuditVisitObservations}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setVisitFilter("all");
            setAuditTypeFilter("all");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            resetToFirstPage();
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search observation, decision, note...",
              onChange: (value) => {
                setSearch(value);
                resetToFirstPage();
              },
            },
            {
              key: "visit",
              label: "Visit",
              type: "select",
              value: visitFilter,
              options: [
                { value: "all", label: "All Visits" },
                ...visitOptions.map((visit) => ({
                  value: String(visit.visit_id),
                  label: buildVisitLabel(visit),
                })),
              ],
              onChange: (value) => {
                setVisitFilter(value);
                resetToFirstPage();
              },
            },
            {
              key: "auditType",
              label: "Audit Type",
              type: "select",
              value: auditTypeFilter,
              options: [
                { value: "all", label: "All Audit Types" },
                ...auditTypeOptions.map((auditType) => ({
                  value: auditType,
                  label: auditType,
                })),
              ],
              onChange: (value) => {
                setAuditTypeFilter(value);
                resetToFirstPage();
              },
            },
            {
              key: "status",
              label: "Status",
              type: "select",
              value: statusFilter,
              options: [
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
              onChange: (value) => {
                setStatusFilter(value as StatusFilter);
                resetToFirstPage();
              },
            },
          ]}
        />

        {message && !drawerOpen ? (
          <div
            className={`border-b px-5 py-3 text-sm font-bold ${
              message.type === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Observation ID</th>
                <th className="px-5 py-4">Visit</th>
                <th className="px-5 py-4">Audit Type</th>
                <th className="px-5 py-4">Discussion Point</th>
                <th className="px-5 py-4">Observation</th>
                <th className="px-5 py-4">Decision</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Active</th>
                {showRowActions ? (
                  <th className="px-5 py-4 text-right">Action</th>
                ) : null}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="flex items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="animate-spin" size={22} />
                      Loading Audit Visit Observations...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <ListChecks size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Audit Visit Observations found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first visit observation record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => {
                    const visit = item.visit_id
                      ? visitMap.get(item.visit_id)
                      : undefined;

                    return (
                      <tr
                        key={item.visit_observation_id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          #{item.visit_observation_id}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {visit
                            ? buildVisitLabel(visit)
                            : item.visit_id
                              ? `Visit #${item.visit_id}`
                              : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <CrudPillBadge>{item.audit_type}</CrudPillBadge>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-700">
                          {item.discussion_point}
                        </td>
                        <td className="max-w-sm px-5 py-4 text-sm text-slate-500">
                          {truncateText(item.observation_discussion)}
                        </td>
                        <td className="max-w-sm px-5 py-4 text-sm text-slate-500">
                          {truncateText(item.observation_decision)}
                        </td>
                        <td className="px-5 py-4">
                          <CrudPillBadge>{toTitle(item.status)}</CrudPillBadge>
                        </td>
                        <td className="px-5 py-4">
                          <CrudStatusBadge active={item.is_active} />
                        </td>

                        {showRowActions ? (
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {visitObservationActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(item)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {item.is_active &&
                              visitObservationActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(item, "delete")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              visitObservationActions.canRestore ? (
                                <button
                                  onClick={() => openConfirm(item, "restore")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              visitObservationActions.canPermanentDelete ? (
                                <button
                                  onClick={() =>
                                    openConfirm(item, "permanent_delete")
                                  }
                                  className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                  title="Permanent Delete"
                                >
                                  <AlertTriangle size={16} />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        <CrudPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={numericPageSize}
          onPageChange={setPage}
        />
      </section>

      <CrudDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title="Audit Visit Observation"
        description={drawerMode === "create" ? "Create" : "Edit"}
        maxWidthClassName="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="audit-visit-observation-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ListChecks className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="audit-visit-observation-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Audit Visit Info"
            value={form.visit_id}
            options={[
              {
                value: "",
                label: catalogLoading
                  ? "Loading Audit Visit Info..."
                  : "Select Audit Visit Info",
              },
              ...visitOptions.map((visit) => ({
                value: String(visit.visit_id),
                label: buildVisitLabel(visit),
              })),
            ]}
            onChange={applyVisitToForm}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <CrudTextField
              label="Audit ID"
              value={form.audit_id}
              disabled
              onChange={(value) =>
                setForm((current) => ({ ...current, audit_id: value }))
              }
            />

            <CrudSelectField
              label="Audit Team"
              value={form.team_id}
              options={[
                { value: "", label: "Select Audit Team" },
                ...teamOptions.map((team) => ({
                  value: String(team.team_id),
                  label: team.team_name,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({ ...current, team_id: value }))
              }
            />
          </div>

          <CrudSelectField
            label="Discussion Issue"
            value={form.issue_id}
            options={[
              {
                value: "",
                label: catalogLoading
                  ? "Loading Discussion Issues..."
                  : "Select Discussion Issue",
              },
              ...filteredIssueOptions.map((issue) => ({
                value: String(issue.issue_id),
                label: buildIssueLabel(issue),
              })),
            ]}
            onChange={applyIssueToForm}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Audit Type"
              value={form.audit_type}
              options={[
                { value: "", label: "Select Audit Type" },
                ...auditTypeOptions.map((auditType) => ({
                  value: auditType,
                  label: auditType,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  audit_type: value,
                  issue_id: "",
                  discussion_point: "",
                  observation_decision: "",
                }))
              }
            />

            <CrudSelectField
              label="Status"
              value={form.status}
              options={statusOptions}
              onChange={(value) =>
                setForm((current) => ({ ...current, status: value }))
              }
            />
          </div>

          <CrudTextField
            label="Discussion Point"
            value={form.discussion_point}
            required
            placeholder="Auto copied from discussion issue"
            onChange={(value) =>
              setForm((current) => ({ ...current, discussion_point: value }))
            }
          />

          <CrudTextAreaField
            label="Observation Discussion"
            value={form.observation_discussion}
            required
            placeholder="Write actual observation discussion from the visit..."
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                observation_discussion: value,
              }))
            }
          />

          <CrudTextAreaField
            label="Observation Decision"
            value={form.observation_decision}
            required
            placeholder="Auto copied default decision, edit if needed..."
            onChange={(value) =>
              setForm((current) => ({ ...current, observation_decision: value }))
            }
          />

          <CrudTextAreaField
            label="Observation Note"
            value={form.observation_note}
            placeholder="Optional note..."
            onChange={(value) =>
              setForm((current) => ({ ...current, observation_note: value }))
            }
          />

          {message && drawerOpen && message.type === "error" ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message.text}
            </div>
          ) : null}
        </form>
      </CrudDrawer>

      {confirmItem && confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Confirm Action
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to{" "}
                  <span className="font-black text-slate-700">
                    {toTitle(confirmAction)}
                  </span>{" "}
                  this Audit Visit Observation?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  #{confirmItem.visit_observation_id} —{" "}
                  {confirmItem.discussion_point}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submitLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
