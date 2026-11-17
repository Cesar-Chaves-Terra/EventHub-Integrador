
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}

export default function PageHeader({
  eyebrow,
  title,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-6 md:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B99A55]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          {title}
        </h2>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
