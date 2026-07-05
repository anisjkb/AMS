"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  createMeetingType,
  deactivateMeetingType,
  listMeetingTypes,
  permanentDeleteMeetingType,
  restoreMeetingType,
  updateMeetingType,
  type MeetingType,
} from "@/services/meetingType";

type FormState = {
  meeting_type_name: string;
  description: string;
  status: string;
};

const emptyForm: FormState = {
  meeting_type_name: "",
  description: "",
  status: "active",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function buildPayload(form: FormState) {
  return {
    meeting_type_name: form.meeting_type_name.trim(),
    description: form.description.trim() || null,
    status: form.status,
  };
}

export default function MeetingTypePage() {
  const [items, setItems] = useState<MeetingType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("active");
  const [sortBy] = useState("meeting_type_id");
  const [sortOrder] = useState<"asc" | "desc">("desc");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedItem, setSelectedItem] = useState<MeetingType | null>(null);
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

  const loadMeetingTypes = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await listMeetingTypes({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        is_active: isActiveValue,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [isActiveValue, page, pageSize, search, sortBy, sortOrder]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMeetingTypes();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMeetingTypes]);

  const openCreateForm = () => {
    setSelectedItem(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (item: MeetingType) => {
    setSelectedItem(item);
    setForm({
      meeting_type_name: item.meeting_type_name,
      description: item.description ?? "",
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.meeting_type_name.trim()) {
      setError("Meeting type name is required.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      if (selectedItem) {
        const response = await updateMeetingType(
          selectedItem.meeting_type_id,
          buildPayload(form),
        );
        setMessage(response.message);
      } else {
        const response = await createMeetingType(buildPayload(form));
        setMessage(response.message);
      }

      closeForm();
      await loadMeetingTypes();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (item: MeetingType) => {
    if (!window.confirm(`Are you sure you want to inactive "${item.meeting_type_name}"?`)) {
      return;
    }

    try {
      const response = await deactivateMeetingType(item.meeting_type_id);
      setMessage(response.message);
      await loadMeetingTypes();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const handleRestore = async (item: MeetingType) => {
    if (!window.confirm(`Are you sure you want to restore "${item.meeting_type_name}"?`)) {
      return;
    }

    try {
      const response = await restoreMeetingType(item.meeting_type_id);
      setMessage(response.message);
      await loadMeetingTypes();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const handlePermanentDelete = async (item: MeetingType) => {
    if (!window.confirm(`Permanently delete "${item.meeting_type_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await permanentDeleteMeetingType(item.meeting_type_id);
      setMessage(response.message);
      await loadMeetingTypes();
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
              Meeting Type
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Create and maintain reusable meeting types for Meeting Master dropdown selection.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Create Meeting Type
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
            placeholder="Search meeting type..."
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
              onClick={() => void loadMeetingTypes()}
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
              {selectedItem ? "Edit Meeting Type" : "Create Meeting Type"}
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
              <span className="text-sm font-medium text-slate-700">
                Meeting Type Name *
              </span>
              <input
                value={form.meeting_type_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    meeting_type_name: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                maxLength={100}
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                <th className="px-4 py-3">Meeting Type Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                    No meeting type found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.meeting_type_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{item.meeting_type_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {item.meeting_type_name}
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-600">
                      {item.description || "-"}
                    </td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
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

