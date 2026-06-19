"use client";

import { useEffect, useState } from "react";
import { Filter, GitBranch, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import BranchForm from "@/components/branches/BranchForm";
import BranchRowActions from "@/components/branches/BranchRowActions";

import {
  deactivateBranch,
  getBranches,
  permanentlyDeleteBranch,
  restoreBranch,
} from "@/services/branch";
import type { Branch } from "@/types/branch";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function BranchesContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getBranches()
      .then((data) => {
        if (!cancelled) {
          setBranches(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load branches:", error);
          setBranches([]);
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

  const filteredBranches = branches.filter((branch) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      branch.branch_name?.toLowerCase().includes(keyword) ||
      branch.branch_code?.toLowerCase().includes(keyword) ||
      branch.branch_email?.toLowerCase().includes(keyword) ||
      branch.branch_phone?.toLowerCase().includes(keyword) ||
      branch.company_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.is_active) ||
      (statusFilter === "inactive" && !branch.is_active);

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
    setEditingBranch(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingBranch(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingBranch);

    setDrawerOpen(false);
    setEditingBranch(null);

    showSuccess(
      wasEditing
        ? "Branch updated successfully."
        : "Branch created successfully."
    );

    loadBranches();
  };

  const openConfirm = (branch: Branch, action: ConfirmAction) => {
    setSelectedBranch(branch);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedBranch(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedBranch || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateBranch(selectedBranch.id);
        showSuccess("Branch marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreBranch(selectedBranch.id);
        showSuccess("Branch restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteBranch(selectedBranch.id);
        showSuccess("Branch permanently deleted successfully.");
      }

      setSelectedBranch(null);
      setConfirmAction(null);
      loadBranches();
    } catch (error) {
      console.error("Branch action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Branch action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Branch as Inactive?";
    if (confirmAction === "restore") return "Restore Branch?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Branch?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedBranch) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedBranch.branch_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedBranch.branch_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedBranch.branch_name}"? This action cannot be undone.`;
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
          icon={GitBranch}
          title="Branch Management"
          description="Manage company branches with RBAC-based actions."
          height="x-small"
        />

        <PageActionBar
          menuKey="branch"
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
              <h2 className="text-xl font-black text-slate-900">Branches</h2>
              <p className="text-sm text-slate-500">
                Branch list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search branch..."
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
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch Name</th>
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
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading branches...
                    </td>
                  </tr>
                ) : filteredBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No branch data found. Click Create to add first branch.
                    </td>
                  </tr>
                ) : (
                  filteredBranches.map((branch, index) => (
                    <tr
                      key={branch.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !branch.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {branch.company_name || `Company #${branch.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {branch.branch_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {branch.branch_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            branch.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {branch.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <BranchRowActions
                          branch={branch}
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
        title={editingBranch ? "Edit Branch" : "Create Branch"}
        onClose={handleCloseDrawer}
      >
        <BranchForm
          key={editingBranch ? `edit-branch-${editingBranch.id}` : "create-branch"}
          initialData={editingBranch}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedBranch)}
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

export default function BranchesPage() {
  return <BranchesContent />;
}