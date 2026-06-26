export const CRUD_PAGE_SIZE_OPTIONS = [
  "10",
  "20",
  "30",
  "40",
  "50",
  "100",
  "all",
] as const;

export type CrudPageSizeOption = (typeof CRUD_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_CRUD_PAGE_SIZE: CrudPageSizeOption = "10";
