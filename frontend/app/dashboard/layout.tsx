
"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { validateSession } from "@/lib/api";

interface DashboardLayoutProps {
  children: ReactNode;
}

type Theme = "dark" | "light";

function getSavedTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = localStorage.getItem("eventhub-theme");

  return savedTheme === "light" ? "light" : "dark";
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      try {
        const valid = await validateSession();

        if (!mounted) {
          return;
        }

        if (!valid) {
          sessionStorage.removeItem("access");
          sessionStorage.removeItem("refresh");

          router.replace("/");
          return;
        }

        setAuthenticated(true);
      } catch {
        if (!mounted) {
          return;
        }

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");

        router.replace("/");
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [router]);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("eventhub-theme", nextTheme);
  }

  function handleLogout() {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");

    setAuthenticated(false);

    router.replace("/");
  }

  if (checkingSession || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border-theme border-t-primary" />

          <p className="text-sm text-text-muted">
            Preparando sua experiência...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <Sidebar onLogout={handleLogout} />

      <section className="min-w-0 flex-1">
        <div className="flex items-center justify-end border-b border-border-theme bg-surface px-6 py-3 md:px-10">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Ativar modo claro"
                : "Ativar modo escuro"
            }
            aria-pressed={theme === "light"}
            className="flex items-center gap-2 rounded-xl border border-border-theme bg-surface-elevated px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-primary"
          >
            <span aria-hidden="true">
              {theme === "dark" ? "☀" : "☾"}
            </span>

            {theme === "dark"
              ? "Modo claro"
              : "Modo escuro"}
          </button>
        </div>

        {children}
      </section>
    </main>
  );
}
