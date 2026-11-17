
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
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

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("50");

  const loadEvents = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      setError("");

      const response = await apiRequest<
        EventItem[] | { results: EventItem[] }
      >("/events/", {}, token);

      setEvents(
        Array.isArray(response) ? response : response.results
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os eventos."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setSaving(true);
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

      setMessage("Evento cadastrado com sucesso!");
      setName("");
      setDescription("");
      setDate("");
      setCapacity("50");

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar o evento."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <header className="border-b border-white/10 px-6 py-6 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B99A55]">
          Gerenciamento
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          Eventos
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Cadastre e acompanhe os eventos da plataforma.
        </p>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
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

        <section className="rounded-2xl border border-white/10 bg-[#15121A] p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
              Novo cadastro
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Criar evento
            </h2>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Nome do evento
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-white outline-none transition focus:border-[#A8328D]"
                placeholder="Digite o nome do evento"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={4}
                className="w-full resize-y rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-white outline-none transition focus:border-[#A8328D]"
                placeholder="Descreva o evento"
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
                  onChange={(event) => setDate(event.target.value)}
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
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  min="1"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-white outline-none focus:border-[#A8328D]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#A8328D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C044A6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Cadastrando..." : "+ Cadastrar evento"}
            </button>
          </form>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
                Programação
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Eventos cadastrados
              </h2>
            </div>

            <span className="rounded-lg border border-white/10 bg-[#15121A] px-3 py-2 text-sm text-gray-300">
              {events.length} eventos
            </span>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Carregando eventos...
            </p>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#15121A] px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-white">
                Nenhum evento cadastrado
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Utilize o formulário acima para criar seu primeiro evento.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#B99A55]">
                    Evento #{event.id}
                  </p>

                  <h3 className="mt-3 text-lg font-bold text-white">
                    {event.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
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
                        Vagas disponíveis
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

                    <p className="mt-4 text-xs text-gray-500">
                      Organizador: {event.organizer}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
