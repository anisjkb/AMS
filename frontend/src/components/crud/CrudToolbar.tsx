import { RefreshCw, Search } from "lucide-react";

import { CRUD_PAGE_SIZE_OPTIONS } from "@/components/crud/crudConstants";

export type CrudToolbarOption = {
  value: string;
  label: string;
};

export type CrudToolbarFilter =
  | {
      key: string;
      label: string;
      type: "text" | "search";
      value: string;
      placeholder?: string;
      onChange: (value: string) => void;
    }
  | {
      key: string;
      label: string;
      type: "select";
      value: string;
      options: CrudToolbarOption[];
      disabled?: boolean;
      onChange: (value: string) => void;
    };

export default function CrudToolbar({
  pageSize,
  pageSizeOptions = CRUD_PAGE_SIZE_OPTIONS,
  filters,
  onPageSizeChange,
  onRefresh,
  onReset,
}: {
  pageSize: string;
  pageSizeOptions?: readonly string[];
  filters: CrudToolbarFilter[];
  onPageSizeChange: (value: string) => void;
  onRefresh: () => void;
  onReset: () => void;
}) {
  return (
    <div className="border-b border-slate-200 p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-500">Show</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All" : option}
              </option>
            ))}
          </select>
        </label>

        {filters.map((filter) => {
          if (filter.type === "select") {
            return (
              <label key={filter.key} className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">
                  {filter.label}
                </span>
                <select
                  value={filter.value}
                  disabled={filter.disabled}
                  onChange={(event) => filter.onChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                >
                  {filter.options.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <label key={filter.key} className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500">
                {filter.label}
              </span>
              <div className="relative">
                {filter.type === "search" ? (
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                ) : null}
                <input
                  type={filter.type === "search" ? "search" : "text"}
                  value={filter.value}
                  onChange={(event) => filter.onChange(event.target.value)}
                  placeholder={filter.placeholder}
                  className={
                    filter.type === "search"
                      ? "w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      : "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  }
                />
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-start gap-2 lg:justify-end">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-[42px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
