"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { useModuleActions } from "@/hooks/useModuleActions";
import {
  listAuditAcceptanceSelectorOptions,
  type AuditAcceptSelectorItem,
} from "@/services/auditAcceptanceProcedure";

type PageMessage = {
  type: "error";
  text: string;
};

const selectClassName = [
  "mt-2 min-h-12 w-full rounded-xl border border-slate-200",
  "bg-white px-4 text-sm font-bold text-slate-900 outline-none",
  "transition focus:border-slate-400 focus:ring-2",
  "focus:ring-slate-200 focus:ring-offset-1",
  "disabled:cursor-not-allowed disabled:bg-slate-100",
  "disabled:text-slate-400",
].join(" ");

function buildAuditLabel(
  audit: AuditAcceptSelectorItem,
) {
  const auditName =
    audit.audit_name?.trim() || audit.audit_type;

  return `${auditName} (Audit ID: ${audit.audit_id})`;
}

export default function AuditAcceptanceLauncherPage() {
  const router = useRouter();

  const acceptanceActions =
    useModuleActions("audit_accept_proce");

  const [selectorItems, setSelectorItems] =
    useState<AuditAcceptSelectorItem[]>([]);

  const [selectedYear, setSelectedYear] =
    useState("");

  const [selectedClientId, setSelectedClientId] =
    useState("");

  const [selectedAuditId, setSelectedAuditId] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [message, setMessage] =
    useState<PageMessage | null>(null);

  const loadSelectorOptions = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response =
        await listAuditAcceptanceSelectorOptions();

      setSelectorItems(response.items);
    } catch (error) {
      setSelectorItems([]);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load active Audit records.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!acceptanceActions.canView) return;

    const timerId = window.setTimeout(() => {
      void loadSelectorOptions();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    acceptanceActions.canView,
    loadSelectorOptions,
  ]);

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        selectorItems
          .map((item) => item.audit_year.trim())
          .filter(Boolean),
      ),
    ).sort((left, right) =>
      right.localeCompare(
        left,
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      ),
    );
  }, [selectorItems]);

  const clientOptions = useMemo(() => {
    if (!selectedYear) return [];

    const clientMap = new Map<
      number,
      string
    >();

    selectorItems
      .filter(
        (item) =>
          item.audit_year === selectedYear,
      )
      .forEach((item) => {
        clientMap.set(
          item.client_id,
          item.client_name,
        );
      });

    return Array.from(clientMap.entries())
      .map(([clientId, clientName]) => ({
        clientId,
        clientName,
      }))
      .sort((left, right) =>
        left.clientName.localeCompare(
          right.clientName,
        ),
      );
  }, [
    selectedYear,
    selectorItems,
  ]);

  const auditOptions = useMemo(() => {
    if (
      !selectedYear ||
      !selectedClientId
    ) {
      return [];
    }

    const clientId = Number.parseInt(
      selectedClientId,
      10,
    );

    return selectorItems
      .filter(
        (item) =>
          item.audit_year === selectedYear &&
          item.client_id === clientId,
      )
      .sort((left, right) =>
        buildAuditLabel(left).localeCompare(
          buildAuditLabel(right),
        ),
      );
  }, [
    selectedClientId,
    selectedYear,
    selectorItems,
  ]);

  const selectedAudit = useMemo(() => {
    if (!selectedAuditId) return null;

    const auditId = Number.parseInt(
      selectedAuditId,
      10,
    );

    return (
      auditOptions.find(
        (audit) =>
          audit.audit_id === auditId,
      ) ?? null
    );
  }, [
    auditOptions,
    selectedAuditId,
  ]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAudit) {
      setMessage({
        type: "error",
        text:
          "Select Audit Year, Client and Audit Name before continuing.",
      });

      return;
    }

    setMessage(null);

    router.push(
      `/audit-planning/audit-accept-proce/${selectedAudit.audit_id}`,
    );
  }

  if (!acceptanceActions.canView) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-rose-700"
          />

          <div>
            <h1 className="text-lg font-black text-rose-900">
              Access denied
            </h1>

            <p className="mt-1 text-sm leading-6 text-rose-700">
              You do not have permission to view
              Acceptance Procedures.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
              <ClipboardCheck
                size={30}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                Audit Planning
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                Acceptance Procedures
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Select an active Audit by year,
                client and Audit Name to open the
                Acceptance Procedures questionnaire.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <ClipboardList
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Select Active Audit
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Complete the selections in order:
                Audit Year, Client, then Audit Name.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div
              role="status"
              className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600"
            >
              <LoaderCircle
                size={20}
                aria-hidden="true"
                className="animate-spin"
              />

              Loading active Audit records...
            </div>
          ) : null}

          {!isLoading &&
          !message &&
          selectorItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
              No active Audit records are currently
              available for Acceptance Procedures.
            </div>
          ) : null}

          <div className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="acceptance-audit-year"
                className="flex items-center gap-2 text-sm font-black text-slate-800"
              >
                <CalendarDays
                  size={17}
                  aria-hidden="true"
                />
                Audit Year
              </label>

              <select
                id="acceptance-audit-year"
                value={selectedYear}
                disabled={
                  isLoading ||
                  yearOptions.length === 0
                }
                className={selectClassName}
                onChange={(event) => {
                  setSelectedYear(
                    event.target.value,
                  );
                  setSelectedClientId("");
                  setSelectedAuditId("");
                  setMessage(null);
                }}
              >
                <option value="">
                  {isLoading
                    ? "Loading Audit Years..."
                    : "Select Audit Year"}
                </option>

                {yearOptions.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="acceptance-client"
                className="flex items-center gap-2 text-sm font-black text-slate-800"
              >
                <Building2
                  size={17}
                  aria-hidden="true"
                />
                Client
              </label>

              <select
                id="acceptance-client"
                value={selectedClientId}
                disabled={
                  !selectedYear ||
                  clientOptions.length === 0
                }
                className={selectClassName}
                onChange={(event) => {
                  setSelectedClientId(
                    event.target.value,
                  );
                  setSelectedAuditId("");
                  setMessage(null);
                }}
              >
                <option value="">
                  {!selectedYear
                    ? "Select Audit Year First"
                    : clientOptions.length === 0
                      ? "No Active Clients Available"
                      : "Select Client"}
                </option>

                {clientOptions.map((client) => (
                  <option
                    key={client.clientId}
                    value={String(
                      client.clientId,
                    )}
                  >
                    {client.clientName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="acceptance-audit"
                className="flex items-center gap-2 text-sm font-black text-slate-800"
              >
                <ClipboardCheck
                  size={17}
                  aria-hidden="true"
                />
                Audit Name (Audit ID)
              </label>

              <select
                id="acceptance-audit"
                value={selectedAuditId}
                disabled={
                  !selectedClientId ||
                  auditOptions.length === 0
                }
                className={selectClassName}
                onChange={(event) => {
                  setSelectedAuditId(
                    event.target.value,
                  );
                  setMessage(null);
                }}
              >
                <option value="">
                  {!selectedClientId
                    ? "Select Client First"
                    : auditOptions.length === 0
                      ? "No Active Audits Available"
                      : "Select Audit Name"}
                </option>

                {auditOptions.map((audit) => (
                  <option
                    key={audit.audit_id}
                    value={String(
                      audit.audit_id,
                    )}
                  >
                    {buildAuditLabel(audit)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedAudit ? (
            <section className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Selected Audit
              </p>

              <p className="mt-1 font-black text-emerald-950">
                {buildAuditLabel(selectedAudit)}
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-800">
                {selectedAudit.client_name}
                {" · "}
                {selectedAudit.audit_type}
                {" · "}
                {selectedAudit.audit_year}
              </p>
            </section>
          ) : null}

          {message ? (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700"
            >
              <AlertCircle
                size={18}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm font-bold">
                {message.text}
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={
              !selectedAudit ||
              isLoading
            }
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            Open Acceptance Procedures

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
            <ShieldCheck
              size={24}
              aria-hidden="true"
              className="text-sky-700"
            />

            <h2 className="mt-3 font-black text-sky-950">
              Permission-safe access
            </h2>

            <p className="mt-2 text-sm leading-6 text-sky-800">
              This selector uses the Acceptance
              Procedures permission and does not
              require Audit Master list access.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <ClipboardList
              size={24}
              aria-hidden="true"
              className="text-slate-700"
            />

            <h2 className="mt-3 font-black text-slate-900">
              Active records only
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Only active Audit Masters linked to
              active Clients are available in the
              dropdowns.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
