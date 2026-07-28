// E:\Audit\AMS\frontend\src\components\users\UserForm.tsx

"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import {
  createUser,
  getUserEmployeeOptions,
  updateUser,
} from "@/services/user";
import type {
  User,
  UserEmployeeOption,
} from "@/types/user";

type UserFormProps = {
  initialData?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const MIN_LOGIN_ID_LENGTH = 3;
const MAX_LOGIN_ID_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const LOGIN_ID_PATTERN = /^[A-Za-z0-9]+$/;

const formatEmployeeLabel = (
  employee: UserEmployeeOption
) => {
  const identifier =
    employee.official_employee_id ||
    "Official ID missing";

  const availability = employee.can_create_user
    ? ""
    : " — Unavailable";

  return `${employee.employee_name} (${identifier})${availability}`;
};

export default function UserForm({
  initialData,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const isEditMode = Boolean(initialData);

  const [employeeTypes, setEmployeeTypes] = useState<
    string[]
  >([]);

  const [employeeOptions, setEmployeeOptions] = useState<
    UserEmployeeOption[]
  >([]);

  const [employeeType, setEmployeeType] = useState("");

  const [employeeId, setEmployeeId] = useState(
    initialData?.employee_id
      ? String(initialData.employee_id)
      : ""
  );

  const [loginId, setLoginId] = useState(
    initialData?.user_id || ""
  );

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSuperuser, setIsSuperuser] = useState(
    initialData?.is_superuser || false
  );

  const [typeLoading, setTypeLoading] = useState(false);
  const [typesLoaded, setTypesLoaded] = useState(false);

  const [employeeLoading, setEmployeeLoading] =
    useState(false);

  const [employeesLoaded, setEmployeesLoaded] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedEmployee =
    employeeOptions.find(
      (employee) =>
        String(employee.employee_id) === employeeId
    ) || null;

  const fullName = isEditMode
    ? initialData?.full_name || ""
    : selectedEmployee?.employee_name || "";

  const email = isEditMode
    ? initialData?.email || ""
    : selectedEmployee?.email || "";

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    let isActive = true;

    const timerId = window.setTimeout(() => {
      setTypeLoading(true);
      setTypesLoaded(false);

      void getUserEmployeeOptions()
        .then((response) => {
          if (!isActive) {
            return;
          }

          setEmployeeTypes(response.employee_types);
        })
        .catch((error: unknown) => {
          if (!isActive) {
            return;
          }

          setEmployeeTypes([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Employee Types could not be loaded."
          );
        })
        .finally(() => {
          if (!isActive) {
            return;
          }

          setTypeLoading(false);
          setTypesLoaded(true);
        });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timerId);
    };
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode || !employeeType) {
      return;
    }

    let isActive = true;

    const timerId = window.setTimeout(() => {
      setEmployeeLoading(true);
      setEmployeesLoaded(false);

      void getUserEmployeeOptions(employeeType)
        .then((response) => {
          if (!isActive) {
            return;
          }

          setEmployeeOptions(response.items);
        })
        .catch((error: unknown) => {
          if (!isActive) {
            return;
          }

          setEmployeeOptions([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Employees could not be loaded."
          );
        })
        .finally(() => {
          if (!isActive) {
            return;
          }

          setEmployeeLoading(false);
          setEmployeesLoaded(true);
        });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timerId);
    };
  }, [employeeType, isEditMode]);

  const handleEmployeeTypeChange = (value: string) => {
    setEmployeeType(value);
    setEmployeeId("");
    setEmployeeOptions([]);
    setEmployeesLoaded(false);
    setLoginId("");
    setErrorMessage("");
  };

  const handleEmployeeChange = (value: string) => {
    const employee =
      employeeOptions.find(
        (item) =>
          String(item.employee_id) === value
      ) || null;

    setEmployeeId(value);
    setLoginId(employee?.official_employee_id || "");
    setErrorMessage("");
  };

  const validatePassword = () => {
    const cleanPassword = password.trim();
    const cleanConfirmPassword =
      confirmPassword.trim();

    if (!isEditMode && !cleanPassword) {
      return "Password is required for a new User.";
    }

    if (!isEditMode && !cleanConfirmPassword) {
      return (
        "Confirm Password is required for a new User."
      );
    }

    if (
      isEditMode &&
      !cleanPassword &&
      cleanConfirmPassword
    ) {
      return (
        "Enter a New Password before confirming it."
      );
    }

    if (cleanPassword && !cleanConfirmPassword) {
      return isEditMode
        ? "Confirm New Password is required."
        : "Confirm Password is required.";
    }

    if (
      cleanPassword &&
      cleanPassword.length < MIN_PASSWORD_LENGTH
    ) {
      return (
        "Password must be at least " +
        `${MIN_PASSWORD_LENGTH} characters long.`
      );
    }

    if (cleanPassword.length > MAX_PASSWORD_LENGTH) {
      return (
        "Password cannot exceed " +
        `${MAX_PASSWORD_LENGTH} characters.`
      );
    }

    if (
      cleanPassword &&
      cleanPassword !== cleanConfirmPassword
    ) {
      return isEditMode
        ? "New Password and Confirm New Password do not match."
        : "Password and Confirm Password do not match.";
    }

    return "";
  };

  const validateCreateIdentity = () => {
    if (isEditMode) {
      return "";
    }

    if (!employeeType) {
      return "Select an Employee Type.";
    }

    if (!selectedEmployee) {
      return "Select an Employee.";
    }

    if (!selectedEmployee.can_create_user) {
      return (
        selectedEmployee.blocking_reason ||
        "The selected Employee cannot be linked."
      );
    }

    if (!selectedEmployee.official_employee_id) {
      return (
        "Create or update the Official Employee ID " +
        "in Employee Master first."
      );
    }

    if (!selectedEmployee.email) {
      return (
        "Add the Employee email address in " +
        "Employee Master first."
      );
    }

    if (!selectedEmployee.employee_name.trim()) {
      return (
        "Add a valid Employee Name in " +
        "Employee Master first."
      );
    }

    const cleanLoginId = loginId.trim();

    if (!cleanLoginId) {
      return "Login ID is required.";
    }

    if (cleanLoginId.length < MIN_LOGIN_ID_LENGTH) {
      return (
        "Login ID must be at least " +
        `${MIN_LOGIN_ID_LENGTH} characters.`
      );
    }

    if (cleanLoginId.length > MAX_LOGIN_ID_LENGTH) {
      return (
        "Login ID cannot exceed " +
        `${MAX_LOGIN_ID_LENGTH} characters.`
      );
    }

    if (!LOGIN_ID_PATTERN.test(cleanLoginId)) {
      return (
        "Login ID can contain English letters " +
        "and numbers only."
      );
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const identityError = validateCreateIdentity();

    if (identityError) {
      setErrorMessage(identityError);
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
          password: password.trim() || undefined,
          is_superuser: isSuperuser,
        });
      } else {
        if (!selectedEmployee) {
          throw new Error(
            "Select an Employee before creating the User."
          );
        }

        await createUser({
          user_id: loginId.trim(),
          employee_id: selectedEmployee.employee_id,
          password: password.trim(),
          is_superuser: isSuperuser,
        });
      }

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "User save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  const employeeTypeOptions = [
    {
      value: "",
      label: typeLoading
        ? "Loading Employee Types..."
        : typesLoaded && employeeTypes.length === 0
          ? "No unlinked Employee Types available"
          : "Select Employee Type",
    },
    ...employeeTypes.map((type) => ({
      value: type,
      label: type,
    })),
  ];

  const employeeSelectOptions = [
    {
      value: "",
      label: !employeeType
        ? "Select Employee Type first"
        : employeeLoading
          ? "Loading Employees..."
          : employeesLoaded &&
              employeeOptions.length === 0
            ? "No unlinked Employees available"
            : "Select Employee",
    },
    ...employeeOptions.map((employee) => ({
      value: String(employee.employee_id),
      label: formatEmployeeLabel(employee),
    })),
  ];

  const submitDisabled =
    saving ||
    (
      !isEditMode &&
      (typeLoading || employeeLoading)
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {!isEditMode ? (
        <>
          <CrudSelectField
            label="Employee Type"
            value={employeeType}
            required
            disabled={
              saving ||
              typeLoading ||
              (
                typesLoaded &&
                employeeTypes.length === 0
              )
            }
            options={employeeTypeOptions}
            onChange={handleEmployeeTypeChange}
          />

          <CrudSelectField
            label="Employee"
            value={employeeId}
            required
            disabled={
              saving ||
              !employeeType ||
              employeeLoading ||
              (
                employeesLoaded &&
                employeeOptions.length === 0
              )
            }
            options={employeeSelectOptions}
            onChange={handleEmployeeChange}
          />

          {selectedEmployee?.blocking_reason ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {selectedEmployee.blocking_reason}
            </div>
          ) : null}

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold leading-5 text-blue-700">
            Full Name and Email are read-only and come
            from Employee Master. Login ID is suggested
            from the Official Employee ID and may be
            changed using English letters and numbers.
          </div>
        </>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Employee Linkage
          </label>

          <input
            value={
              initialData?.employee_id
                ? `Linked Employee ID: ${initialData.employee_id}`
                : "Legacy/System User — No Employee linked"
            }
            disabled
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
          />

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Employee linkage is locked after User
            creation.
          </p>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Login ID{" "}
          {!isEditMode ? (
            <span className="text-red-500">*</span>
          ) : null}
        </label>

        <input
          value={loginId}
          onChange={(event) => {
            setLoginId(event.target.value);
            setErrorMessage("");
          }}
          disabled={isEditMode || saving}
          required={!isEditMode}
          minLength={MIN_LOGIN_ID_LENGTH}
          maxLength={MAX_LOGIN_ID_LENGTH}
          pattern="[A-Za-z0-9]+"
          autoComplete="username"
          placeholder="Example: S03025 or auditor01"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
        />

        <p className="mt-2 text-xs font-semibold text-slate-500">
          English letters and numbers only. No spaces,
          hyphens, underscores or email symbols.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Full Name
        </label>

        <input
          value={fullName}
          disabled
          placeholder="Selected Employee Name"
          className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email
        </label>

        <input
          value={email}
          disabled
          type="email"
          placeholder="Selected Employee Email"
          className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          {isEditMode ? "New Password" : "Password"}{" "}
          {isEditMode ? (
            <span className="text-slate-400">
              (leave blank to keep old password)
            </span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </label>

        <div className="relative">
          <input
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage("");
            }}
            disabled={saving}
            required={!isEditMode}
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            placeholder={
              isEditMode
                ? "Optional new password"
                : "Enter password"
            }
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current
              )
            }
            disabled={saving}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={showPassword}
            title={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-2xl text-slate-500 transition hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff
                size={18}
                aria-hidden="true"
              />
            ) : (
              <Eye
                size={18}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <p className="mt-2 text-xs font-semibold text-slate-500">
          Password must be at least 8 characters.
          Recommended: use uppercase, lowercase, number
          and symbol.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          {isEditMode
            ? "Confirm New Password"
            : "Confirm Password"}{" "}
          {isEditMode ? (
            <span className="text-slate-400">
              (required when changing password)
            </span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </label>

        <div className="relative">
          <input
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(
                event.target.value
              );
              setErrorMessage("");
            }}
            disabled={saving}
            required={
              !isEditMode ||
              Boolean(password.trim())
            }
            maxLength={MAX_PASSWORD_LENGTH}
            placeholder={
              isEditMode
                ? "Confirm optional new password"
                : "Re-enter password"
            }
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (current) => !current
              )
            }
            disabled={saving}
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            aria-pressed={showConfirmPassword}
            title={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-2xl text-slate-500 transition hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showConfirmPassword ? (
              <EyeOff
                size={18}
                aria-hidden="true"
              />
            ) : (
              <Eye
                size={18}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <p className="mt-2 text-xs font-semibold text-slate-500">
          {isEditMode
            ? "Leave both password fields blank to keep the current password."
            : "Enter the same password again for confirmation."}
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
        <input
          checked={isSuperuser}
          onChange={(event) =>
            setIsSuperuser(event.target.checked)
          }
          disabled={saving}
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
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitDisabled}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : isEditMode
              ? "Update User"
              : "Create User"}
        </button>
      </div>
    </form>
  );
}