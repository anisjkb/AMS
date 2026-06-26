// E:\Audit\AMS\frontend\src\components\common\DataTablePagination.tsx

"use client";

import type { PageSizeOption } from "@/types/pagination";

type DataTablePaginationProps = {
  page: number;
  pageSize: PageSizeOption;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const getVisiblePages = (page: number, totalPages: number) => {
  const pages: number[] = [];

  if (totalPages <= 3) {
    for (let item = 1; item <= totalPages; item += 1) {
      pages.push(item);
    }

    return pages;
  }

  if (page <= 2) {
    return [1, 2, 3];
  }

  if (page >= totalPages - 1) {
    return [totalPages - 2, totalPages - 1, totalPages];
  }

  return [page - 1, page, page + 1];
};

export default function DataTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  const isAllMode = pageSize === "all";
  const numericPageSize = isAllMode ? total : pageSize;

  const showingFrom = total === 0 ? 0 : (page - 1) * numericPageSize + 1;
  const showingTo =
    total === 0 ? 0 : Math.min(page * numericPageSize, total);

  const visiblePages = getVisiblePages(page, totalPages);
  const isFirstDisabled = page <= 1 || isAllMode || totalPages <= 1;
  const isLastDisabled = page >= totalPages || isAllMode || totalPages <= 1;

  return (
    <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm font-semibold text-slate-600">
        Showing{" "}
        <span className="font-black text-slate-900">{showingFrom}</span> to{" "}
        <span className="font-black text-slate-900">{showingTo}</span> of{" "}
        <span className="font-black text-slate-900">{total}</span> records
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isFirstDisabled}
          onClick={() => onPageChange(1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          First
        </button>

        <button
          type="button"
          disabled={isFirstDisabled}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {visiblePages.map((item) => (
          <button
            key={item}
            type="button"
            disabled={isAllMode}
            onClick={() => onPageChange(item)}
            className={`rounded-xl border px-3 py-2 text-sm font-black ${
              item === page
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          disabled={isLastDisabled}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

        <button
          type="button"
          disabled={isLastDisabled}
          onClick={() => onPageChange(totalPages)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Last
        </button>
      </div>
    </div>
  );
}