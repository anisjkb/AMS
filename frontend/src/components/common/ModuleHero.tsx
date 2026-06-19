import type { LucideIcon } from "lucide-react";

type ModuleHeroHeight = "x-small" |"small" |"compact" | "default" | "large";

const heightStyleMap: Record<ModuleHeroHeight, string> = {
  "x-small": "px-4 py-2 md:px-5 md:py-3",
  small: "px-6 py-4 md:px-7 md:py-5",
  compact: "px-7 py-5 md:px-8 md:py-6",
  default: "px-8 py-6 md:px-9 md:py-7",
  large: "px-8 py-8 md:px-10 md:py-9",
};

const iconStyleMap: Record<ModuleHeroHeight, string> = {
  "x-small": "h-8 w-8 md:h-10 md:w-10",
  small: "h-10 w-10 md:h-12 md:w-12",
  compact: "h-12 w-12 md:h-14 md:w-14",
  default: "h-14 w-14 md:h-16 md:w-16",
  large: "h-16 w-16 md:h-18 md:w-18",
};

const iconSizeMap: Record<ModuleHeroHeight, number> = {
  "x-small": 18,
  small: 22,
  compact: 26,
  default: 30,
  large: 34,
};

export default function ModuleHero({
  icon: Icon,
  title,
  description,
  height = "default",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  height?: ModuleHeroHeight;
}) {
  return (
    <section
      className={`rounded-3xl bg-linear-to-r from-blue-700 via-cyan-600 to-slate-900 text-white shadow-xl ${heightStyleMap[height]}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-white/15 ${iconStyleMap[height]}`}
        >
          <Icon size={iconSizeMap[height]} />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">
            {title}
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}