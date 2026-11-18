
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";

interface DashboardData {
  mensagem: string;
  total_usuarios: number;
  total_avisos: number;
  avisos_internos: number;
}

interface EventItem {
  id: number;
  name: string;
  description: string;
  date: string;
  capacity: number;
  available_seats: number;
  organizer: string;
}

type EventsResponse = EventItem[] | { results: EventItem[] };

export default function DashboardContent() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const [dashboardData, eventsData] = await Promise.all([
        apiRequest<DashboardData>(
          "/dashboard/",
          {},
          token
        ),
        apiRequest<EventsResponse>(
          "/events/",
          {},
          token
        ),
      ]);

      setData(dashboardData);

      setEvents(
        Array.isArray(eventsData)
          ? eventsData
          : eventsData.results
      );

      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadDashboard]);

  function formatDate(date: string): string {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const recentEvents = [...events]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 3);

  const stats = [
    {
      label: "Eventos cadastrados",
      value: events.length,
      icon: "✦",
    },
    {
      label: "Usuários",
      value: data?.total_usuarios ?? 0,
      icon: "♙",
    },
    {
      label: "Avisos publicados",
      value: data?.total_avisos ?? 0,
      icon: "▤",
    },
    {
      label: "Avisos internos",
      value: data?.avisos_internos ?? 0,
      icon: "◇",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        eyebrow="Área administrativa"
        title="Dashboard"
      />

      <div className="mx-auto max-w-7xl space-y-7 p-6 md:p-10">
        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-2xl border border-border-theme bg-gradient-to-br from-surface-elevated via-surface-card to-background p-7 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-soft">
              EventHub Experience
            </p>

            <h2 className="mt-3 text-2xl font-black leading-tight text-text-primary md:text-4xl">
              Gerencie seus eventos.

              <span className="block text-primary-soft">
                Crie experiências.
              </span>
            </h2>

            <p className="mt-3 text-sm leading-7 text-text-secondary">
              {data?.mensagem || "Bem-vindo ao EventHub!"}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/eventos")
              }
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
            >
              Gerenciar eventos →
            </button>
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
          >
            {error}
          </div>
        )}

        {/* Recent events */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-soft">
                Sua programação
              </p>

              <h2 className="mt-2 text-2xl font-bold text-text-primary">
                Eventos recentes
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/eventos")
              }
              className="text-sm font-semibold text-primary-soft transition hover:opacity-75"
            >
              Ver todos →
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border-theme bg-surface-card p-10 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-border-theme border-t-primary" />

              <p className="mt-4 text-sm text-text-muted">
                Carregando eventos...
              </p>
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-theme bg-surface-card px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-text-primary">
                Nenhum evento cadastrado
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                Comece criando seu primeiro evento.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/eventos")
                }
                className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
              >
                + Criar evento
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {recentEvents.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-xl border border-border-theme bg-surface-card transition hover:border-primary/50"
                >
                  <div className="h-1 bg-gradient-to-r from-[#64118C] to-[#B900F5]" />

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary-soft">
                      Evento #{event.id}
                    </p>

                    <h3 className="mt-3 text-lg font-bold text-text-primary">
                      {event.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                      {event.description}
                    </p>

                    <div className="mt-4 border-t border-border-theme pt-4">
                      <p className="text-xs text-text-muted">
                        Data e horário
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
                        {formatDate(event.date)}
                      </p>

                      <p className="mt-4 text-xs text-text-muted">
                        Vagas restantes:{" "}
                        <span className="font-semibold text-primary-soft">
                          {event.available_seats} /{" "}
                          {event.capacity}
                        </span>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Compact overview */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-soft">
              Visão geral
            </p>

            <h2 className="mt-2 text-2xl font-bold text-text-primary">
              Resumo da plataforma
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-h-28 flex-col justify-between rounded-xl border border-border-theme bg-surface-card p-4 transition hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-text-muted">
                    {stat.label}
                  </p>

                  <span className="text-lg text-primary-soft">
                    {stat.icon}
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {loading
                    ? "..."
                    : stat.value.toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border-theme pt-6 text-center text-xs tracking-wider text-text-muted">
          EVENTHUB · THE EXPERIENCE STARTS HERE
        </footer>
      </div>
    </div>
  );
}
