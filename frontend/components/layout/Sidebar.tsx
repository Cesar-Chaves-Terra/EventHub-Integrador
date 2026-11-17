
"use client";

import { useRouter } from "next/navigation";

interface SidebarProps {
  activePage: "dashboard" | "eventos";
  onLogout: () => void;
}

export default function Sidebar({
  activePage,
  onLogout,
}: SidebarProps) {
  const router = useRouter();

  const baseClass =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition";

  const inactiveClass =
    "text-gray-400 hover:bg-white/5 hover:text-white";

  const activeClass =
    "border border-[#A8328D]/30 bg-[#A8328D]/15 font-semibold text-white";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#100D15] p-6 md:flex">
      <div className="mb-12">
        <h1 className="text-2xl font-black tracking-[0.2em] text-white">
          EVENT<span className="text-[#A8328D]">HUB</span>
        </h1>

        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#B99A55]">
          Experience more
        </p>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
        Menu principal
      </p>

      <nav className="space-y-2">
        <button
          onClick={() => router.push("/dashboard")}
          className={`${baseClass} ${
            activePage === "dashboard" ? activeClass : inactiveClass
          }`}
        >
          <span>⌂</span>
          Dashboard
        </button>

        <button
          onClick={() => router.push("/eventos")}
          className={`${baseClass} ${
            activePage === "eventos" ? activeClass : inactiveClass
          }`}
        >
          <span className="text-[#D66ABD]">✦</span>
          Eventos
        </button>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-6">
        <button
          onClick={onLogout}
          className="w-full rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-[#D66ABD]"
        >
          ↪ Sair da conta
        </button>
      </div>
    </aside>
  );
}
