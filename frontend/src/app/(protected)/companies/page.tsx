// E:\Audit\AMS\frontend\src\app\(protected)\companies\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import CompanyForm from "@/components/companies/CompanyForm";
import CompanyRowActions from "@/components/companies/CompanyRowActions";
import { useModuleActions } from "@/hooks/useModuleActions";

import {
  deactivateCompany,
  getAllCompanies,
  getCompaniesPage,
  permanentlyDeleteCompany,
  restoreCompany,
} from "@/services/company";

import type { PageSizeOption, StatusFilter } from "@/types/pagination";
import type { Company } from "@/types/company";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function CompaniesContent() {
  const companyActions = useModuleActions("company");

  const showCompanyRowActions =
    companyActions.canUpdate ||
    companyActions.canDelete ||
    companyActions.canRestore ||
    companyActions.canPermanentDelete;

  const tableColumnCount = showCompanyRowActions ? 8 : 7;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    window.setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadCompanies = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllCompanies({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getCompaniesPage({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setCompanies(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load companies:", error);
        setCompanies([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load companies."
        );
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllCompanies({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getCompaniesPage({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setCompanies(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load companies:", error);
        setCompanies([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load companies."
        );
      })
      .finally(() => {
        if (!isMounted) return;

        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingCompany(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingCompany);

    setDrawerOpen(false);
    setEditingCompany(null);

    showSuccess(
      wasEditing
        ? "Company updated successfully."
        : "Company created successfully."
    );

    void loadCompanies(false);
  };

  const openConfirm = (company: Company, action: ConfirmAction) => {
    setSelectedCompany(company);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedCompany(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateCompany(selectedCompany.id);
        showSuccess("Company marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreCompany(selectedCompany.id);
        showSuccess("Company restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteCompany(selectedCompany.id);
        showSuccess("Company permanently deleted successfully.");
      }

      setSelectedCompany(null);
      setConfirmAction(null);
      await loadCompanies(false);
    } catch (error) {
      console.error("Company action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Company action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Company as Inactive?";

    if (confirmAction === "restore") return "Restore Company?";

    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Company?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedCompany) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedCompany.company_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedCompany.company_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedCompany.company_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={Building2}
          title="Company Management"
          description="Manage organization companies with RBAC-based actions."
          height="x-small"
        />

        <PageActionBar
          menuKey="company"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Companies</h2>
            <p className="text-sm text-slate-500">
              Company list connected with backend CRUD API.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search company."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-275 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Email</th>
                  <th className="px-5 py-4 font-bold">Phone</th>
                  <th className="px-5 py-4 font-bold">Address</th>
                  <th className="px-5 py-4 font-bold">Status</th>

                  {showCompanyRowActions ? (
                    <th className="px-5 py-4 text-right font-bold">Action</th>
                  ) : null}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={tableColumnCount}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColumnCount}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No company data found. Click Create to add first company.
                    </td>
                  </tr>
                ) : (
                  companies.map((company, index) => (
                    <tr
                      key={company.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !company.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {company.company_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_code || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {company.company_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            company.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {company.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {showCompanyRowActions ? (
                        <td className="px-5 py-4 text-right">
                          <CompanyRowActions
                            company={company}
                            onEdit={handleEdit}
                            onInactive={(selected) =>
                              openConfirm(selected, "inactive")
                            }
                            onRestore={(selected) =>
                              openConfirm(selected, "restore")
                            }
                            onPermanentDelete={(selected) =>
                              openConfirm(selected, "permanent_delete")
                            }
                          />
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingCompany ? "Edit Company" : "Create Company"}
        onClose={handleCloseDrawer}
      >
        <CompanyForm
          key={
            editingCompany
              ? `edit-company-${editingCompany.id}`
              : "create-company"
          }
          initialData={editingCompany}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedCompany)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </>
  );
}

export default function CompaniesPage() {
  return <CompaniesContent />;
}