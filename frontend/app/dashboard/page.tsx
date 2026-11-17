
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface EventItem {
  id: number;
  name: string;
  description: string;
  date: string;
  capacity: number;
  available_seats: number;
  organizer: string;
}

export default function EventosPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadEvents = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const result = await apiRequest<EventItem[]>(
        "/events/",
        {},
        token
      );

      setEvents(result);
    } catch {
      setError("Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.push("/");
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest<EventItem>(
        "/events/",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            description,
            date: new Date(date).toISOString(),
            capacity: Number(capacity),
          }),
        },
        token
      );

      setName("");
      setDescription("");
      setDate("");
      setCapacity("");
      setMessage("Evento cadastrado com sucesso!");
      setShowForm(false);

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar o evento."
      );
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    router.push("/");
  }

  const totalCapacity = events.reduce(
    (total, event) => total + event.capacity,
    0
  );

  const availableSeats = events.reduce(
    (total, event) => total + event.available_seats,
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0A0F] text-[#F4EFF7]">
        Carregando eventos...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#0B0A0F] text-[#F4EFF7]">

      {/* MENU LATERAL */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#100D15] p-6 md:flex md:flex-col">
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
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl border border-[#A8328D]/30 bg-[#A8328D]/15 px-4 py-3 text-left font-semibold text-white">
            <span className="text-[#D66ABD]">✦</span>
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
              Gerenciamento
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
              Seus eventos
            </h2>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-gray-300 transition hover:border-[#B99A55] hover:text-white"
          >
            Voltar ao dashboard
          </button>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">

          {/* BANNER PRINCIPAL */}
          <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#100D13] p-7 md:p-10">

            {/* SILHUETAS DE GARRAFA E TAÇAS */}
            <svg
              viewBox="0 0 500 340"
              preserveAspectRatio="xMidYMid meet"
              className="pointer-events-none absolute -right-8 bottom-0 z-[-1] h-full w-[65%] opacity-80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="shadowGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#21182B" />
                  <stop offset="100%" stopColor="#17131D" />
                </linearGradient>
              </defs>

              {/* Garrafa */}
              <g fill="url(#shadowGradient)">
                <path d="M320 25 H355 V65 L368 91 L382 119 V330 H293 V119 L307 91 L320 65 Z" />
                <rect x="322" y="9" width="31" height="20" rx="3" />
                <path d="M322 9 L353 9 L349 0 H326 Z" />
              </g>

              {/* Rótulo da garrafa */}
              <rect
                x="305"
                y="170"
                width="65"
                height="85"
                rx="4"
                fill="#21182B"
                opacity="0.7"
              />

              {/* Taça esquerda */}
              <g fill="#17131D">
                <path d="M65 75 H155 L145 140 Q133 172 110 180 Q87 172 75 140 Z" />
                <rect x="106" y="177" width="8" height="105" />
                <rect x="78" y="280" width="64" height="8" rx="4" />
              </g>

              {/* Taça direita */}
              <g fill="#17131D">
                <path d="M175 95 H265 L255 160 Q243 192 220 200 Q197 192 185 160 Z" />
                <rect x="216" y="197" width="8" height="85" />
                <rect x="188" y="280" width="64" height="8" rx="4" />
              </g>

              {/* Sombra inferior */}
              <ellipse
                cx="250"
                cy="325"
                rx="230"
                ry="12"
                fill="#17131D"
                opacity="0.7"
              />
            </svg>

            {/* SOMBRA PARA INTEGRAR A DECORAÇÃO */}
            <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-r from-[#100D13] via-[#100D13]/90 to-transparent" />

            {/* TEXTOS DO BANNER */}
            <div className="relative z-10 max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#B99A55]">
                EventHub Experience
              </p>

              <h3 className="text-3xl font-black leading-tight text-white md:text-4xl">
                Crie experiências
                <span className="block text-[#D66ABD]">
                  inesquecíveis.
                </span>
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-6 text-gray-300">
                Organize seus eventos, acompanhe a capacidade e
                gerencie suas vagas em um só lugar.
              </p>

              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setMessage("");
                  setError("");
                }}
                className="mt-7 rounded-xl bg-[#A8328D] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#A8328D]/20 transition hover:bg-[#C044A6]"
              >
                + Criar novo evento
              </button>
            </div>
          </div>

          {/* INDICADORES */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-[#15121A] p-6">
              <p className="text-sm text-gray-400">Total de eventos</p>
              <p className="mt-3 text-3xl font-bold text-white">
                {events.length}
              </p>
              <p className="mt-2 text-xs text-[#D66ABD]">
                Eventos cadastrados
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#15121A] p-6">
              <p className="text-sm text-gray-400">Capacidade total</p>
              <p className="mt-3 text-3xl font-bold text-[#B99A55]">
                {totalCapacity}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Lugares disponíveis no total
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#15121A] p-6">
              <p className="text-sm text-gray-400">Vagas restantes</p>
              <p className="mt-3 text-3xl font-bold text-[#D66ABD]">
                {availableSeats}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Disponibilidade dos eventos
              </p>
            </div>

          </div>

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

          {/* FORMULÁRIO */}
          {showForm && (
            <section className="rounded-2xl border border-[#A8328D]/30 bg-[#15121A] p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
                    Novo cadastro
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    Criar evento
                  </h3>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 transition hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Nome do evento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Festa de inauguração"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Descrição
                  </label>
                  <textarea
                    placeholder="Descreva seu evento..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D]"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Data e horário
                    </label>
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-white outline-none focus:border-[#A8328D]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Capacidade de participantes
                    </label>
                    <input
                      type="number"
                      placeholder="Ex.: 100"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      min="1"
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#A8328D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C044A6]"
                  >
                    Cadastrar evento
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-white/15 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* LISTAGEM */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
                  Sua programação
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Eventos cadastrados
                </h3>
              </div>

              <span className="rounded-full border border-white/10 bg-[#15121A] px-4 py-2 text-xs text-gray-400">
                {events.length} evento(s)
              </span>
            </div>

            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#15121A] px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A8328D]/15 text-3xl text-[#D66ABD]">
                  ✦
                </div>

                <h4 className="mt-5 text-lg font-bold text-white">
                  Nenhum evento por enquanto
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                  Seus eventos aparecerão aqui. Comece criando
                  seu primeiro evento no EventHub.
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 rounded-xl border border-[#A8328D]/50 px-5 py-3 text-sm font-semibold text-[#D66ABD] transition hover:bg-[#A8328D]/15"
                >
                  + Criar primeiro evento
                </button>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/50"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#B99A55]">
                          Evento #{event.id}
                        </p>
                        <h4 className="mt-2 text-xl font-bold text-white">
                          {event.name}
                        </h4>
                      </div>

                      <span className="rounded-full bg-[#A8328D]/15 px-3 py-1 text-xs font-semibold text-[#D66ABD]">
                        Cadastrado
                      </span>
                    </div>

                    <p className="mb-5 text-sm leading-6 text-gray-400">
                      {event.description}
                    </p>

                    <div className="space-y-3 border-t border-white/10 pt-5 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Data e horário</span>
                        <span className="text-right text-gray-200">
                          {new Date(event.date).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Organizador</span>
                        <span className="text-gray-200">
                          {event.organizer}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Capacidade</span>
                        <span className="text-gray-200">
                          {event.capacity} pessoas
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-gray-400">
                          Vagas disponíveis
                        </span>
                        <span className="font-semibold text-[#B99A55]">
                          {event.available_seats} / {event.capacity}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
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
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="border-t border-white/10 pt-6 text-center text-xs text-gray-600">
            EVENTHUB · Gerenciamento de eventos
          </footer>

        </div>
      </section>
    </main>
  );
}
