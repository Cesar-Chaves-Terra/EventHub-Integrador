
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";

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

type ListResponse<T> = T[] | { results: T[] };

function normalizeList<T>(data: ListResponse<T>): T[] {
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
      const [eventsData, registrationsData] = await Promise.all([
        apiRequest<ListResponse<EventItem>>(
          "/events/",
          {},
          token
        ),
        apiRequest<ListResponse<RegistrationItem>>(
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
    void loadRegistrations();
  }, [loadRegistrations]);

  async function handleCancelRegistration(
    registrationId: number
  ): Promise<void> {
    const confirmed = window.confirm(
      "Deseja realmente cancelar esta inscrição?"
    );

    if (!confirmed) {
      return;
    }

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
    return (
      events.find((event) => event.id === eventId)?.name ??
      "Evento não encontrado"
    );
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

  const filteredRegistrations = registrations.filter(
    (registration) => {
      const participant = registration.participant_details;
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        participant?.name?.toLowerCase().includes(searchValue) ||
        participant?.email?.toLowerCase().includes(searchValue);

      const matchesEvent =
        selectedEvent === "all" ||
        registration.event.toString() === selectedEvent;

      return matchesSearch && matchesEvent;
    }
  );

  const activeCount = registrations.filter(
    (registration) => registration.status === "ACTIVE"
  ).length;

  const cancelledCount = registrations.filter(
    (registration) => registration.status === "CANCELLED"
  ).length;

  const stats = [
    {
      label: "Total de inscrições",
      value: registrations.length,
      icon: "▤",
    },
    {
      label: "Inscrições ativas",
      value: activeCount,
      icon: "✦",
    },
    {
      label: "Inscrições canceladas",
      value: cancelledCount,
      icon: "◇",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0612] text-[#F7ECFC]">
      <PageHeader
        eyebrow="Gerenciamento"
        title="Inscrições"
      />

      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
        <p className="text-sm text-[#AD99B8]">
          Consulte os participantes e gerencie as inscrições
          dos seus eventos.
        </p>

        {message && (
          <div className="rounded-xl border border-[#B900F5]/30 bg-[#B900F5]/10 p-4 text-sm text-[#E27BFF]">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24] p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#AD99B8]">
                  {item.label}
                </p>

                <span className="text-xl text-[#E27BFF]">
                  {item.icon}
                </span>
              </div>

              <p className="mt-4 text-4xl font-bold text-white">
                {loading
                  ? "..."
                  : item.value.toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24] p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E27BFF]">
              Consulta
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Buscar inscrições
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-xl border border-[#B900F5]/20 bg-[#0C0612] px-4 py-3 text-sm text-white outline-none placeholder:text-[#796A83] focus:border-[#B900F5]"
            />

            <select
              value={selectedEvent}
              onChange={(event) =>
                setSelectedEvent(event.target.value)
              }
              className="w-full rounded-xl border border-[#B900F5]/20 bg-[#0C0612] px-4 py-3 text-sm text-white outline-none focus:border-[#B900F5]"
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
            <p className="text-xs font-bold uppercase tracking-widest text-[#E27BFF]">
              Participantes
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Inscrições cadastradas
            </h2>

            <p className="mt-2 text-sm text-[#AD99B8]">
              {filteredRegistrations.length} inscrições encontradas
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#B900F5]" />

              <p className="mt-4 text-sm text-[#AD99B8]">
                Carregando inscrições...
              </p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#B900F5]/25 bg-[#1A0C24] px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-white">
                Nenhuma inscrição encontrada
              </h3>

              <p className="mt-2 text-sm text-[#AD99B8]">
                Tente alterar os filtros de pesquisa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24]">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-[#B900F5]/20 bg-[#30133E] text-xs uppercase tracking-wider text-[#D7C4E0]">
                  <tr>
                    <th className="px-5 py-4">Participante</th>
                    <th className="px-5 py-4">Contato</th>
                    <th className="px-5 py-4">Evento</th>
                    <th className="px-5 py-4">Data</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#B900F5]/10">
                  {filteredRegistrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="transition hover:bg-[#B900F5]/5"
                    >
                      <td className="px-5 py-4 font-semibold text-white">
                        {registration.participant_details?.name ??
                          "Participante"}
                      </td>

                      <td className="px-5 py-4 text-[#AD99B8]">
                        <p>
                          {registration.participant_details?.email ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs">
                          {registration.participant_details
                            ?.phone_number ?? "Sem telefone"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-[#D7C4E0]">
                        {getEventName(registration.event)}
                      </td>

                      <td className="px-5 py-4 text-[#AD99B8]">
                        {formatDate(registration.registration_date)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            registration.status === "ACTIVE"
                              ? "bg-[#B900F5]/15 text-[#E27BFF]"
                              : "bg-white/5 text-[#AD99B8]"
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
                            type="button"
                            onClick={() =>
                              handleCancelRegistration(
                                registration.id
                              )
                            }
                            disabled={
                              updatingId === registration.id
                            }
                            className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {updatingId === registration.id
                              ? "Cancelando..."
                              : "Cancelar"}
                          </button>
                        ) : (
                          <span className="text-xs text-[#8F7A9B]">
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

        <footer className="border-t border-[#B900F5]/15 pt-6 text-center text-xs tracking-wider text-[#796A83]">
          EVENTHUB · THE EXPERIENCE STARTS HERE
        </footer>
      </div>
    </div>
  );
}
