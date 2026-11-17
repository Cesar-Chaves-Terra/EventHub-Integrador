
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import EventForm, {
  type EventFormData,
} from "@/components/events/EventForm";

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
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.push("/");
      return;
    }

    setError("");

    try {
      const dashboardData = await apiRequest<DashboardData>(
        "/dashboard/",
        {},
        token
      );

      setData(dashboardData);

      try {
        const eventsData = await apiRequest<EventItem[]>(
          "/events/",
          {},
          token
        );

        setEvents(eventsData);
      } catch {
        setEvents([]);
      }
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

  function handleLogout() {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    router.push("/");
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleEditEvent(event: EventItem) {
    setSelectedEvent(event);
    setShowEventForm(true);
    setError("");
    setMessage("");
  }

  function handleCancelEdit() {
    setSelectedEvent(null);
    setShowEventForm(false);
  }

  async function handleUpdateEvent(formData: EventFormData) {
    const token = sessionStorage.getItem("access");

    if (!token || !selectedEvent) {
      router.push("/");
      return;
    }

    setSavingEvent(true);
    setError("");
    setMessage("");

    try {
      await apiRequest<EventItem>(
        `/events/${selectedEvent.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify(formData),
        },
        token
      );

      setMessage("Evento atualizado com sucesso!");
      setSelectedEvent(null);
      setShowEventForm(false);

      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o evento."
      );
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleDeleteEvent(eventId: number) {
    const confirmed = window.confirm(
      "Tem certeza de que deseja excluir este evento? Esta ação não poderá ser desfeita."
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.push("/");
      return;
    }

    setDeletingEventId(eventId);
    setError("");
    setMessage("");

    try {
      await apiRequest<void>(
        `/events/${eventId}/`,
        {
          method: "DELETE",
        },
        token
      );

      setMessage("Evento excluído com sucesso!");

      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
        setShowEventForm(false);
      }

      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o evento."
      );
    } finally {
      setDeletingEventId(null);
    }
  }

  if (loading) {
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

  const recentEvents = [...events]
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .slice(0, 3);

  return (
    <main className="flex min-h-screen bg-[#0B0A0F] text-[#F4EFF7]">
      {/* MENU LATERAL */}
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
            className="flex w-full items-center gap-3 rounded-xl border border-[#A8328D]/30 bg-[#A8328D]/15 px-4 py-3 text-left font-semibold text-white"
          >
            <span className="text-[#D66ABD]">⌂</span>
            Dashboard
          </button>

          <button
            onClick={() => router.push("/eventos")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>✦</span>
            Eventos
          </button>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-[#D66ABD]"
          >
            ↪ Sair da conta
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <section className="min-w-0 flex-1">
        {/* CABEÇALHO */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-6 md:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B99A55]">
              Área administrativa
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
              Dashboard
            </h2>
          </div>

          <div className="flex gap-2 md:hidden">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-[#A8328D]/20 px-4 py-2 text-sm text-white"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/eventos")}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300"
            >
              Eventos
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
          {/* BANNER DE BOAS-VINDAS */}
          <section className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#100D13] p-8 md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#A8328D]/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-[#B99A55]/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#B99A55]">
                EventHub Experience
              </p>

              <h3 className="text-3xl font-black leading-tight text-white md:text-5xl">
                Gerencie seus eventos.
                <span className="block text-[#D66ABD]">
                  Crie experiências.
                </span>
              </h3>

              <p className="mt-5 max-w-lg text-sm leading-7 text-gray-300 md:text-base">
                {data?.mensagem ||
                  "Bem-vindo ao EventHub! Gerencie seus eventos e acompanhe tudo em um só lugar."}
              </p>

              <button
                onClick={() => router.push("/eventos")}
                className="mt-8 rounded-xl bg-[#A8328D] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#A8328D]/20 transition hover:bg-[#C044A6]"
              >
                Gerenciar eventos →
              </button>
            </div>

            <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-1/3 items-end justify-center opacity-30 md:flex">
              <svg
                viewBox="0 0 300 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                <path
                  d="M130 25 H170 V65 L190 100 V290 H110 V100 L130 65 Z"
                  fill="#21182B"
                />
                <rect
                  x="132"
                  y="10"
                  width="36"
                  height="20"
                  rx="3"
                  fill="#21182B"
                />
                <path
                  d="M35 85 H95 L88 130 Q80 155 65 160 Q50 155 42 130 Z"
                  fill="#21182B"
                />
                <rect x="62" y="157" width="6" height="90" fill="#21182B" />
                <rect
                  x="42"
                  y="245"
                  width="46"
                  height="7"
                  rx="3"
                  fill="#21182B"
                />
                <path
                  d="M205 105 H265 L258 150 Q250 175 235 180 Q220 175 212 150 Z"
                  fill="#21182B"
                />
                <rect x="232" y="177" width="6" height="70" fill="#21182B" />
                <rect
                  x="212"
                  y="245"
                  width="46"
                  height="7"
                  rx="3"
                  fill="#21182B"
                />
              </svg>
            </div>
          </section>

          {/* MENSAGENS */}
          {message && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* INDICADORES */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
                Visão geral
              </p>

              <h3 className="mt-1 text-xl font-bold text-white">
                Resumo da plataforma
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Eventos cadastrados
                  </p>
                  <span className="text-xl text-[#D66ABD]">✦</span>
                </div>

                <p className="mt-5 text-4xl font-bold text-white">
                  {events.length}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Total de eventos
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Usuários</p>
                  <span className="text-xl text-[#B99A55]">♙</span>
                </div>

                <p className="mt-5 text-4xl font-bold text-[#B99A55]">
                  {data?.total_usuarios ?? 0}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Usuários cadastrados
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Avisos publicados
                  </p>
                  <span className="text-xl text-[#D66ABD]">▤</span>
                </div>

                <p className="mt-5 text-4xl font-bold text-white">
                  {data?.total_avisos ?? 0}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Total de avisos
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Avisos internos
                  </p>
                  <span className="text-xl text-[#B99A55]">◇</span>
                </div>

                <p className="mt-5 text-4xl font-bold text-[#D66ABD]">
                  {data?.avisos_internos ?? 0}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Comunicados internos
                </p>
              </div>
            </div>
          </section>

          {/* FORMULÁRIO DE EDIÇÃO */}
          {showEventForm && selectedEvent && (
            <EventForm
              initialData={selectedEvent}
              onSubmit={handleUpdateEvent}
              onCancel={handleCancelEdit}
              loading={savingEvent}
            />
          )}

          {/* EVENTOS RECENTES */}
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
                  Sua programação
                </p>

                <h3 className="mt-1 text-xl font-bold text-white">
                  Eventos recentes
                </h3>
              </div>

              <button
                onClick={() => router.push("/eventos")}
                className="text-sm font-semibold text-[#D66ABD] transition hover:text-white"
              >
                Ver todos os eventos →
              </button>
            </div>

            {recentEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#15121A] px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A8328D]/15 text-2xl text-[#D66ABD]">
                  ✦
                </div>

                <h4 className="mt-5 text-lg font-bold text-white">
                  Nenhum evento cadastrado
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                  Sua programação aparecerá aqui. Comece criando seu primeiro evento.
                </p>

                <button
                  onClick={() => router.push("/eventos")}
                  className="mt-6 rounded-xl bg-[#A8328D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C044A6]"
                >
                  + Criar evento
                </button>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-3">
                {recentEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#B99A55]">
                      Evento #{event.id}
                    </p>

                    <h4 className="mt-3 text-lg font-bold text-white">
                      {event.name}
                    </h4>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
                      {event.description}
                    </p>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="text-xs text-gray-500">
                        Data e horário
                      </p>

                      <p className="mt-1 text-sm text-gray-200">
                        {formatDate(event.date)}
                      </p>

                      <div className="mt-4 flex justify-between text-xs">
                        <span className="text-gray-400">
                          Vagas restantes
                        </span>

                        <span className="font-semibold text-[#D66ABD]">
                          {event.available_seats} / {event.capacity}
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#A8328D] to-[#B99A55]"
                          style={{
                            width: `${
                              event.capacity > 0
                                ? (event.available_seats / event.capacity) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* AÇÕES DO EVENTO */}
                    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={() => handleEditEvent(event)}
                        className="rounded-xl border border-[#B99A55]/30 px-4 py-2 text-sm font-semibold text-[#B99A55] transition hover:bg-[#B99A55]/10"
                      >
                        ✎ Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deletingEventId === event.id}
                        className="rounded-xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingEventId === event.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* AÇÕES RÁPIDAS */}
          <section className="rounded-2xl border border-white/10 bg-[#15121A] p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
              Acesso rápido
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              O que deseja fazer?
            </h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => router.push("/eventos")}
                className="rounded-xl border border-[#A8328D]/30 bg-[#A8328D]/10 p-5 text-left transition hover:border-[#A8328D] hover:bg-[#A8328D]/20"
              >
                <span className="text-2xl text-[#D66ABD]">✦</span>

                <p className="mt-3 font-bold text-white">
                  Gerenciar eventos
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Criar e administrar sua programação.
                </p>
              </button>

              <button
                onClick={loadDashboard}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#B99A55]/60 hover:bg-white/[0.06]"
              >
                <span className="text-2xl text-[#B99A55]">↻</span>

                <p className="mt-3 font-bold text-white">
                  Atualizar informações
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Consultar novamente os dados da plataforma.
                </p>
              </button>
            </div>
          </section>

          <footer className="border-t border-white/10 pt-6 text-center text-xs text-gray-600">
            EVENTHUB · Sua experiência começa aqui
          </footer>
        </div>
      </section>
    </main>
  );
}
