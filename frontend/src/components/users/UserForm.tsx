// E:\Audit\AMS\frontend\src\components\users\UserForm.tsx

"use client";

import { useState, type FormEvent } from "react";

import { createUser, updateUser } from "@/services/user";
import type { User } from "@/types/user";

type UserFormProps = {
  initialData?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const MIN_PASSWORD_LENGTH = 8;

export default function UserForm({
  initialData,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const [loginId, setLoginId] = useState(initialData?.user_id || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [password, setPassword] = useState("");
  const [isSuperuser, setIsSuperuser] = useState(
    initialData?.is_superuser || false
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEditMode = Boolean(initialData);

  const validatePassword = () => {
    if (!isEditMode && !password.trim()) {
      return "Password is required for new user.";
    }

    if (password.trim() && password.trim().length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !fullName.trim()) {
      setErrorMessage("Email and full name are required.");
      return;
    }

    if (!isEditMode && !loginId.trim()) {
      setErrorMessage("Login ID is required.");
      return;
    }

    const passwordError = validatePassword();

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (initialData) {
        await updateUser(initialData.id, {
          email: email.trim(),
          full_name: fullName.trim(),
          password: password.trim() || undefined,
          is_superuser: isSuperuser,
        });
      } else {
        await createUser({
          user_id: loginId.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
          password: password.trim(),
          is_superuser: isSuperuser,
        });
      }

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "User save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Login ID <span className="text-red-500">*</span>
        </label>

        <input
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          disabled={isEditMode}
          placeholder="Example: S03025, admin, auditor01"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
        />

        <p className="mt-2 text-xs font-semibold text-slate-500">
          Login ID is used for internal user identification.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Full Name <span className="text-red-500">*</span>
        </label>

        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Example: Test Branch User"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>

        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="user@example.com"
          type="email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Password{" "}
          {isEditMode ? (
            <span className="text-slate-400">
              (leave blank to keep old password)
            </span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </label>

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={
            isEditMode ? "Optional new password" : "Enter password"
          }
          type="password"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <p className="mt-2 text-xs font-semibold text-slate-500">
          Password must be at least 8 characters. Recommended: use uppercase,
          lowercase, number and symbol.
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
        <input
          checked={isSuperuser}
          onChange={(event) => setIsSuperuser(event.target.checked)}
          type="checkbox"
          className="h-4 w-4"
        />
        Super Admin / Superuser
      </label>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditMode ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}