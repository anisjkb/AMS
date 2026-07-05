"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  createMeetingMaster,
  deactivateMeetingMaster,
  listMeetingMaster,
  permanentDeleteMeetingMaster,
  restoreMeetingMaster,
  updateMeetingMaster,
  type MeetingMaster,
} from "@/services/meetingMaster";
import { listMeetingTypes, type MeetingType } from "@/services/meetingType";

type AuditEntity = {
  entity_id?: number;
  client_id?: number;
  id?: number;
  entity_code?: string;
  client_code?: string;
  code?: string;
  entity_name?: string;
  client_name?: string;
  name?: string;
  entity_type?: string;
  type?: string;
};

type AuditEntityListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntity[];
};

type FormState = {
  meeting_name: string;
  meeting_type_id: string;
  entity_type: string;
  client_key: string;
  audit_year: string;
  meeting_date: string;
  audit_start_date: string;
  audit_end_date: string;
  meeting_venue: string;
  meeting_note1: string;
  status: string;
};

const emptyForm: FormState = {
  meeting_name: "",
  meeting_type_id: "",
  entity_type: "",
  client_key: "",
  audit_year: "",
  meeting_date: "",
  audit_start_date: "",
  audit_end_date: "",
  meeting_venue: "",
  meeting_note1: "",
  status: "active",
};

async function requestJson<T>(input: string): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      message = data?.detail || data?.message || message;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function getEntityId(entity: AuditEntity): number {
  return Number(entity.client_id ?? entity.entity_id ?? entity.id ?? 0);
}

function getEntityCode(entity: AuditEntity): string {
  return String(entity.client_code ?? entity.entity_code ?? entity.code ?? "");
}

function getEntityName(entity: AuditEntity): string {
  return String(entity.client_name ?? entity.entity_name ?? entity.name ?? getEntityCode(entity));
}

function getEntityType(entity: AuditEntity): string {
  return String(entity.entity_type ?? entity.type ?? "General");
}

function getEntityKey(entity: AuditEntity): string {
  return `${getEntityId(entity)}::${getEntityCode(entity)}`;
}

function toDateValue(value: string): string {
  return value ? value.slice(0, 10) : "";
}

export default function MeetingMasterPage() {
  const [items, setItems] = useState<MeetingMaster[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("active");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedItem, setSelectedItem] = useState<MeetingMaster | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [pageSize, total]);

  const isActiveValue = useMemo(() => {
    if (activeFilter === "active") return true;
    if (activeFilter === "inactive") return false;
    return undefined;
  }, [activeFilter]);

  const entityTypes = useMemo(() => {
    return Array.from(new Set(auditEntities.map(getEntityType))).sort();
  }, [auditEntities]);

  const filteredEntities = useMemo(() => {
    if (!form.entity_type) {
      return auditEntities;
    }

    return auditEntities.filter((entity) => getEntityType(entity) === form.entity_type);
  }, [auditEntities, form.entity_type]);

  const selectedMeetingType = useMemo(() => {
    return meetingTypes.find(
      (item) => String(item.meeting_type_id) === form.meeting_type_id,
    );
  }, [form.meeting_type_id, meetingTypes]);

  const selectedEntity = useMemo(() => {
    return auditEntities.find((entity) => getEntityKey(entity) === form.client_key);
  }, [auditEntities, form.client_key]);

  const loadMeetingMaster = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await listMeetingMaster({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        sort_by: "meeting_id",
        sort_order: "desc",
        is_active: isActiveValue,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [isActiveValue, page, pageSize, search]);

  const loadLookups = useCallback(async () => {
    try {
      const [meetingTypeResponse, entityResponse] = await Promise.all([
        listMeetingTypes({
          page: 1,
          page_size: 100,
          sort_by: "meeting_type_name",
          sort_order: "asc",
          is_active: true,
        }),
        requestJson<AuditEntityListResponse>(
          "/api/backend/audit-entities?page=1&page_size=100&sort_by=entity_type&sort_order=asc&is_active=true",
        ),
      ]);

      setMeetingTypes(meetingTypeResponse.items);
      setAuditEntities(entityResponse.items);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMeetingMaster();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMeetingMaster]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLookups();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadLookups]);

  const openCreateForm = () => {
    setSelectedItem(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (item: MeetingMaster) => {
    const matchedEntity = auditEntities.find(
      (entity) =>
        getEntityId(entity) === Number(item.client_id) ||
        getEntityCode(entity) === item.client_code,
    );

    setSelectedItem(item);
    setForm({
      meeting_name: item.meeting_name,
      meeting_type_id: String(item.meeting_type_id),
      entity_type: matchedEntity ? getEntityType(matchedEntity) : "",
      client_key: matchedEntity ? getEntityKey(matchedEntity) : "",
      audit_year: item.audit_year,
      meeting_date: toDateValue(item.meeting_date),
      audit_start_date: toDateValue(item.audit_start_date),
      audit_end_date: toDateValue(item.audit_end_date),
      meeting_venue: item.meeting_venue,
      meeting_note1: item.meeting_note1,
      status: item.status,
    });
    setMessage("");
    setError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const buildPayload = () => {
    if (!selectedMeetingType) {
      throw new Error("Meeting type is required.");
    }

    if (!selectedEntity) {
      throw new Error("Client / Entity is required.");
    }

    return {
      meeting_name: form.meeting_name.trim(),
      meeting_type_id: selectedMeetingType.meeting_type_id,
      meeting_type: selectedMeetingType.meeting_type_name,
      client_id: getEntityId(selectedEntity),
      client_code: getEntityCode(selectedEntity),
      audit_year: form.audit_year.trim(),
      meeting_date: form.meeting_date,
      audit_start_date: form.audit_start_date,
      audit_end_date: form.audit_end_date,
      meeting_venue: form.meeting_venue.trim(),
      meeting_note1: form.meeting_note1.trim(),
      status: form.status,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = buildPayload();

      if (selectedItem) {
        const response = await updateMeetingMaster(selectedItem.meeting_id, payload);
        setMessage(response.message);
      } else {
        const response = await createMeetingMaster(payload);
        setMessage(response.message);
      }

      closeForm();
      await loadMeetingMaster();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (item: MeetingMaster) => {
    if (!window.confirm(`Are you sure you want to inactive "${item.meeting_name}"?`)) {
      return;
    }

    try {
      const response = await deactivateMeetingMaster(item.meeting_id);
      setMessage(response.message);
      await loadMeetingMaster();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const handleRestore = async (item: MeetingMaster) => {
    if (!window.confirm(`Are you sure you want to restore "${item.meeting_name}"?`)) {
      return;
    }

    try {
      const response = await restoreMeetingMaster(item.meeting_id);
      setMessage(response.message);
      await loadMeetingMaster();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const handlePermanentDelete = async (item: MeetingMaster) => {
    if (!window.confirm(`Permanently delete "${item.meeting_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await permanentDeleteMeetingMaster(item.meeting_id);
      setMessage(response.message);
      await loadMeetingMaster();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("active");
    setPage(1);
  };

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Audit Meetings
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Meeting Master
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Maintain meeting records with normalized meeting type and meeting name.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Create Meeting
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search meeting..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          />

          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadMeetingMaster()}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isFormOpen ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              {selectedItem ? "Edit Meeting" : "Create Meeting"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Meeting Name *</span>
              <input
                value={form.meeting_name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, meeting_name: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                maxLength={150}
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Meeting Type *</span>
              <select
                value={form.meeting_type_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, meeting_type_id: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select meeting type</option>
                {meetingTypes.map((item) => (
                  <option key={item.meeting_type_id} value={item.meeting_type_id}>
                    {item.meeting_type_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Entity Type</span>
              <select
                value={form.entity_type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    entity_type: event.target.value,
                    client_key: "",
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All entity types</option>
                {entityTypes.map((entityType) => (
                  <option key={entityType} value={entityType}>
                    {entityType}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Client / Entity *</span>
              <select
                value={form.client_key}
                onChange={(event) =>
                  setForm((current) => ({ ...current, client_key: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select client / entity</option>
                {filteredEntities.map((entity) => (
                  <option key={getEntityKey(entity)} value={getEntityKey(entity)}>
                    {getEntityCode(entity)} - {getEntityName(entity)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Audit Year *</span>
              <input
                value={form.audit_year}
                onChange={(event) =>
                  setForm((current) => ({ ...current, audit_year: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Meeting Date *</span>
              <input
                type="date"
                value={form.meeting_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, meeting_date: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Audit Start Date *</span>
              <input
                type="date"
                value={form.audit_start_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, audit_start_date: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Audit End Date *</span>
              <input
                type="date"
                value={form.audit_end_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, audit_end_date: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Meeting Venue *</span>
              <input
                value={form.meeting_venue}
                onChange={(event) =>
                  setForm((current) => ({ ...current, meeting_venue: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Meeting Note *</span>
              <textarea
                value={form.meeting_note1}
                onChange={(event) =>
                  setForm((current) => ({ ...current, meeting_note1: event.target.value }))
                }
                className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : selectedItem ? "Update" : "Save"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-600">
            Total records: <span className="font-semibold">{total}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Meeting Name</th>
                <th className="px-4 py-3">Meeting Type</th>
                <th className="px-4 py-3">Client Code</th>
                <th className="px-4 py-3">Audit Year</th>
                <th className="px-4 py-3">Meeting Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>
                    No meeting found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.meeting_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{item.meeting_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {item.meeting_name}
                    </td>
                    <td className="px-4 py-3">{item.meeting_type}</td>
                    <td className="px-4 py-3">{item.client_code}</td>
                    <td className="px-4 py-3">{item.audit_year}</td>
                    <td className="px-4 py-3">{toDateValue(item.meeting_date)}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        {item.is_active ? (
                          <button
                            type="button"
                            onClick={() => void handleDeactivate(item)}
                            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            Inactive
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleRestore(item)}
                              className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => void handlePermanentDelete(item)}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              Permanent Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
