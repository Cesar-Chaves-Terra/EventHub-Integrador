
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Eventos",
      href: "/dashboard/eventos",
      icon: "✦",
    },
    {
      label: "Inscrições",
      href: "/dashboard/inscricoes",
      icon: "♙",
    },
  ];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#B900F5]/15 bg-[#100819] p-6 md:flex">
      <div className="mb-12">
        <h1 className="text-2xl font-black tracking-[0.2em] text-white">
          EVENT
          <span className="text-[#D338FF]">
            HUB
          </span>
        </h1>

        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#E27BFF]">
          Experience more
        </p>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8F7A9B]">
        Menu principal
      </p>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                isActive
                  ? "border border-[#B900F5]/40 bg-[#B900F5]/15 font-semibold text-white shadow-sm shadow-[#B900F5]/10"
                  : "text-[#AD99B8] hover:bg-[#B900F5]/10 hover:text-white"
              }`}
            >
              <span className="w-6 text-center text-lg text-[#E27BFF]">
                {item.icon}
              </span>

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#B900F5]/15 pt-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl px-4 py-3 text-left text-[#AD99B8] transition hover:bg-[#B900F5]/10 hover:text-[#E27BFF]"
        >
          ↪ Sair da conta
        </button>
      </div>
    </aside>
  );
}
