//frontend/src/app/(protected)/audit-core/visit-info/page.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
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
import { CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import CrudDateField from "@/components/crud/fields/CrudDateField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import { listAuditMaster, type AuditMaster } from "@/services/auditMaster";
import { listAuditTeams, type AuditTeam } from "@/services/auditTeam";
import { listAuditEntityAddresses, type AuditEntityAddress } from "@/services/auditEntityAddress";
import {
  createAuditVisitInfo,
  deactivateAuditVisitInfo,
  permanentDeleteAuditVisitInfo,
  restoreAuditVisitInfo,
  updateAuditVisitInfo,
  type AuditVisitInfo,
  type AuditVisitInfoPayload,
} from "@/services/auditVisitInfo";

import {
  listAuditVisits,
  type AuditVisit,
} from "@/services/auditVisit";

import {
  createAuditVisitObservation,
  updateAuditVisitObservation,
  deactivateAuditVisitObservation,
  listAuditVisitObservations,
  type AuditVisitObservation,
} from "@/services/auditVisitObservation";


type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

const confirmActionLabel: Record<ConfirmAction, string> = {
  delete: "Inactive",
  restore: "Restore",
  permanent_delete: "Permanently Delete",
};

type PageMessage = {
  type: "success" | "error";
  text: string;
};

const formatClientAddressOptionLabel = (address: AuditEntityAddress): string => {
  const parts = [
    address.address_line1,
    address.city,
    address.country,
  ].filter(Boolean);

  const label = parts.length > 0 ? parts.join(", ") : "Client Address";

  return `${label} (#${address.id})`;
};

type FormState = {
  visit_name: string;
  audit_id: string;
  team_id: string;
  client_address_id: string;
  visit_date: string;
  status: string;
};

const emptyForm: FormState = {
  visit_name: "",
  audit_id: "",
  team_id: "",
  client_address_id: "",
  visit_date: "",
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

function buildAuditMasterLabel(audit: AuditMaster) {
  const name = audit.audit_name || audit.audit_type;

  return `${name} - ${audit.audit_year} (#${audit.audit_id})`;
}

function buildFormFromItem(item: AuditVisitInfo): FormState {
  return {
    visit_name: item.visit_name ?? "",
    audit_id: String(item.audit_id),
    team_id: String(item.team_id),
    client_address_id: String(item.client_address_id),
    visit_date: item.visit_date,
    status: item.status,
  };
}

function buildPayload(form: FormState): AuditVisitInfoPayload {
  return {
    visit_name: form.visit_name.trim() || null,
    audit_id: Number.parseInt(form.audit_id, 10),
    team_id: Number.parseInt(form.team_id, 10),
    client_address_id: Number.parseInt(form.client_address_id, 10),
    visit_date: form.visit_date,
    status: form.status.trim(),
  };
}

export default function AuditVisitInfoPage() {
  const auditVisitActions = useModuleActions("audit_visit");

  const [items, setItems] = useState<AuditVisit[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [auditOptions, setAuditOptions] = useState<AuditMaster[]>([]);
  const [teamOptions, setTeamOptions] = useState<AuditTeam[]>([]);
  const [clientAddresses, setClientAddresses] = useState<AuditEntityAddress[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] =
    useState<AuditVisit | null>(null);
  const [findings, setFindings] =
    useState<AuditVisitObservation[]>([]);
  const [findingLoading, setFindingLoading] = useState(false);

  const discussionPointRef =
    useRef<HTMLInputElement | null>(null);
  const [findingSubmitLoading, setFindingSubmitLoading] =
    useState(false);

  const [findingDrawerOpen, setFindingDrawerOpen] =
    useState(false);

  const [findingDrawerMode, setFindingDrawerMode] =
    useState<"create" | "edit">("create");

  const [selectedFinding, setSelectedFinding] =
    useState<AuditVisitObservation | null>(null);

  const [findingForm, setFindingForm] = useState({
    discussion_point: "",
    observation_discussion: "",
    observation_decision: "",
    observation_note: "",
    status: "active",
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<AuditVisitInfo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<AuditVisitInfo | null>(null);

  const [confirmFinding, setConfirmFinding] =
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

  const auditMap = useMemo(() => {
    return new Map(auditOptions.map((audit) => [audit.audit_id, audit]));
  }, [auditOptions]);

  const teamMap = useMemo(() => {
    return new Map(teamOptions.map((team) => [team.team_id, team]));
  }, [teamOptions]);

  const selectedAudit = useMemo(() => {
    if (!form.audit_id) return null;

    return auditMap.get(Number.parseInt(form.audit_id, 10)) ?? null;
  }, [auditMap, form.audit_id]);

  const selectedTeam = useMemo(() => {
    if (!form.team_id) return null;

    return teamMap.get(Number.parseInt(form.team_id, 10)) ?? null;
  }, [form.team_id, teamMap]);

  const clientAddressSelectOptions = useMemo(() => {
    if (!selectedAudit) {
      return [];
    }

    return clientAddresses
      .filter(
        (address) =>
          address.is_active === true &&
          Number(address.audit_entity_id) === Number(selectedAudit.client_id),
      )
      .map((address) => ({
        label: formatClientAddressOptionLabel(address),
        value: String(address.id),
      }));
  }, [clientAddresses, selectedAudit]);

  const showTopActions = auditVisitActions.showTopActions;
  const showRowActions = auditVisitActions.showRowActions;
  const tableColumnCount = showRowActions ? 9 : 8;

  const loadAuditVisits = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditVisits({
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
          : "Failed to load Audit Visit.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const openAddFinding = () => {
    setFindingDrawerMode("create");
    setSelectedFinding(null);

    setFindingForm({
        discussion_point: "",
      observation_discussion: "",
      observation_decision: "",
      observation_note: "",
      status: "active",
    });

    setFindingDrawerOpen(true);
  };

  const openEditFinding = (
    finding: AuditVisitObservation,
  ) => {
    setSelectedFinding(finding);

    setFindingForm({
      discussion_point: finding.discussion_point,
      observation_discussion:
        finding.observation_discussion,
      observation_decision:
        finding.observation_decision,
      observation_note:
        finding.observation_note ?? "",
      status: finding.status,
    });

    setFindingDrawerMode("edit");
    setFindingDrawerOpen(true);
  };

  const handleDeleteFinding = async () => {
    if (!confirmFinding || !selectedVisit) return;

    await deactivateAuditVisitObservation(
      confirmFinding.visit_observation_id,
    );

    await handleViewVisit(selectedVisit);

    setConfirmFinding(null);
  };

  const saveFinding = async (closeAfterSave: boolean) => {
    if (!selectedVisit) return;

    setFindingSubmitLoading(true);

    try {
      const payload = {
        discussion_point: findingForm.discussion_point,
        observation_discussion:
          findingForm.observation_discussion,
        observation_decision:
          findingForm.observation_decision,
        observation_note:
          findingForm.observation_note || null,
        status: findingForm.status,
        visit_id: selectedVisit.visit_id,
        audit_id: selectedVisit.audit_id,
        team_id: selectedVisit.team_id,
      };

      if (findingDrawerMode === "create") {
        await createAuditVisitObservation(payload);
      } else if (selectedFinding) {
        await updateAuditVisitObservation(
          selectedFinding.visit_observation_id,
          payload,
        );
      }

      const response =
        await listAuditVisitObservations({
          page: 1,
          pageSize: 100,
          visitId: selectedVisit.visit_id,
          isActive: true,
        });

      setFindings(response.items);

      setSelectedVisit((current) =>
        current
          ? {
              ...current,
              observation_count: response.total,
            }
          : current,
      );

      setFindingDrawerMode("create");
      setSelectedFinding(null);

      if (closeAfterSave) {
        setFindingDrawerOpen(false);
      } else {
        setFindingForm({
          discussion_point: "",
          observation_discussion: "",
          observation_decision: "",
          observation_note: "",
          status: "active",
        });

        setTimeout(() => {
          discussionPointRef.current?.focus();
        }, 100);
      }

    } finally {
      setFindingSubmitLoading(false);
    }
  };

  const handleViewVisit = async (visit: AuditVisit) => {
    setSelectedVisit(visit);
    setViewDrawerOpen(true);

    setFindingLoading(true);

    try {
      const response = await listAuditVisitObservations({
        page: 1,
        pageSize: 100,
        visitId: visit.visit_id,
        isActive: true,
      });

      setFindings(response.items);

      setSelectedVisit((current) =>
        current
          ? {
              ...current,
              observation_count: response.total,
            }
          : current,
      );
    } catch {
      setFindings([]);
    } finally {
      setFindingLoading(false);
    }
  };

  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const [auditResponse, teamResponse, addressResponse] = await Promise.all([
        listAuditMaster({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        listAuditTeams({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        listAuditEntityAddresses({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
      ]);

      setAuditOptions(auditResponse.items);
      setTeamOptions(teamResponse.items);
      setClientAddresses(addressResponse.items);
    } catch {
      setAuditOptions([]);
      setTeamOptions([]);
      setClientAddresses([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

    useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditVisits();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditVisits]);

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

  const openEditDrawer = (item: AuditVisitInfo) => {
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

  const openConfirm = (item: AuditVisitInfo, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.audit_id.trim()) {
      setMessage({ type: "error", text: "Audit Master is required." });
      return false;
    }

    if (!form.team_id.trim()) {
      setMessage({ type: "error", text: "Audit Team is required." });
      return false;
    }

    if (!form.client_address_id.trim()) {
      setMessage({ type: "error", text: "Client Address is required." });
      return false;
    }

    if (Number.isNaN(Number.parseInt(form.client_address_id, 10))) {
      setMessage({ type: "error", text: "Client Address must be selected." });
      return false;
    }

    if (!form.visit_date.trim()) {
      setMessage({ type: "error", text: "Visit Date is required." });
      return false;
    }

    if (selectedAudit) {
      if (form.visit_date < selectedAudit.audit_start_date) {
        setMessage({
          type: "error",
          text: "Visit Date cannot be before Audit Start Date.",
        });
        return false;
      }

      if (form.visit_date > selectedAudit.audit_end_date) {
        setMessage({
          type: "error",
          text: "Visit Date cannot be after Audit End Date.",
        });
        return false;
      }
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
          ? "Audit Visit record created successfully."
          : "Audit Visit record updated successfully.";

      if (drawerMode === "create") {
        await createAuditVisitInfo(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditVisitInfo(selectedItem.visit_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditVisits();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Audit Visit request failed.";

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
        await deactivateAuditVisitInfo(confirmItem.visit_id);
        setMessage({
          type: "success",
          text: "Audit Visit record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditVisitInfo(confirmItem.visit_id);
        setMessage({
          type: "success",
          text: "Audit Visit record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditVisitInfo(confirmItem.visit_id);
        setMessage({
          type: "success",
          text: "Audit Visit record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadAuditVisits();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const selectedVisitAudit = selectedVisit
    ? auditMap.get(selectedVisit.audit_id)
    : null;

  const selectedVisitTeam = selectedVisit
    ? teamMap.get(selectedVisit.team_id)
    : null;

  const selectedVisitAddress = selectedVisit
    ? clientAddresses.find(
        (address) =>
          address.id === selectedVisit.client_address_id,
      )
    : null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-950 to-blue-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                Audit Core
              </p>
              <h1 className="mt-2 text-3xl font-black">Audit Visit</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Schedule audit visits by Audit Master, Audit Team and client address.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {auditVisitActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {auditVisitActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {auditVisitActions.canImport ? (
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
          onRefresh={loadAuditVisits}
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
              placeholder: "Search visit id, audit id, team id, date...",
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
                <th className="w-24 px-5 py-4">Visit ID</th>
                <th className="min-w-44 px-5 py-4">Visit Name</th>
                <th className="min-w-52 px-5 py-4">Audit Master</th>
                <th className="min-w-44 px-5 py-4">Audit Team</th>
                <th className="w-36 px-5 py-4 text-center">Findings</th>
                <th className="w-32 px-5 py-4 text-center">Status</th>
                <th className="w-28 px-5 py-4 text-center">Is Active?</th>
                <th className="w-36 px-5 py-4 text-center">Created</th>
                {showRowActions ? (
                  <th className="w-48 px-5 py-4 text-right">Action</th>
                ) : null}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="flex items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="animate-spin" size={22} />
                      Loading Audit Visit...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <CalendarDays size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Audit Visit found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first audit visit schedule.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => {
                    const audit = auditMap.get(item.audit_id);
                    const team = teamMap.get(item.team_id);

                    return (
                      <tr key={item.visit_id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          #{item.visit_id}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-700">
                          {item.visit_name || `Visit #${item.visit_id}`}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {audit ? buildAuditMasterLabel(audit) : `Audit #${item.audit_id}`}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {team?.team_name ?? `Team #${item.team_id}`}
                        </td>
                        <td className="px-5 py-4 text-center align-middle">
                          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-black text-white">
                              {item.observation_count ?? 0}
                            </span>
                            {(item.observation_count ?? 0) === 1
                              ? "Finding"
                              : "Findings"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center align-middle">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {toTitle(item.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center align-middle">
                          <CrudStatusBadge active={item.is_active} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-center align-middle text-sm font-medium text-slate-500">
                          {formatDate(item.created_at)}
                        </td>

                        {showRowActions ? (
                          <td className="whitespace-nowrap px-5 py-4 text-right align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewVisit(item)}
                                className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                                title="View Findings"
                              >
                                Findings
                              </button>

                              {auditVisitActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(item)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {item.is_active && auditVisitActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(item, "delete")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!item.is_active && auditVisitActions.canRestore ? (
                                <button
                                  onClick={() => openConfirm(item, "restore")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              auditVisitActions.canPermanentDelete ? (
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
        title="Audit Visit"
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
              form="audit-visit-info-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="audit-visit-info-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudTextField
            label="Visit Name"
            value={form.visit_name}
            placeholder="Example: Initial Audit Planning Visit"
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                visit_name: value,
              }))
            }
          />
          <CrudSelectField
            label="Audit Master"
            value={form.audit_id}
            options={[
              {
                value: "",
                label: catalogLoading
                  ? "Loading Audit Master..."
                  : "Select Audit Master",
              },
              ...auditOptions.map((audit) => ({
                value: String(audit.audit_id),
                label: buildAuditMasterLabel(audit),
              })),
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                audit_id: value,
                      client_address_id: "",
                visit_date: "",
              }))
            }
          />

          {selectedAudit ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Audit Period: {formatDate(selectedAudit.audit_start_date)} to{" "}
              {formatDate(selectedAudit.audit_end_date)}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
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

            <CrudSelectField
              label="Client Address"
              value={form.client_address_id}
              required
              options={[
                {
                  label: form.audit_id
                    ? catalogLoading
                      ? "Loading Client Addresses..."
                      : "Select Client Address"
                    : "Select Audit Master first",
                  value: "",
                },
                ...clientAddressSelectOptions,
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  client_address_id: value,
                }))
              }
            />
          </div>

          {selectedTeam ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Selected Team: {selectedTeam.team_name}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <CrudDateField
              label="Visit Date"
              value={form.visit_date}
              required
              onChange={(value) =>
                setForm((current) => ({ ...current, visit_date: value }))
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

          {message && drawerOpen && message.type === "error" ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message.text}
            </div>
          ) : null}
        </form>
      </CrudDrawer>

      <CrudDrawer
        isOpen={viewDrawerOpen}
        onClose={() => {
          setViewDrawerOpen(false);
          setSelectedVisit(null);
          setFindings([]);
        }}
        title="Audit Visit Details"
        description="Visit findings and information"
        maxWidthClassName="max-w-4xl"
      >
        {selectedVisit ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-lg font-black text-slate-900">
                Visit Information
              </h3>

              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-bold text-slate-900">
                    Visit Name:
                  </span>{" "}
                  {selectedVisit.visit_name || "-"}
                </p>

                <p>
                  <span className="font-bold text-slate-900">
                    Audit:
                  </span>{" "}
                  {selectedVisitAudit
                    ? buildAuditMasterLabel(selectedVisitAudit)
                    : `Audit #${selectedVisit.audit_id}`}
                </p>

                <p>
                  <span className="font-bold text-slate-900">
                    Team:
                  </span>{" "}
                  {selectedVisitTeam
                    ? selectedVisitTeam.team_name
                    : `Team #${selectedVisit.team_id}`}
                </p>

                <p>
                  <span className="font-bold text-slate-900">
                    Client Address:
                  </span>{" "}
                  {selectedVisitAddress
                    ? formatClientAddressOptionLabel(selectedVisitAddress)
                    : `Address #${selectedVisit.client_address_id}`}
                </p>

                <p>
                  <span className="font-bold text-slate-900">
                    Visit Date:
                  </span>{" "}
                  {formatDate(selectedVisit.visit_date)}
                </p>

                <p>
                  <span className="font-bold text-slate-900">
                    Status:
                  </span>{" "}
                  {toTitle(selectedVisit.status)}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">
                  Findings ({selectedVisit.observation_count})
                </h3>

                <button
                  onClick={openAddFinding}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                >
                  + Add Finding
                </button>
              </div>

              {findingLoading ? (
                <p className="text-sm text-slate-500">
                  Loading findings...
                </p>
              ) : findings.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No findings found.
                </p>
              ) : (
                <div className="space-y-3">
                  {findings.map((finding, index) => (
                    <div
                      key={finding.visit_observation_id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-black text-slate-900">
                          Finding #{index + 1}
                        </p>

                        <button
                          onClick={() => openEditFinding(finding)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setConfirmFinding(finding)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>

                      <p className="text-sm text-slate-600">
                        <span className="font-bold">
                          Discussion Point:
                        </span>{" "}
                        {finding.discussion_point}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-bold">
                          Finding:
                        </span>{" "}
                        {finding.observation_discussion}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-bold">
                          Decision:
                        </span>{" "}
                        {finding.observation_decision}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </CrudDrawer>

      <CrudDrawer
        isOpen={findingDrawerOpen}
        onClose={() => setFindingDrawerOpen(false)}
        title={
          findingDrawerMode === "create"
            ? "Add Finding"
            : "Edit Finding"
        }
        description={
          findingDrawerMode === "create"
            ? "Create audit finding"
            : "Update audit finding"
        }
        maxWidthClassName="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFindingDrawerOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={findingSubmitLoading}
              onClick={() => saveFinding(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Save & Add Another
            </button>

            <button
              type="button"
              disabled={findingSubmitLoading}
              onClick={() => saveFinding(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {findingSubmitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save & Close
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">
              Audit
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {selectedVisitAudit
                ? selectedVisitAudit.audit_type
                : "-"}
            </p>
          </div>

          <CrudTextField
            ref={discussionPointRef}
            label="Discussion Point"
            value={findingForm.discussion_point}
            onChange={(value) =>
              setFindingForm((current) => ({
                ...current,
                discussion_point: value,
              }))
            }
          />

          <CrudTextAreaField
            label="Finding"
            value={findingForm.observation_discussion}
            onChange={(value) =>
              setFindingForm((current) => ({
                ...current,
                observation_discussion: value,
              }))
            }
          />

          <CrudTextAreaField
            label="Decision"
            value={findingForm.observation_decision}
            onChange={(value) =>
              setFindingForm((current) => ({
                ...current,
                observation_decision: value,
              }))
            }
          />

          <CrudTextAreaField
            label="Note"
            value={findingForm.observation_note}
            onChange={(value) =>
              setFindingForm((current) => ({
                ...current,
                observation_note: value,
              }))
            }
          />

          <CrudSelectField
            label="Status"
            value={findingForm.status}
            options={[
              {
                value: "active",
                label: "Active",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
            ]}
            onChange={(value) =>
              setFindingForm((current) => ({
                ...current,
                status: value,
              }))
            }
          />
        </div>
      </CrudDrawer>

      {confirmFinding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-slate-900">
              Delete Finding
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this finding?
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmFinding(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteFinding}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
                    {confirmActionLabel[confirmAction]}
                  </span>{" "}
                  this Audit Visit?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  Visit #{confirmItem.visit_id} — {formatDate(confirmItem.visit_date)}
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
