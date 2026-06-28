"use client";

export default function CrudTextField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  step,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "date" | "number";
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        step={step}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 ${inputClassName}`}
      />
    </label>
  );
}
