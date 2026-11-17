
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

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

export default function DashboardPage() {
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

      const dashboardData = await apiRequest<DashboardData>(
        "/dashboard/",
        {},
        token
      );

      setData(dashboardData);

      const eventsData = await apiRequest<EventItem[]>(
        "/events/",
        {},
        token
      );

      setEvents(eventsData);
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
    loadDashboard();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-400">
          Carregando dashboard...
        </p>
      </div>
    );
  }

  const recentEvents = [...events]
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .slice(0, 3);

  return (
    <>
      <header className="border-b border-white/10 px-6 py-6 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B99A55]">
          Área administrativa
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          Dashboard
        </h1>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
        <section className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#100D13] p-8 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#A8328D]/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#B99A55]">
              EventHub Experience
            </p>

            <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
              Gerencie seus eventos.
              <span className="block text-[#D66ABD]">
                Crie experiências.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-gray-300">
              {data?.mensagem ||
                "Bem-vindo ao EventHub! Gerencie seus eventos e acompanhe tudo em um só lugar."}
            </p>

            <button
              onClick={() => router.push("/dashboard/eventos")}
              className="mt-8 rounded-xl bg-[#A8328D] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#C044A6]"
            >
              Gerenciar eventos →
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
              Visão geral
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Resumo da plataforma
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Eventos cadastrados",
                value: events.length,
                color: "text-[#D66ABD]",
                icon: "✦",
              },
              {
                label: "Usuários",
                value: data?.total_usuarios ?? 0,
                color: "text-[#B99A55]",
                icon: "♙",
              },
              {
                label: "Avisos publicados",
                value: data?.total_avisos ?? 0,
                color: "text-white",
                icon: "▤",
              },
              {
                label: "Avisos internos",
                value: data?.avisos_internos ?? 0,
                color: "text-[#D66ABD]",
                icon: "◇",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#15121A] p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <span className={item.color}>{item.icon}</span>
                </div>
                <p className={`mt-5 text-4xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
                Sua programação
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Eventos recentes
              </h2>
            </div>

            <button
              onClick={() => router.push("/dashboard/eventos")}
              className="text-sm font-semibold text-[#D66ABD] hover:text-white"
            >
              Ver todos →
            </button>
          </div>

          {recentEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#15121A] px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-white">
                Nenhum evento cadastrado
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Comece criando seu primeiro evento.
              </p>
              <button
                onClick={() => router.push("/dashboard/eventos")}
                className="mt-6 rounded-xl bg-[#A8328D] px-6 py-3 text-sm font-bold text-white hover:bg-[#C044A6]"
              >
                + Criar evento
              </button>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {recentEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-[#15121A] p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#B99A55]">
                    Evento #{event.id}
                  </p>

                  <h3 className="mt-3 text-lg font-bold text-white">
                    {event.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                    {event.description}
                  </p>

                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-xs text-gray-500">
                      Data e horário
                    </p>
                    <p className="mt-1 text-sm text-gray-200">
                      {formatDate(event.date)}
                    </p>

                    <p className="mt-4 text-xs text-gray-400">
                      Vagas restantes:{" "}
                      <span className="font-semibold text-[#D66ABD]">
                        {event.available_seats} / {event.capacity}
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 pt-6 text-center text-xs text-gray-600">
          EVENTHUB · Sua experiência começa aqui
        </footer>
      </div>
    </>
  );
}
