"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserRoundCog,
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
import { listAuditTeams, type AuditTeam } from "@/services/auditTeam";
import { getAllEmployees } from "@/services/employee";
import type { Employee } from "@/types/employee";
import {
  createAuditTeamMember,
  deactivateAuditTeamMember,
  listAuditTeamMembers,
  permanentDeleteAuditTeamMember,
  restoreAuditTeamMember,
  updateAuditTeamMember,
  type AuditTeamMember,
  type AuditTeamMemberPayload,
} from "@/services/auditTeamMember";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  team_id: string;
  member_type: string;
  emp_id: string;
  team_member_role: string;
  note: string;
  status: string;
};

const emptyForm: FormState = {
  team_id: "",
  member_type: "",
  emp_id: "",
  team_member_role: "",
  note: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "inactive", label: "Inactive" },
];

const roleOptions = [
  { value: "Team Lead", label: "Team Lead" },
  { value: "Team Supervisor", label: "Team Supervisor" },
  { value: "Senior Auditor", label: "Senior Auditor" },
  { value: "Auditor", label: "Auditor" },
  { value: "Assistant Auditor", label: "Assistant Auditor" },
  { value: "Reviewer", label: "Reviewer" },
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

function buildEmployeeLabel(employee: Employee) {
  return `${employee.employee_name} (${employee.official_employee_id || "No Official ID"})`;
}

function buildFormFromItem(item: AuditTeamMember): FormState {
  return {
    team_id: String(item.team_id),
    member_type: item.member_type,
    emp_id: item.emp_id,
    team_member_role: item.team_member_role,
    note: item.note ?? "",
    status: item.status,
  };
}

function buildPayload(form: FormState): AuditTeamMemberPayload {
  return {
    team_id: Number.parseInt(form.team_id, 10),
    member_type: form.member_type.trim(),
    emp_id: form.emp_id.trim(),
    team_member_role: form.team_member_role.trim(),
    note: form.note.trim() || null,
    status: form.status.trim(),
  };
}

export default function AuditTeamMembersPage() {
  const auditTeamMemberActions = useModuleActions("audit_team_member");

  const [items, setItems] = useState<AuditTeamMember[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [teamOptions, setTeamOptions] = useState<AuditTeam[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<AuditTeamMember | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<AuditTeamMember | null>(null);
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

  const teamMap = useMemo(() => {
    return new Map(teamOptions.map((team) => [team.team_id, team]));
  }, [teamOptions]);

  const employeeMap = useMemo(() => {
    return new Map(employeeOptions.map((employee) => [employee.id, employee]));
  }, [employeeOptions]);

  const employeeTypeOptions = useMemo(() => {
    return Array.from(
      new Set(
        employeeOptions
          .map((employee) => employee.employee_type)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [employeeOptions]);

  const filteredEmployees = useMemo(() => {
    if (!form.member_type) return [];

    return employeeOptions.filter(
      (employee) => employee.employee_type === form.member_type,
    );
  }, [employeeOptions, form.member_type]);

  const selectedTeam = useMemo(() => {
    if (!form.team_id) return null;

    return teamMap.get(Number.parseInt(form.team_id, 10)) ?? null;
  }, [form.team_id, teamMap]);

  const selectedEmployee = useMemo(() => {
    if (!form.emp_id) return null;

    return employeeMap.get(Number.parseInt(form.emp_id, 10)) ?? null;
  }, [employeeMap, form.emp_id]);

  const showTopActions = auditTeamMemberActions.showTopActions;
  const showRowActions = auditTeamMemberActions.showRowActions;
  const tableColumnCount = showRowActions ? 9 : 8;

  const loadAuditTeamMembers = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditTeamMembers({
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
          : "Failed to load Audit Team Members.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const [teamsResponse, employeesResponse] = await Promise.all([
        listAuditTeams({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        getAllEmployees({
          page: 1,
          pageSize: 100,
          status: "active",
          sortBy: "employee_name",
          sortOrder: "asc",
        }),
      ]);

      setTeamOptions(teamsResponse.items);
      setEmployeeOptions(employeesResponse.items);
    } catch {
      setTeamOptions([]);
      setEmployeeOptions([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditTeamMembers();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditTeamMembers]);

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

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    void loadCatalogs();
  };

  const openEditDrawer = (item: AuditTeamMember) => {
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

  const openConfirm = (item: AuditTeamMember, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.team_id.trim()) {
      setMessage({ type: "error", text: "Audit Team is required." });
      return false;
    }

    if (!form.member_type.trim()) {
      setMessage({ type: "error", text: "Employee Type is required." });
      return false;
    }

    if (!form.emp_id.trim()) {
      setMessage({ type: "error", text: "Employee is required." });
      return false;
    }

    if (!form.team_member_role.trim()) {
      setMessage({ type: "error", text: "Team Member Role is required." });
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
          ? "Audit Team Member record created successfully."
          : "Audit Team Member record updated successfully.";

      if (drawerMode === "create") {
        await createAuditTeamMember(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditTeamMember(selectedItem.team_member_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditTeamMembers();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Audit Team Member request failed.";

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
        await deactivateAuditTeamMember(confirmItem.team_member_id);
        setMessage({
          type: "success",
          text: "Audit Team Member record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditTeamMember(confirmItem.team_member_id);
        setMessage({
          type: "success",
          text: "Audit Team Member record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditTeamMember(confirmItem.team_member_id);
        setMessage({
          type: "success",
          text: "Audit Team Member record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadAuditTeamMembers();
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
              <h1 className="mt-2 text-3xl font-black">Audit Team Members</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Assign active employees to audit teams based on employee type.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {auditTeamMemberActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {auditTeamMemberActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {auditTeamMemberActions.canImport ? (
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
          onRefresh={loadAuditTeamMembers}
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
              placeholder: "Search role, member type, employee id...",
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
                <th className="px-5 py-4">Member ID</th>
                <th className="px-5 py-4">Audit Team</th>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Employee Type</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
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
                      Loading Audit Team Members...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <UserRoundCog size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Audit Team Members found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Assign the first employee to an audit team.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => {
                    const team = teamMap.get(item.team_id);
                    const employee = employeeMap.get(Number.parseInt(item.emp_id, 10));

                    return (
                      <tr key={item.team_member_id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          #{item.team_member_id}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {team?.team_name ?? `Team #${item.team_id}`}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-black text-slate-800">
                            {employee ? buildEmployeeLabel(employee) : `Employee #${item.emp_id}`}
                          </div>
                          {item.note ? (
                            <div className="mt-1 line-clamp-1 text-xs text-slate-400">
                              {item.note}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-5 py-4">
                          <CrudPillBadge>{item.member_type}</CrudPillBadge>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {item.team_member_role}
                        </td>
                        <td className="px-5 py-4">
                          <CrudPillBadge>{toTitle(item.status)}</CrudPillBadge>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <CrudStatusBadge active={item.is_active} />
                        </td>

                        {showRowActions ? (
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {auditTeamMemberActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(item)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {item.is_active && auditTeamMemberActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(item, "delete")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!item.is_active && auditTeamMemberActions.canRestore ? (
                                <button
                                  onClick={() => openConfirm(item, "restore")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              auditTeamMemberActions.canPermanentDelete ? (
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
        title="Audit Team Member"
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
              form="audit-team-member-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserRoundCog className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="audit-team-member-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Audit Team"
            value={form.team_id}
            options={[
              {
                value: "",
                label: catalogLoading ? "Loading teams..." : "Select Audit Team",
              },
              ...teamOptions.map((team) => ({
                value: String(team.team_id),
                label: team.team_name,
              })),
            ]}
            onChange={(value) =>
              setForm((current) => ({ ...current, team_id: value }))
            }
          />

          {selectedTeam ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Selected Team: {selectedTeam.team_name}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Employee Type"
              value={form.member_type}
              options={[
                {
                  value: "",
                  label: catalogLoading
                    ? "Loading employee types..."
                    : "Select Employee Type",
                },
                ...employeeTypeOptions.map((type) => ({
                  value: type,
                  label: type,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  member_type: value,
                  emp_id: "",
                }))
              }
            />

            <CrudSelectField
              label="Employee"
              value={form.emp_id}
              options={[
                {
                  value: "",
                  label: form.member_type
                    ? "Select Employee"
                    : "Select Employee Type First",
                },
                ...filteredEmployees.map((employee) => ({
                  value: String(employee.id),
                  label: buildEmployeeLabel(employee),
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({ ...current, emp_id: value }))
              }
            />
          </div>

          {selectedEmployee ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Selected Employee: {buildEmployeeLabel(selectedEmployee)}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Team Member Role"
              value={form.team_member_role}
              options={[
                { value: "", label: "Select Role" },
                ...roleOptions,
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  team_member_role: value,
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
            label="Custom Role"
            value={form.team_member_role}
            placeholder="Or type a custom role"
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                team_member_role: value,
              }))
            }
          />

          <CrudTextAreaField
            label="Note"
            value={form.note}
            placeholder="Write team member note..."
            rows={4}
            onChange={(value) =>
              setForm((current) => ({ ...current, note: value }))
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
                  this Audit Team Member?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmItem.team_member_role}
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
