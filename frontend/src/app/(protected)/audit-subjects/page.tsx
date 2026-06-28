"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { useModuleActions } from "@/hooks/useModuleActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudCheckboxField from "@/components/crud/fields/CrudCheckboxField";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import {
  createAuditSubject,
  deactivateAuditSubject,
  listAuditSubjects,
  permanentDeleteAuditSubject,
  restoreAuditSubject,
  updateAuditSubject,
  type AuditSubject,
  type AuditSubjectPayload,
  type AuditSubjectType,
  type RiskLevel,
} from "@/services/auditSubject";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";
type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  subject_code: string;
  subject_name: string;
  subject_type: AuditSubjectType;
  reference_code: string;
  owner_department: string;
  location: string;
  risk_level: "" | RiskLevel;
  is_confidential: boolean;
  description: string;
  remarks: string;
};

const subjectTypes: { value: AuditSubjectType; label: string }[] = [
  { value: "firm", label: "Firm" },
  { value: "project", label: "Project" },
  { value: "incident", label: "Incident" },
  { value: "branch", label: "Branch" },
  { value: "department", label: "Department" },
  { value: "process", label: "Process" },
  { value: "audit_entity", label: "Audit Entity" },
];

const riskLevels: { value: RiskLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const emptyForm: FormState = {
  subject_code: "",
  subject_name: "",
  subject_type: "firm",
  reference_code: "",
  owner_department: "",
  location: "",
  risk_level: "",
  is_confidential: false,
  description: "",
  remarks: "",
};

function toTitle(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function cleanText(value: string) {
  const cleaned = value.trim();

  return cleaned ? cleaned : null;
}

function buildPayload(form: FormState): AuditSubjectPayload {
  return {
    subject_code: cleanText(form.subject_code),
    subject_name: form.subject_name.trim(),
    subject_type: form.subject_type,
    reference_code: cleanText(form.reference_code),
    owner_department: cleanText(form.owner_department),
    location: cleanText(form.location),
    risk_level: form.risk_level || null,
    is_confidential: form.is_confidential,
    description: cleanText(form.description),
    remarks: cleanText(form.remarks),
  };
}

function buildFormFromSubject(subject: AuditSubject): FormState {
  return {
    subject_code: subject.subject_code ?? "",
    subject_name: subject.subject_name ?? "",
    subject_type: subject.subject_type,
    reference_code: subject.reference_code ?? "",
    owner_department: subject.owner_department ?? "",
    location: subject.location ?? "",
    risk_level: subject.risk_level ?? "",
    is_confidential: subject.is_confidential,
    description: subject.description ?? "",
    remarks: subject.remarks ?? "",
  };
}

export default function AuditSubjectsPage() {
  const auditSubjectActions = useModuleActions("audit_subject");

  const [items, setItems] = useState<AuditSubject[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [subjectTypeFilter, setSubjectTypeFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedSubject, setSelectedSubject] = useState<AuditSubject | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmSubject, setConfirmSubject] = useState<AuditSubject | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(total / numericPageSize));

  const showTopActions =
    auditSubjectActions.canCreate ||
    auditSubjectActions.canExport ||
    auditSubjectActions.canImport;

  const showRowActions =
    auditSubjectActions.canUpdate ||
    auditSubjectActions.canDelete ||
    auditSubjectActions.canRestore ||
    auditSubjectActions.canPermanentDelete;

  const tableColumnCount = showRowActions ? 10 : 9;

  const isActiveFilter = useMemo(() => {
    if (statusFilter === "active") return true;
    if (statusFilter === "inactive") return false;

    return undefined;
  }, [statusFilter]);

  const loadAuditSubjects = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditSubjects({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim(),
        isActive: isActiveFilter,
        subjectType:
          subjectTypeFilter === "all" ? undefined : subjectTypeFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load audit subjects.";

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
    subjectTypeFilter,
  ]);

useEffect(() => {
  const timerId = window.setTimeout(() => {
    void loadAuditSubjects();
  }, 0);

  return () => {
    window.clearTimeout(timerId);
  };
}, [loadAuditSubjects]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedSubject(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEditDrawer = (subject: AuditSubject) => {
    setDrawerMode("edit");
    setSelectedSubject(subject);
    setForm(buildFormFromSubject(subject));
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedSubject(null);
    setForm(emptyForm);
  };

  const openConfirm = (
    subject: AuditSubject,
    action: ConfirmAction,
  ) => {
    setConfirmSubject(subject);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmSubject(null);
    setConfirmAction(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subject_name.trim()) {
      setMessage({ type: "error", text: "Subject name is required." });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const successText =
        drawerMode === "create"
          ? "Audit subject created successfully."
          : "Audit subject updated successfully.";

      if (drawerMode === "create") {
        await createAuditSubject(buildPayload(form));
      } else if (selectedSubject) {
        await updateAuditSubject(selectedSubject.id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedSubject(null);
      setForm(emptyForm);

      await loadAuditSubjects();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Audit subject request failed.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmSubject || !confirmAction) return;

    setSubmitLoading(true);
    setMessage(null);

    try {
      if (confirmAction === "delete") {
        await deactivateAuditSubject(confirmSubject.id);
        setMessage({ type: "success", text: "Audit subject deactivated successfully." });
      }

      if (confirmAction === "restore") {
        await restoreAuditSubject(confirmSubject.id);
        setMessage({ type: "success", text: "Audit subject restored successfully." });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditSubject(confirmSubject.id);
        setMessage({ type: "success", text: "Audit subject permanently deleted successfully." });
      }

      closeConfirm();
      await loadAuditSubjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Action failed.";

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
                Audit Management
              </p>
              <h1 className="mt-2 text-3xl font-black">Audit Subjects</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Manage auditable subjects such as firm, project, incident,
                branch, department, process, and audit entity.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {auditSubjectActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {auditSubjectActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {auditSubjectActions.canImport ? (
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
          onRefresh={loadAuditSubjects}
          onReset={() => {
            setSearch("");
            setSubjectTypeFilter("all");
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
              placeholder: "Search code, name, reference, department...",
              onChange: (value) => {
                setSearch(value);
                resetToFirstPage();
              },
            },
            {
              key: "type",
              label: "Type",
              type: "select",
              value: subjectTypeFilter,
              options: [
                { value: "all", label: "All Types" },
                ...subjectTypes.map((type) => ({
                  value: type.value,
                  label: type.label,
                })),
              ],
              onChange: (value) => {
                setSubjectTypeFilter(value);
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
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Risk</th>
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
                      Loading audit subjects...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <ShieldCheck
                        size={42}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No audit subjects found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create a new audit subject to begin audit planning.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((subject) => (
                    <tr key={subject.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        {subject.subject_code}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-800">
                          {subject.subject_name}
                        </div>
                        {subject.is_confidential ? (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                            <EyeOff size={12} />
                            Confidential
                          </div>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-600">
                        {toTitle(subject.subject_type)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {subject.reference_code || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {subject.owner_department || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {subject.location || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                          {toTitle(subject.risk_level)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${
                            subject.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {subject.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(subject.created_at)}
                      </td>

                      {showRowActions ? (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {auditSubjectActions.canUpdate ? (
                              <button
                                onClick={() => openEditDrawer(subject)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {subject.is_active &&
                            auditSubjectActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(subject, "delete")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!subject.is_active &&
                            auditSubjectActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(subject, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!subject.is_active &&
                            auditSubjectActions.canPermanentDelete ? (
                              <button
                                onClick={() =>
                                  openConfirm(subject, "permanent_delete")
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
                  ))
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
        title="Audit Subject"
        description={drawerMode === "create" ? "Create" : "Edit"}
        maxWidthClassName="max-w-xl"
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
              form="audit-subject-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="audit-subject-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Subject Code
            </span>
            <input
              value={drawerMode === "create" ? "" : form.subject_code}
              readOnly
              disabled
              placeholder={
                drawerMode === "create"
                  ? "Auto generated by system"
                  : "System generated"
              }
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
            />
            <p className="text-xs font-medium text-slate-500">
              Maintained by system to keep subject codes unique and consistent.
            </p>
          </label>

          <CrudTextField
            label="Subject Name"
            value={form.subject_name}
            required
            placeholder="Example: Cash Shortage at Branch-05"
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                subject_name: value,
              }))
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Subject Type"
              value={form.subject_type}
              options={subjectTypes.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  subject_type: value as AuditSubjectType,
                }))
              }
            />

            <CrudSelectField
              label="Risk Level"
              value={form.risk_level}
              options={[
                { value: "", label: "Not Selected" },
                ...riskLevels.map((risk) => ({
                  value: risk.value,
                  label: risk.label,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  risk_level: value as "" | RiskLevel,
                }))
              }
            />
          </div>

          <CrudTextField
            label="Reference Code"
            value={form.reference_code}
            placeholder="Example: INC-2026-001"
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                reference_code: value,
              }))
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <CrudTextField
              label="Owner Department"
              value={form.owner_department}
              placeholder="Example: Finance"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  owner_department: value,
                }))
              }
            />

            <CrudTextField
              label="Location"
              value={form.location}
              placeholder="Example: Dhaka Branch"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  location: value,
                }))
              }
            />
          </div>

          <CrudCheckboxField
            label="Confidential subject"
            checked={form.is_confidential}
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                is_confidential: checked,
              }))
            }
          />

          <CrudTextAreaField
            label="Description"
            value={form.description}
            rows={3}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                description: value,
              }))
            }
          />

          <CrudTextAreaField
            label="Remarks"
            value={form.remarks}
            rows={3}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                remarks: value,
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
      {confirmSubject && confirmAction ? (
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
                  this audit subject?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmSubject.subject_name}
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
