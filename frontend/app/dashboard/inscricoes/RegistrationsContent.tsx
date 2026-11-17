
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

import PageHeader from "@/components/layout/PageHeader";
import RegistrationForm, {
  type RegistrationEvent,
  type RegistrationParticipant,
  type RegistrationFormData,
} from "@/components/registrations/RegistrationForm";

interface RegistrationItem {
  id: number;
  event: number;
  participant: number;
  participant_details: RegistrationParticipant;
  registration_date: string;
  status: "ACTIVE" | "CANCELLED";
}

type ListResponse<T> = T[] | { results: T[] };

function normalizeList<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function RegistrationsContent() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [events, setEvents] = useState<RegistrationEvent[]>([]);
  const [participants, setParticipants] = useState<
    RegistrationParticipant[]
  >([]);
  const [registrations, setRegistrations] = useState<
    RegistrationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRegistrations = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const [eventsData, participantsData, registrationsData] =
        await Promise.all([
          apiRequest<ListResponse<RegistrationEvent>>(
            "/events/",
            {},
            token
          ),
          apiRequest<ListResponse<RegistrationParticipant>>(
            "/participants/",
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
      setParticipants(normalizeList(participantsData));
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

  useEffect(() => {
    if (!showForm) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [showForm]);

  function handleCreateClick() {
    setError("");
    setMessage("");
    setShowForm(true);

    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleCancelForm() {
    setShowForm(false);
    setError("");
  }

  async function handleCreateRegistration(
    data: RegistrationFormData
  ): Promise<void> {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      let participantId: number;

      if (data.participantType === "existing") {
        participantId = data.participant;
      } else {
        const participant =
          await apiRequest<RegistrationParticipant>(
            "/participants/",
            {
              method: "POST",
              body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone_number: data.phone_number || null,
              }),
            },
            token
          );

        participantId = participant.id;
      }

      await apiRequest<RegistrationItem>(
        "/registrations/",
        {
          method: "POST",
          body: JSON.stringify({
            event: data.event,
            participant: participantId,
            status: "ACTIVE",
          }),
        },
        token
      );

      setMessage("Inscrição cadastrada com sucesso!");
      setShowForm(false);

      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar a inscrição."
      );
    } finally {
      setSaving(false);
    }
  }

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

  function getEventName(eventId: number): string {
    return (
      events.find((event) => event.id === eventId)?.name ??
      "Evento não encontrado"
    );
  }

  function formatDate(date: string): string {
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
        String(registration.event) === selectedEvent;

      return Boolean(matchesSearch && matchesEvent);
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
      description: "Inscrições registradas",
      icon: "▤",
    },
    {
      label: "Inscrições ativas",
      value: activeCount,
      description: "Participações confirmadas",
      icon: "✦",
    },
    {
      label: "Inscrições canceladas",
      value: cancelledCount,
      description: "Participações canceladas",
      icon: "◇",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0612] text-[#F7ECFC]">
      <PageHeader
        eyebrow="Gerenciamento"
        title="Inscrições"
      />

      <div className="mx-auto max-w-7xl space-y-7 p-6 md:p-10">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-2xl border border-[#B900F5]/20 bg-gradient-to-br from-[#30133E] via-[#1A0C24] to-[#0C0612] p-7 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B900F5]/15 blur-3xl" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E27BFF]">
              EventHub Experience
            </p>

            <h2 className="mt-3 text-2xl font-black text-white md:text-4xl">
              Gerencie seus participantes.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#CBB5D5]">
              Consulte inscrições, acompanhe participantes e
              organize a ocupação dos seus eventos.
            </p>
          </div>
        </section>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-[#B900F5]/30 bg-[#B900F5]/10 p-4 text-sm text-[#E27BFF]"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* New registration */}
        <section className="rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold text-white">
                Nova inscrição
              </h2>

              <p className="mt-2 text-sm text-[#AD99B8]">
                Cadastre um participante em um evento disponível.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateClick}
              className="rounded-xl bg-[#B900F5] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#B900F5]/20 transition hover:bg-[#D338FF]"
            >
              + Nova inscrição
            </button>
          </div>
        </section>

        {/* Registration form */}
        {showForm && (
          <div
            ref={formRef}
            className="scroll-mt-6"
          >
            <RegistrationForm
              events={events}
              participants={participants}
              onSubmit={handleCreateRegistration}
              onCancel={handleCancelForm}
              loading={saving}
            />
          </div>
        )}

        {/* Compact statistics */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-h-28 flex-col justify-between rounded-xl border border-[#B900F5]/20 bg-[#1A0C24] p-4 transition hover:border-[#B900F5]/50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[#AD99B8]">
                  {stat.label}
                </p>

                <span className="text-lg text-[#E27BFF]">
                  {stat.icon}
                </span>
              </div>

              <div className="mt-2">
                <p className="text-2xl font-bold text-white">
                  {loading
                    ? "..."
                    : stat.value.toLocaleString("pt-BR")}
                </p>

                <p className="mt-1 text-xs text-[#8F7A9B]">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Registered participants */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E27BFF]">
                Participantes
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Inscrições cadastradas
              </h2>

              <p className="mt-2 text-sm text-[#AD99B8]">
                Consulte os participantes e gerencie suas inscrições.
              </p>
            </div>

            <span className="rounded-xl border border-[#B900F5]/25 bg-[#24102F] px-4 py-2 text-sm font-semibold text-[#E27BFF]">
              {registrations.length} inscrições
            </span>
          </div>

          {/* Search and event filter */}
          <div className="mb-5 rounded-xl border border-[#B900F5]/20 bg-[#1A0C24] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                aria-label="Buscar inscrições"
                className="w-full rounded-xl border border-[#B900F5]/20 bg-[#0C0612] px-4 py-3 text-sm text-white outline-none placeholder:text-[#796A83] focus:border-[#B900F5]"
              />

              <select
                value={selectedEvent}
                onChange={(event) =>
                  setSelectedEvent(event.target.value)
                }
                aria-label="Filtrar por evento"
                className="w-full rounded-xl border border-[#B900F5]/20 bg-[#0C0612] px-4 py-3 text-sm text-white outline-none focus:border-[#B900F5]"
              >
                <option value="all">Todos os eventos</option>

                {events.map((event) => (
                  <option
                    key={event.id}
                    value={event.id}
                  >
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Registration table */}
          {loading ? (
            <div className="rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24] p-10 text-center">
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
                Cadastre uma inscrição ou altere os filtros.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24]">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-[#B900F5]/20 bg-[#30133E] text-xs uppercase tracking-wider text-[#D7C4E0]">
                  <tr>
                    <th className="px-4 py-3">Participante</th>
                    <th className="px-4 py-3">Contato</th>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#B900F5]/10">
                  {filteredRegistrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="transition hover:bg-[#B900F5]/5"
                    >
                      <td className="px-4 py-3 font-semibold text-white">
                        {registration.participant_details?.name ??
                          "Participante"}
                      </td>

                      <td className="px-4 py-3 text-[#AD99B8]">
                        <p className="break-all">
                          {registration.participant_details?.email ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs">
                          {registration.participant_details
                            ?.phone_number || "Sem telefone"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-[#D7C4E0]">
                        {getEventName(registration.event)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-[#AD99B8]">
                        {formatDate(registration.registration_date)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
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

                      <td className="px-4 py-3">
                        {registration.status === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelRegistration(
                                registration.id
                              )
                            }
                            disabled={updatingId !== null}
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
