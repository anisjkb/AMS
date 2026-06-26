"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import { listAuditEntities, type AuditEntity } from "@/services/auditEntity";
import {
  createAuditEntityContact,
  deactivateAuditEntityContact,
  listAuditEntityContacts,
  listAuditEntityContactTypes,
  permanentDeleteAuditEntityContact,
  restoreAuditEntityContact,
  updateAuditEntityContact,
  type AuditEntityContact,
  type AuditEntityContactPayload,
  type AuditEntityContactType,
} from "@/services/auditEntityContact";

type StatusFilter = "all" | "active" | "inactive";
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type FormState = {
  audit_entity_id: string;
  contact_type_id: string;
  contact_name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  is_primary: boolean;
  is_authorized_representative: boolean;
  remarks: string;
};

const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

const initialForm: FormState = {
  audit_entity_id: "",
  contact_type_id: "",
  contact_name: "",
  designation: "",
  department: "",
  email: "",
  phone: "",
  mobile: "",
  whatsapp: "",
  is_primary: false,
  is_authorized_representative: false,
  remarks: "",
};

function cleanText(value: string) {
  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function toOptionalNumber(value: string) {
  if (!value) return undefined;

  return Number(value);
}

function toFormState(contact: AuditEntityContact): FormState {
  return {
    audit_entity_id: String(contact.audit_entity_id),
    contact_type_id: String(contact.contact_type_id),
    contact_name: contact.contact_name,
    designation: contact.designation ?? "",
    department: contact.department ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    mobile: contact.mobile ?? "",
    whatsapp: contact.whatsapp ?? "",
    is_primary: contact.is_primary,
    is_authorized_representative: contact.is_authorized_representative,
    remarks: contact.remarks ?? "",
  };
}

export default function AuditEntityContactsPage() {
  const actions = useModuleActions("audit_entity_contact");

  const [contacts, setContacts] = useState<AuditEntityContact[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [contactTypes, setContactTypes] = useState<AuditEntityContactType[]>(
    [],
  );
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityFilter, setEntityFilter] = useState("");
  const [contactTypeFilter, setContactTypeFilter] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState("");
  const [authorizedFilter, setAuthorizedFilter] = useState("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedContact, setSelectedContact] =
    useState<AuditEntityContact | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AuditEntityContact | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : pageSize;

  const entityById = useMemo(() => {
    return new Map(auditEntities.map((entity) => [entity.id, entity]));
  }, [auditEntities]);

  const contactTypeById = useMemo(() => {
    return new Map(contactTypes.map((type) => [type.id, type]));
  }, [contactTypes]);

  const totalPages = useMemo(() => {
    if (totalRecords === 0) return 1;

    return Math.max(1, Math.ceil(totalRecords / numericPageSize));
  }, [numericPageSize, totalRecords]);

  const showingFrom = totalRecords === 0 ? 0 : (page - 1) * numericPageSize + 1;
  const showingTo = Math.min(page * numericPageSize, totalRecords);

  const isReadOnly = !actions.canCreate && !actions.canUpdate;

  const loadMasterData = useCallback(async () => {
    setIsMasterLoading(true);

    try {
      const [entityResponse, contactTypeResponse] = await Promise.all([
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "entity_name",
          sortOrder: "asc",
        }),
        listAuditEntityContactTypes(true),
      ]);

      setAuditEntities(entityResponse.items);
      setContactTypes(contactTypeResponse.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load master data.",
      );
    } finally {
      setIsMasterLoading(false);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntityContacts({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        auditEntityId: toOptionalNumber(entityFilter),
        contactTypeId: toOptionalNumber(contactTypeFilter),
        isPrimary:
          primaryFilter === ""
            ? undefined
            : primaryFilter === "primary",
        isAuthorizedRepresentative:
          authorizedFilter === ""
            ? undefined
            : authorizedFilter === "authorized",
        sortBy: "id",
        sortOrder: "desc",
      });

      setContacts(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load contacts.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    authorizedFilter,
    contactTypeFilter,
    debouncedSearch,
    entityFilter,
    numericPageSize,
    page,
    primaryFilter,
    statusFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMasterData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadMasterData]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadContacts();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadContacts]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedContact(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (contact: AuditEntityContact) => {
    setDrawerMode("edit");
    setSelectedContact(contact);
    setForm(toFormState(contact));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setIsDrawerOpen(false);
    setSelectedContact(null);
    setForm(initialForm);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === "all" ? "all" : (Number(value) as PageSizeOption));
    setPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
    setPage(1);
  };

  const handleContactTypeFilterChange = (value: string) => {
    setContactTypeFilter(value);
    setPage(1);
  };

  const handlePrimaryFilterChange = (value: string) => {
    setPrimaryFilter(value);
    setPage(1);
  };

  const handleAuthorizedFilterChange = (value: string) => {
    setAuthorizedFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const buildPayload = (): AuditEntityContactPayload => {
    return {
      audit_entity_id: Number(form.audit_entity_id),
      contact_type_id: Number(form.contact_type_id),
      contact_name: form.contact_name.trim(),
      designation: cleanText(form.designation),
      department: cleanText(form.department),
      email: cleanText(form.email),
      phone: cleanText(form.phone),
      mobile: cleanText(form.mobile),
      whatsapp: cleanText(form.whatsapp),
      is_primary: form.is_primary,
      is_authorized_representative: form.is_authorized_representative,
      remarks: cleanText(form.remarks),
    };
  };

  const validateForm = () => {
    if (!form.audit_entity_id) {
      return "Audit entity is required.";
    }

    if (!form.contact_type_id) {
      return "Contact type is required.";
    }

    if (!form.contact_name.trim()) {
      return "Contact name is required.";
    }

    if (!form.email.trim() && !form.mobile.trim() && !form.phone.trim()) {
      return "At least one contact method is required: email, mobile or phone.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (drawerMode === "create") {
        await createAuditEntityContact(buildPayload());
        setSuccessMessage("Audit entity contact created successfully.");
      } else if (selectedContact) {
        await updateAuditEntityContact(selectedContact.id, buildPayload());
        setSuccessMessage("Audit entity contact updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedContact(null);
      setForm(initialForm);

      await loadContacts();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save contact.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (contact: AuditEntityContact, action: ConfirmAction) => {
    setConfirmTarget(contact);
    setConfirmAction(action);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
    setConfirmAction(null);
  };

  const executeConfirmAction = async () => {
    if (!confirmTarget || !confirmAction) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (confirmAction === "delete") {
        await deactivateAuditEntityContact(confirmTarget.id);
        setSuccessMessage("Contact deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityContact(confirmTarget.id);
        setSuccessMessage("Contact restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityContact(confirmTarget.id);
        setSuccessMessage("Contact permanently deleted successfully.");
      }

      closeConfirm();
      await loadContacts();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to complete action.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const goFirst = () => setPage(1);
  const goPrevious = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () => setPage((current) => Math.min(totalPages, current + 1));
  const goLast = () => setPage(totalPages);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                <UserRound className="h-4 w-4" />
                Audit Entity Profile
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                Entity Contacts
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Maintain primary, finance, audit coordinator, compliance and
                authorized representative contacts for audit entities.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </button>
            ) : null}
          </div>
        </div>

        <div className="border-b border-slate-200 px-6 py-4">
          <div className="grid gap-3 lg:grid-cols-[120px_1fr_160px_180px_180px_150px_160px]">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Show
              </span>
              <select
                value={String(pageSize)}
                onChange={(event) => handlePageSizeChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                {pageSizeOptions.map((option) => (
                  <option key={String(option)} value={String(option)}>
                    {option === "all" ? "All" : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Search
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search name, email, mobile, designation..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm outline-none transition focus:border-slate-500"
                />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  handleStatusFilterChange(event.target.value as StatusFilter)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Entity
              </span>
              <select
                value={entityFilter}
                onChange={(event) =>
                  handleEntityFilterChange(event.target.value)
                }
                disabled={isMasterLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
              >
                <option value="">All</option>
                {auditEntities.map((entity) => (
                  <option key={entity.id} value={String(entity.id)}>
                    {entity.entity_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Contact Type
              </span>
              <select
                value={contactTypeFilter}
                onChange={(event) =>
                  handleContactTypeFilterChange(event.target.value)
                }
                disabled={isMasterLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
              >
                <option value="">All</option>
                {contactTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.contact_type_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Primary
              </span>
              <select
                value={primaryFilter}
                onChange={(event) =>
                  handlePrimaryFilterChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Authorized
              </span>
              <select
                value={authorizedFilter}
                onChange={(event) =>
                  handleAuthorizedFilterChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                <option value="authorized">Authorized</option>
                <option value="not_authorized">Not Authorized</option>
              </select>
            </label>
          </div>
        </div>

        {errorMessage ? (
          <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mx-6 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Communication
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Flags
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <UserRound className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No contacts found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add contact profile for audit entities.
                    </p>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const entity = entityById.get(contact.audit_entity_id);
                  const contactType = contactTypeById.get(contact.contact_type_id);
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    contact.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !contact.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !contact.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={contact.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity?.entity_name ?? `Entity #${contact.audit_entity_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity?.entity_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {contact.contact_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {contact.designation ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Dept: {contact.department ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {contactType?.contact_type_name ??
                            `Type #${contact.contact_type_id}`}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {contact.email ?? "-"}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          Mobile: {contact.mobile ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Phone: {contact.phone ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          WhatsApp: {contact.whatsapp ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {contact.is_primary ? (
                            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              Primary
                            </span>
                          ) : null}

                          {contact.is_authorized_representative ? (
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              Authorized
                            </span>
                          ) : null}

                          {!contact.is_primary &&
                          !contact.is_authorized_representative ? (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              Regular
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            contact.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {contact.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(contact)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(contact, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(contact, "restore")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canPermanentDelete ? (
                            <button
                              type="button"
                              onClick={() =>
                                openConfirm(contact, "permanent_delete")
                              }
                              className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                              title="Permanent delete"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">{showingFrom}</span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">{showingTo}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{totalRecords}</span>{" "}
            records
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goFirst}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              First
            </button>
            <button
              type="button"
              onClick={goPrevious}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 font-semibold text-slate-900">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              onClick={goLast}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </section>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {drawerMode === "create"
                    ? "Create Entity Contact"
                    : "Edit Entity Contact"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  One audit entity can keep multiple contacts by type and role.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              {isReadOnly ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  You do not have create/update permission for this module.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Audit Entity <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.audit_entity_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        audit_entity_id: event.target.value,
                      }))
                    }
                    disabled={isMasterLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  >
                    <option value="">
                      {isMasterLoading ? "Loading entities..." : "Select entity"}
                    </option>
                    {auditEntities.map((entity) => (
                      <option key={entity.id} value={String(entity.id)}>
                        {entity.entity_name} ({entity.entity_code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Contact Type <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.contact_type_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contact_type_id: event.target.value,
                      }))
                    }
                    disabled={isMasterLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  >
                    <option value="">Select contact type</option>
                    {contactTypes.map((type) => (
                      <option key={type.id} value={String(type.id)}>
                        {type.contact_type_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Contact Name <span className="text-rose-500">*</span>
                  </span>
                  <input
                    value={form.contact_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contact_name: event.target.value,
                      }))
                    }
                    placeholder="Example: Mr. Rahman"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Designation
                  </span>
                  <input
                    value={form.designation}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        designation: event.target.value,
                      }))
                    }
                    placeholder="Example: CFO"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Department
                  </span>
                  <input
                    value={form.department}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        department: event.target.value,
                      }))
                    }
                    placeholder="Example: Finance"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <input
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Mobile
                  </span>
                  <input
                    value={form.mobile}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        mobile: event.target.value,
                      }))
                    }
                    placeholder="Example: 017..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Phone
                  </span>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Office phone"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    WhatsApp
                  </span>
                  <input
                    value={form.whatsapp}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        whatsapp: event.target.value,
                      }))
                    }
                    placeholder="WhatsApp number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Primary Status
                  </span>
                  <select
                    value={form.is_primary ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_primary: event.target.value === "yes",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Authorized Representative
                  </span>
                  <select
                    value={form.is_authorized_representative ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_authorized_representative:
                          event.target.value === "yes",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Remarks
                  </span>
                  <textarea
                    value={form.remarks}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        remarks: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Optional remarks"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isReadOnly}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {confirmTarget && confirmAction ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Action
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Are you sure you want to{" "}
                  <span className="font-semibold">
                    {confirmAction.replace("_", " ")}
                  </span>{" "}
                  this contact?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void executeConfirmAction()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


