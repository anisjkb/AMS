"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { useModuleActions } from "@/hooks/useModuleActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

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

const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

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
  const [pageSize, setPageSize] = useState<PageSizeOption>(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [subjectTypeFilter, setSubjectTypeFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const numericPageSize = pageSize === "all" ? 100 : pageSize;
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

      setMessage(errorMessage);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subject_name.trim()) {
      setMessage("Subject name is required.");
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const payload = buildPayload(form);

      if (drawerMode === "edit" && selectedSubject) {
        await updateAuditSubject(selectedSubject.id, payload);
        setMessage("Audit subject updated successfully.");
      } else {
        await createAuditSubject(payload);
        setMessage("Audit subject created successfully.");
      }

      setDrawerOpen(false);
      setSelectedSubject(null);
      setForm(emptyForm);
      await loadAuditSubjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save audit subject.";

      setMessage(errorMessage);
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
        setMessage("Audit subject deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditSubject(confirmSubject.id);
        setMessage("Audit subject restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditSubject(confirmSubject.id);
        setMessage("Audit subject permanently deleted successfully.");
      }

      closeConfirm();
      await loadAuditSubjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Action failed.";

      setMessage(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const showingFrom = total === 0 ? 0 : (page - 1) * numericPageSize + 1;
  const showingTo = Math.min(page * numericPageSize, total);

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

        <div className="grid gap-4 border-b border-slate-100 p-5 lg:grid-cols-[160px_1fr_190px_190px]">
          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Show
            </label>
            <select
              value={String(pageSize)}
              onChange={(event) => {
                const value = event.target.value;
                setPageSize(value === "all" ? "all" : Number(value) as PageSizeOption);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400"
            >
              {pageSizeOptions.map((option) => (
                <option key={String(option)} value={String(option)}>
                  {option === "all" ? "All" : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Search
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetToFirstPage();
                }}
                placeholder="Search code, name, reference, department..."
                className="ml-2 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Type
            </label>
            <select
              value={subjectTypeFilter}
              onChange={(event) => {
                setSubjectTypeFilter(event.target.value);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400"
            >
              <option value="all">All Types</option>
              {subjectTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {message ? (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700">
            {message}
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

        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center">
          <p>
            Showing{" "}
            <span className="font-black text-slate-700">{showingFrom}</span> to{" "}
            <span className="font-black text-slate-700">{showingTo}</span> of{" "}
            <span className="font-black text-slate-700">{total}</span> records
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              First
            </button>
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-lg bg-slate-900 px-3 py-2 font-black text-white">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </section>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  {drawerMode === "create" ? "Create" : "Edit"}
                </p>
                <h2 className="text-xl font-black text-slate-900">
                  Audit Subject
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Subject Code
                </label>
                <input
                  value={form.subject_code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subject_code: event.target.value,
                    }))
                  }
                  placeholder="Auto generated if blank"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.subject_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subject_name: event.target.value,
                    }))
                  }
                  placeholder="Example: Cash Shortage at Branch-05"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-black text-slate-700">
                    Subject Type
                  </label>
                  <select
                    value={form.subject_type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subject_type: event.target.value as AuditSubjectType,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    {subjectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-slate-700">
                    Risk Level
                  </label>
                  <select
                    value={form.risk_level}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        risk_level: event.target.value as "" | RiskLevel,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">Not Selected</option>
                    {riskLevels.map((risk) => (
                      <option key={risk.value} value={risk.value}>
                        {risk.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Reference Code
                </label>
                <input
                  value={form.reference_code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      reference_code: event.target.value,
                    }))
                  }
                  placeholder="Example: INC-2026-001"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-black text-slate-700">
                    Owner Department
                  </label>
                  <input
                    value={form.owner_department}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        owner_department: event.target.value,
                      }))
                    }
                    placeholder="Example: Finance"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-slate-700">
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    placeholder="Example: Dhaka Branch"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_confidential}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      is_confidential: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Confidential subject
              </label>

              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Remarks
                </label>
                <textarea
                  value={form.remarks}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      remarks: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {drawerMode === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
