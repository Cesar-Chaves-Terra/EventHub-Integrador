
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
      setError("");

      const [dashboardData, eventsData] = await Promise.all([
        apiRequest<DashboardData>("/dashboard/", {}, token),
        apiRequest<EventsResponse>("/events/", {}, token),
      ]);

      setData(dashboardData);
      setEvents(
        Array.isArray(eventsData) ? eventsData : eventsData.results
      );
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
    void loadDashboard();
  }, [loadDashboard]);

  function formatDate(date: string) {
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
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
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
    <div className="min-h-screen bg-[#0C0612] text-[#F7ECFC]">
      <PageHeader
        eyebrow="Área administrativa"
        title="Dashboard"
      />

      <div className="mx-auto max-w-7xl space-y-7 p-6 md:p-10">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Recent events */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#E27BFF]">
                Sua programação
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                Eventos recentes
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard/eventos")}
              className="text-sm font-semibold text-[#E27BFF] transition hover:text-white"
            >
              Ver todos →
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#B900F5]" />

              <p className="mt-4 text-sm text-[#AD99B8]">
                Carregando eventos...
              </p>
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#B900F5]/25 bg-[#1A0C24] px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-white">
                Nenhum evento cadastrado
              </h3>

              <p className="mt-2 text-sm text-[#AD99B8]">
                Comece criando seu primeiro evento.
              </p>

              <button
                type="button"
                onClick={() => router.push("/dashboard/eventos")}
                className="mt-6 rounded-xl bg-[#B900F5] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#D338FF]"
              >
                + Criar evento
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {recentEvents.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-xl border border-[#B900F5]/20 bg-[#1A0C24] transition hover:border-[#B900F5]/50"
                >
                  <div className="h-1 bg-gradient-to-r from-[#64118C] to-[#B900F5]" />

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#E27BFF]">
                      Evento #{event.id}
                    </p>

                    <h3 className="mt-3 text-lg font-bold text-white">
                      {event.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-[#AD99B8]">
                      {event.description}
                    </p>

                    <div className="mt-4 border-t border-[#B900F5]/15 pt-4">
                      <p className="text-xs text-[#8F7A9B]">
                        Data e horário
                      </p>

                      <p className="mt-1 text-sm text-[#D7C4E0]">
                        {formatDate(event.date)}
                      </p>

                      <p className="mt-4 text-xs text-[#AD99B8]">
                        Vagas restantes:{" "}
                        <span className="font-semibold text-[#E27BFF]">
                          {event.available_seats} / {event.capacity}
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
            <p className="text-xs font-bold uppercase tracking-widest text-[#E27BFF]">
              Visão geral
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Resumo da plataforma
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex min-h-28 flex-col justify-between rounded-xl border border-[#B900F5]/20 bg-[#1A0C24] p-4 transition hover:border-[#B900F5]/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-[#AD99B8]">
                    {item.label}
                  </p>

                  <span className="text-lg text-[#E27BFF]">
                    {item.icon}
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-white">
                  {loading
                    ? "..."
                    : item.value.toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-2xl border border-[#B900F5]/25 bg-gradient-to-br from-[#30133E] via-[#1A0C24] to-[#0C0612] p-8 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#B900F5]/20 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#E27BFF]">
              EventHub Experience
            </p>

            <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
              Gerencie seus eventos.
              <span className="block text-[#D338FF]">
                Crie experiências.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#CBB5D5]">
              {data?.mensagem ||
                "Bem-vindo ao EventHub! Gerencie seus eventos e acompanhe tudo em um só lugar."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard/eventos")}
              className="mt-8 rounded-xl bg-[#B900F5] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#B900F5]/20 transition hover:bg-[#D338FF]"
            >
              Gerenciar eventos →
            </button>
          </div>
        </section>

        <footer className="border-t border-[#B900F5]/15 pt-6 text-center text-xs tracking-wider text-[#796A83]">
          EVENTHUB · THE EXPERIENCE STARTS HERE
        </footer>
      </div>
    </div>
  );
}
