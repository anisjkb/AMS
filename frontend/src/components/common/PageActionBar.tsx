"use client";

import { getIcon } from "@/components/layout/IconMapper";
import { useNavigation } from "@/contexts/NavigationContext";

const topActionKeys = ["create", "export", "import"];

const buttonStyleMap: Record<string, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20",
};

export default function PageActionBar({
  menuKey,
  onCreate,
  onExport,
  onImport,
}: {
  menuKey: string;
  onCreate?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}) {
  const { getActionsByMenuKey } = useNavigation();

  const actions = getActionsByMenuKey(menuKey).filter((action) =>
    topActionKeys.includes(action.action_key)
  );

  if (actions.length === 0) return null;

  const handleClick = (actionKey: string) => {
    if (actionKey === "create") {
      onCreate?.();
      return;
    }

    if (actionKey === "export") {
      onExport?.();
      return;
    }

    if (actionKey === "import") {
      onImport?.();
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => {
          const Icon = getIcon(action.button_icon);
          const color = action.button_color ?? "secondary";

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleClick(action.action_key)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition ${
                buttonStyleMap[color] ?? buttonStyleMap.secondary
              }`}
            >
              <Icon size={18} />
              {action.action_title}
            </button>
          );
        })}
      </div>
    </section>
  );
}