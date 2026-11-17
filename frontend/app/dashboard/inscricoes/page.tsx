
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface EventItem {
  id: number;
  name: string;
}

interface Participant {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
}

interface RegistrationItem {
  id: number;
  event: number;
  participant: number;
  participant_details: Participant;
  registration_date: string;
  status: "ACTIVE" | "CANCELLED";
}

function normalizeList<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function RegistrationsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadRegistrations = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      setError("");

      const [eventsData, registrationsData] = await Promise.all([
        apiRequest<EventItem[] | { results: EventItem[] }>(
          "/events/",
          {},
          token
        ),
        apiRequest<RegistrationItem[] | { results: RegistrationItem[] }>(
          "/registrations/",
          {},
          token
        ),
      ]);

      setEvents(normalizeList(eventsData));
      setRegistrations(normalizeList(registrationsData));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as inscrições."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  async function handleCancelRegistration(registrationId: number) {
    const confirmed = window.confirm(
      "Deseja realmente cancelar esta inscrição?"
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setUpdatingId(registrationId);
    setError("");
    setMessage("");

    try {
      await apiRequest<RegistrationItem>(
        `/registrations/${registrationId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "CANCELLED",
          }),
        },
        token
      );

      setMessage("Inscrição cancelada com sucesso!");
      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cancelar a inscrição."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function getEventName(eventId: number) {
    return events.find((event) => event.id === eventId)?.name ?? "Evento não encontrado";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filteredRegistrations = registrations.filter((registration) => {
    const participant = registration.participant_details;
    const searchValue = search.toLowerCase();

    const matchesSearch =
      participant?.name?.toLowerCase().includes(searchValue) ||
      participant?.email?.toLowerCase().includes(searchValue);

    const matchesEvent =
      selectedEvent === "all" ||
      registration.event.toString() === selectedEvent;

    return matchesSearch && matchesEvent;
  });

  const activeCount = registrations.filter(
    (registration) => registration.status === "ACTIVE"
  ).length;

  const cancelledCount = registrations.filter(
    (registration) => registration.status === "CANCELLED"
  ).length;

  return (
    <>
      <header className="border-b border-white/10 px-6 py-6 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B99A55]">
          Gerenciamento
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          Inscrições
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Consulte os participantes e gerencie as inscrições dos seus eventos.
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

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total de inscrições",
              value: registrations.length,
              color: "text-white",
            },
            {
              label: "Inscrições ativas",
              value: activeCount,
              color: "text-[#D66ABD]",
            },
            {
              label: "Inscrições canceladas",
              value: cancelledCount,
              color: "text-[#B99A55]",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#15121A] p-6"
            >
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className={`mt-4 text-4xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#15121A] p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
              Consulta
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Buscar inscrições
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-sm text-white outline-none focus:border-[#A8328D]"
            />

            <select
              value={selectedEvent}
              onChange={(event) => setSelectedEvent(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-sm text-white outline-none focus:border-[#A8328D]"
            >
              <option value="all">Todos os eventos</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B99A55]">
              Participantes
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Inscrições cadastradas
            </h2>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Carregando inscrições...
            </p>
          ) : filteredRegistrations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#15121A] px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-white">
                Nenhuma inscrição encontrada
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Tente alterar os filtros de pesquisa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#15121A]">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-5 py-4">Participante</th>
                    <th className="px-5 py-4">Contato</th>
                    <th className="px-5 py-4">Evento</th>
                    <th className="px-5 py-4">Data</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-5 py-4 font-semibold text-white">
                        {registration.participant_details?.name ?? "Participante"}
                      </td>

                      <td className="px-5 py-4 text-gray-400">
                        <p>{registration.participant_details?.email ?? "—"}</p>
                        <p className="mt-1 text-xs">
                          {registration.participant_details?.phone_number ?? "Sem telefone"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {getEventName(registration.event)}
                      </td>

                      <td className="px-5 py-4 text-gray-400">
                        {formatDate(registration.registration_date)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            registration.status === "ACTIVE"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {registration.status === "ACTIVE"
                            ? "Ativa"
                            : "Cancelada"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {registration.status === "ACTIVE" ? (
                          <button
                            onClick={() =>
                              handleCancelRegistration(registration.id)
                            }
                            disabled={updatingId === registration.id}
                            className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {updatingId === registration.id
                              ? "Cancelando..."
                              : "Cancelar"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Sem ações
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
