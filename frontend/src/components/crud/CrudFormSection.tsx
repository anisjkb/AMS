"use client";

import type { ReactNode } from "react";

export default function CrudFormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
        {title}
      </h3>

      {children}
    </section>
  );
}
