// E:\Audit\AMS\frontend\src\types\pagination.ts

export type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";

export type StatusFilter = "all" | "active" | "inactive";

export type PaginationParams = {
  page?: number;
  pageSize?: Exclude<PageSizeOption, "all">;
  search?: string;
  status?: StatusFilter;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const PAGE_SIZE_OPTIONS: PageSizeOption[] = [
  10,
  20,
  30,
  40,
  50,
  100,
  "all",
];