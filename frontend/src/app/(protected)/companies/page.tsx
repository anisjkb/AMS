"use client";

import { useEffect, useState } from "react";
import { Building2, Filter, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import CompanyForm from "@/components/companies/CompanyForm";
import CompanyRowActions from "@/components/companies/CompanyRowActions";

import {
  deactivateCompany,
  getCompanies,
  permanentlyDeleteCompany,
  restoreCompany,
} from "@/services/company";
import type { Company } from "@/types/company";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function CompaniesContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load companies:", error);
          setCompanies([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      company.company_name?.toLowerCase().includes(keyword) ||
      company.company_code?.toLowerCase().includes(keyword) ||
      company.company_email?.toLowerCase().includes(keyword) ||
      company.company_phone?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && company.is_active) ||
      (statusFilter === "inactive" && !company.is_active);

    return matchesSearch && matchesStatus;
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
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

    loadCompanies();
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
      loadCompanies();
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
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Companies</h2>
              <p className="text-sm text-slate-500">
                Company list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search company..."
                  className="ml-2 bg-transparent text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Filter size={17} className="text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

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
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading companies...
                    </td>
                  </tr>
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No company data found. Click Create to add first company.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company, index) => (
                    <tr
                      key={company.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !company.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {company.company_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_code}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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