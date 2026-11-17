
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
      <main className="flex min-h-screen items-center justify-center bg-[#0C0612] text-[#F7ECFC]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#B900F5]" />

          <p className="text-sm text-[#AD99B8]">
            Preparando sua experiência...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#0C0612] text-[#F7ECFC]">
      <Sidebar onLogout={handleLogout} />

      <section className="min-w-0 flex-1">
        {children}
      </section>
    </main>
  );
}
