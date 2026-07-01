"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import {
  createAuditorWorkPlan,
  deactivateAuditorWorkPlan,
  listAuditorWorkPlans,
  permanentDeleteAuditorWorkPlan,
  restoreAuditorWorkPlan,
  updateAuditorWorkPlan,
  type AuditorWorkPlan,
  type AuditorWorkPlanPayload,
} from "@/services/auditorWorkPlan";
import { listMeetingReports, type MeetingReport } from "@/services/meetingReport";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  report_id: string;
  work_plan_details: string;
};

const emptyForm: FormState = {
  report_id: "",
  work_plan_details: "",
};

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

function buildFormFromItem(item: AuditorWorkPlan): FormState {
  return {
    report_id: String(item.report_id),
    work_plan_details: item.work_plan_details,
  };
}

function buildPayload(form: FormState): AuditorWorkPlanPayload {
  return {
    report_id: Number.parseInt(form.report_id, 10),
    work_plan_details: form.work_plan_details.trim(),
  };
}

function buildReportLabel(report: MeetingReport) {
  return `#${report.report_id} — ${report.meeting_type} — ${report.client_name} — ${report.audit_year}`;
}

export default function AuditorWorkPlanPage() {
  const auditorWorkPlanActions = useModuleActions("auditor_work_plan");

  const [items, setItems] = useState<AuditorWorkPlan[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [reportOptions, setReportOptions] = useState<MeetingReport[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<AuditorWorkPlan | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<AuditorWorkPlan | null>(null);
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

  const reportMap = useMemo(() => {
    return new Map(reportOptions.map((report) => [report.report_id, report]));
  }, [reportOptions]);

  const selectedReport = useMemo(() => {
    if (!form.report_id) return null;

    return reportMap.get(Number.parseInt(form.report_id, 10)) ?? null;
  }, [form.report_id, reportMap]);

  const showTopActions = auditorWorkPlanActions.showTopActions;
  const showRowActions = auditorWorkPlanActions.showRowActions;
  const tableColumnCount = showRowActions ? 8 : 7;

  const loadAuditorWorkPlans = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditorWorkPlans({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch,
        isActive: isActiveFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load Auditor Work Plan records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadReportOptions = useCallback(async () => {
    setReportLoading(true);

    try {
      const response = await listMeetingReports({
        page: 1,
        pageSize: 100,
        isActive: true,
      });

      setReportOptions(response.items);
    } catch {
      setReportOptions([]);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditorWorkPlans();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditorWorkPlans]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadReportOptions();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadReportOptions]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    void loadReportOptions();
  };

  const openEditDrawer = (item: AuditorWorkPlan) => {
    setDrawerMode("edit");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
    void loadReportOptions();
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const openConfirm = (item: AuditorWorkPlan, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.report_id.trim()) {
      setMessage({ type: "error", text: "Meeting Report is required." });
      return false;
    }

    const reportId = Number.parseInt(form.report_id, 10);
    if (Number.isNaN(reportId) || reportId <= 0) {
      setMessage({
        type: "error",
        text: "Meeting Report must be a valid selection.",
      });
      return false;
    }

    if (!form.work_plan_details.trim()) {
      setMessage({
        type: "error",
        text: "Work Plan Details is required.",
      });
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
          ? "Auditor Work Plan record created successfully."
          : "Auditor Work Plan record updated successfully.";

      if (drawerMode === "create") {
        await createAuditorWorkPlan(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditorWorkPlan(selectedItem.plan_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditorWorkPlans();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Auditor Work Plan request failed.";

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
        await deactivateAuditorWorkPlan(confirmItem.plan_id);
        setMessage({
          type: "success",
          text: "Auditor Work Plan record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditorWorkPlan(confirmItem.plan_id);
        setMessage({
          type: "success",
          text: "Auditor Work Plan record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditorWorkPlan(confirmItem.plan_id);
        setMessage({
          type: "success",
          text: "Auditor Work Plan record permanently deleted successfully.",
        });
      }

      closeConfirm();
      await loadAuditorWorkPlans();
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
              <h1 className="mt-2 text-3xl font-black">Auditor Work Plan</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Create and maintain auditor work plans linked with Meeting
                Report records.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {auditorWorkPlanActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {auditorWorkPlanActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {auditorWorkPlanActions.canImport ? (
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
          onRefresh={loadAuditorWorkPlans}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            resetToFirstPage();
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search plan ID, report ID, details...",
              onChange: (value) => {
                setSearch(value);
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
                <th className="px-5 py-4">Plan ID</th>
                <th className="px-5 py-4">Meeting Report</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Audit Year</th>
                <th className="px-5 py-4">Work Plan Details</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
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
                      Loading Auditor Work Plan records...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <ClipboardList size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Auditor Work Plan records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create a work plan from an existing Meeting Report.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => {
                    const report = reportMap.get(item.report_id);

                    return (
                      <tr key={item.plan_id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          #{item.plan_id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-black text-slate-800">
                            Report #{item.report_id}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {report?.meeting_type ?? "Meeting Report"}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {report?.client_name ?? "-"}
                        </td>
                        <td className="px-5 py-4">
                          <CrudPillBadge>{report?.audit_year ?? "-"}</CrudPillBadge>
                        </td>
                        <td className="max-w-lg px-5 py-4 text-sm text-slate-500">
                          <p className="line-clamp-2">
                            {item.work_plan_details}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <CrudStatusBadge active={item.is_active} />
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(item.created_at)}
                        </td>

                        {showRowActions ? (
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {auditorWorkPlanActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(item)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {item.is_active &&
                              auditorWorkPlanActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(item, "delete")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              auditorWorkPlanActions.canRestore ? (
                                <button
                                  onClick={() => openConfirm(item, "restore")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              auditorWorkPlanActions.canPermanentDelete ? (
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
        title="Auditor Work Plan"
        description={drawerMode === "create" ? "Create" : "Edit"}
        maxWidthClassName="max-w-3xl"
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
              form="auditor-work-plan-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="auditor-work-plan-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Meeting Report"
            value={form.report_id}
            required
            options={[
              {
                value: "",
                label: reportLoading
                  ? "Loading Meeting Report records..."
                  : "Select Meeting Report",
              },
              ...reportOptions.map((report) => ({
                value: String(report.report_id),
                label: buildReportLabel(report),
              })),
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                report_id: value,
              }))
            }
          />

          {selectedReport ? (
            <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 md:grid-cols-2">
              <div>
                <span className="font-black">Report ID:</span>{" "}
                #{selectedReport.report_id}
              </div>
              <div>
                <span className="font-black">Meeting Type:</span>{" "}
                {selectedReport.meeting_type}
              </div>
              <div>
                <span className="font-black">Client:</span>{" "}
                {selectedReport.client_name}
              </div>
              <div>
                <span className="font-black">Audit Year:</span>{" "}
                {selectedReport.audit_year}
              </div>
              <div>
                <span className="font-black">Meeting Date:</span>{" "}
                {formatDate(selectedReport.meeting_date)}
              </div>
              <div>
                <span className="font-black">Location:</span>{" "}
                {selectedReport.location || "-"}
              </div>
            </div>
          ) : null}

          <CrudTextAreaField
            label="Work Plan Details"
            value={form.work_plan_details}
            required
            rows={6}
            placeholder="Write auditor work plan details..."
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                work_plan_details: value,
              }))
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
                  this Auditor Work Plan record?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  Plan #{confirmItem.plan_id} — Report #{confirmItem.report_id}
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
