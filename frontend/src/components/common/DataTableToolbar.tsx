// E:\Audit\AMS\frontend\src\components\common\DataTableToolbar.tsx

"use client";

import { Filter, Search } from "lucide-react";

import {
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
  type StatusFilter,
} from "@/types/pagination";

type DataTableToolbarProps = {
  pageSize: PageSizeOption;
  searchTerm: string;
  statusFilter: StatusFilter;
  searchPlaceholder?: string;
  onPageSizeChange: (pageSize: PageSizeOption) => void;
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (status: StatusFilter) => void;
};

export default function DataTableToolbar({
  pageSize,
  searchTerm,
  statusFilter,
  searchPlaceholder = "Search...",
  onPageSizeChange,
  onSearchChange,
  onStatusChange,
}: DataTableToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-600">Show:</span>

        <select
          value={String(pageSize)}
          onChange={(event) => {
            const value = event.target.value;
            onPageSizeChange(value === "all" ? "all" : Number(value) as PageSizeOption);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={String(option)} value={String(option)}>
              {option === "all" ? "All" : option}
            </option>
          ))}
        </select>

        <span className="text-sm font-bold text-slate-600">entries</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={17} className="text-slate-400" />

          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="ml-2 w-60 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Filter size={17} className="text-slate-400" />

          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }
            className="ml-2 bg-transparent text-sm font-bold text-slate-600 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}