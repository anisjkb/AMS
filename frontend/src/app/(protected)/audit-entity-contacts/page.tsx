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
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
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
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
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

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

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
    setPageSize(value as CrudPageSizeOption);
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

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={loadContacts}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setEntityFilter("");
            setContactTypeFilter("");
            setPrimaryFilter("");
            setAuthorizedFilter("");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            setPage(1);
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search name, email, mobile, designation...",
              onChange: handleSearchChange,
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
              onChange: (value) =>
                handleStatusFilterChange(value as StatusFilter),
            },
            {
              key: "entity",
              label: "Entity",
              type: "select",
              value: entityFilter,
              disabled: isMasterLoading,
              options: [
                { value: "", label: "All" },
                ...auditEntities.map((entity) => ({
                  value: String(entity.id),
                  label: entity.entity_name,
                })),
              ],
              onChange: handleEntityFilterChange,
            },
            {
              key: "contactType",
              label: "Contact Type",
              type: "select",
              value: contactTypeFilter,
              disabled: isMasterLoading,
              options: [
                { value: "", label: "All" },
                ...contactTypes.map((type) => ({
                  value: String(type.id),
                  label: type.contact_type_name,
                })),
              ],
              onChange: handleContactTypeFilterChange,
            },
            {
              key: "primary",
              label: "Primary",
              type: "select",
              value: primaryFilter,
              options: [
                { value: "", label: "All" },
                { value: "primary", label: "Primary" },
                { value: "secondary", label: "Secondary" },
              ],
              onChange: handlePrimaryFilterChange,
            },
            {
              key: "authorized",
              label: "Authorized",
              type: "select",
              value: authorizedFilter,
              options: [
                { value: "", label: "All" },
                { value: "authorized", label: "Authorized" },
                { value: "not_authorized", label: "Not Authorized" },
              ],
              onChange: handleAuthorizedFilterChange,
            },
          ]}
        />

        {(successMessage || (errorMessage && !isDrawerOpen)) ? (
          <div className="border-b border-slate-200 px-6 py-4">
            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage && !isDrawerOpen ? (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}
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

        <CrudPagination
          page={page}
          totalPages={totalPages}
          total={totalRecords}
          pageSize={numericPageSize}
          onPageChange={setPage}
        />
      </section>

      <CrudDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={drawerMode === "create" ? "Create Contact" : "Edit Contact"}
        description="Keep primary, authorized representative and communication contact information."
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
              form="entity-contact-form"
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
          </>
        }
      >
        <form id="entity-contact-form" onSubmit={handleSubmit} className="space-y-6">
              {isReadOnly ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  You do not have create/update permission for this module.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <CrudSelectField
                  label="Audit Entity"
                  value={form.audit_entity_id}
                  required
                  disabled={isMasterLoading}
                  className="md:col-span-2"
                  options={[
                    {
                      value: "",
                      label: isMasterLoading
                        ? "Loading entities..."
                        : "Select entity",
                    },
                    ...auditEntities.map((entity) => ({
                      value: String(entity.id),
                      label: `${entity.entity_name} (${entity.entity_code})`,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      audit_entity_id: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Contact Type"
                  value={form.contact_type_id}
                  required
                  disabled={isMasterLoading}
                  options={[
                    { value: "", label: "Select contact type" },
                    ...contactTypes.map((type) => ({
                      value: String(type.id),
                      label: type.contact_type_name,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      contact_type_id: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Contact Name"
                  value={form.contact_name}
                  required
                  placeholder="Example: Mr. Rahman"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      contact_name: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Designation"
                  value={form.designation}
                  placeholder="Example: CFO"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      designation: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Department"
                  value={form.department}
                  placeholder="Example: Finance"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      department: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Email"
                  type="email"
                  value={form.email}
                  placeholder="name@example.com"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      email: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Mobile"
                  type="tel"
                  value={form.mobile}
                  placeholder="Example: 017..."
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      mobile: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  placeholder="Office phone"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                />

                <CrudTextField
                  label="WhatsApp"
                  type="tel"
                  value={form.whatsapp}
                  placeholder="WhatsApp number"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      whatsapp: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Primary Status"
                  value={form.is_primary ? "yes" : "no"}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_primary: value === "yes",
                    }))
                  }
                />

                <CrudSelectField
                  label="Authorized Representative"
                  value={form.is_authorized_representative ? "yes" : "no"}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_authorized_representative: value === "yes",
                    }))
                  }
                />

                <CrudTextAreaField
                  label="Remarks"
                  value={form.remarks}
                  rows={3}
                  placeholder="Optional remarks"
                  className="md:col-span-2"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      remarks: value,
                    }))
                  }
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}
        </form>
      </CrudDrawer>

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



