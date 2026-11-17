
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setAuthenticated(true);
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    router.push("/");
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0A0F] text-[#F4EFF7]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#D66ABD]" />
          <p className="text-sm text-gray-400">
            Preparando sua experiência...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#0B0A0F] text-[#F4EFF7]">
      <Sidebar onLogout={handleLogout} />

      <section className="min-w-0 flex-1">
        {children}
      </section>
    </main>
  );
}
