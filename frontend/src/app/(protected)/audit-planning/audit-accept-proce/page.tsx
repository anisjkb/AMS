"use client";

import {
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Hash,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

import { useModuleActions } from "@/hooks/useModuleActions";

type PageMessage = {
  type: "error";
  text: string;
};

export default function AuditAcceptanceLauncherPage() {
  const router = useRouter();

  const acceptanceActions =
    useModuleActions("audit_accept_proce");

  const auditMasterActions =
    useModuleActions("audit_master");

  const [auditIdInput, setAuditIdInput] =
    useState("");

  const [message, setMessage] =
    useState<PageMessage | null>(null);

  const parsedAuditId =
    Number.parseInt(
      auditIdInput.trim(),
      10,
    );

  const hasValidAuditId =
    Number.isInteger(parsedAuditId) &&
    parsedAuditId > 0 &&
    String(parsedAuditId) ===
      auditIdInput.trim();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!hasValidAuditId) {
      setMessage({
        type: "error",
        text: "Enter a valid positive numeric Audit ID.",
      });

      return;
    }

    setMessage(null);

    router.push(
      `/audit-planning/audit-accept-proce/${parsedAuditId}`,
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
                Open the Acceptance Procedures
                questionnaire for a specific audit.
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
              <Hash
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Enter Audit ID
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Use the Audit ID from the Audit
                Master record you want to review.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="acceptance-audit-id"
              className="text-sm font-black text-slate-800"
            >
              Audit ID
            </label>

            <input
              id="acceptance-audit-id"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={auditIdInput}
              onChange={(event) => {
                setAuditIdInput(
                  event.target.value,
                );

                if (message) {
                  setMessage(null);
                }
              }}
              placeholder="Example: 125"
              aria-describedby="audit-id-help"
              aria-invalid={
                message ? true : undefined
              }
              className={[
                "mt-2 min-h-12 w-full rounded-xl border bg-white px-4",
                "text-base font-bold text-slate-900 outline-none transition",
                "placeholder:text-slate-300",
                "focus:ring-2 focus:ring-offset-1",
                message
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-200",
              ].join(" ")}
            />

            <p
              id="audit-id-help"
              className="mt-2 text-xs font-semibold text-slate-500"
            >
              Only positive whole numbers are
              accepted.
            </p>
          </div>

          {message ? (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700"
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
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:w-auto"
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
              This launcher does not require Audit
              Master list permission. The selected
              audit will still be validated by the
              Acceptance Procedures API.
            </p>
          </section>

          {auditMasterActions.canView ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <ListChecks
                size={24}
                aria-hidden="true"
                className="text-slate-700"
              />

              <h2 className="mt-3 font-black text-slate-900">
                Find an Audit ID
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Open Audit Master to search for an
                existing audit record and its ID.
              </p>

              <Link
                href="/audit-core/audit-master"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Open Audit Master

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}