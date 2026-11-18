
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

type RegistrationStatus = RegistrationItem["status"];
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
      setError("");
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
    const timeoutId = window.setTimeout(() => {
      void loadRegistrations();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
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

  function getAvailableSeats(eventId: number): number {
    return (
      events.find((event) => event.id === eventId)
        ?.available_seats ?? 0
    );
  }

  function getManagedEvent(eventId: number) {
    return events.find(
      (event) => event.id === eventId && event.can_manage
    );
  }

  function findExistingRegistration(
    eventId: number,
    participantId: number
  ): RegistrationItem | undefined {
    return registrations.find(
      (registration) =>
        registration.event === eventId &&
        registration.participant === participantId
    );
  }

  async function updateRegistrationStatus(
    registrationId: number,
    status: RegistrationStatus,
    token: string
  ): Promise<void> {
    await apiRequest<RegistrationItem>(
      `/registrations/${registrationId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      token
    );
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
      const event = getManagedEvent(data.event);

      if (!event) {
        throw new Error(
          "Você não tem permissão para inscrever pessoas neste evento."
        );
      }

      if (event.available_seats <= 0) {
        throw new Error(
          "Este evento não possui vagas disponíveis."
        );
      }

      let participantId: number | null = null;

      if (data.participantType === "existing") {
        participantId = data.participant;
      } else {
        const normalizedEmail = data.email.trim().toLowerCase();

        const existingParticipant = participants.find(
          (participant) =>
            participant.email.trim().toLowerCase() ===
            normalizedEmail
        );

        if (existingParticipant) {
          participantId = existingParticipant.id;
        } else {
          await apiRequest<RegistrationItem>(
            "/registrations/enroll/",
            {
              method: "POST",
              body: JSON.stringify({
                event: data.event,
                name: data.name.trim(),
                email: normalizedEmail,
                phone_number: data.phone_number.trim() || null,
              }),
            },
            token
          );

          setMessage("Inscrição cadastrada com sucesso!");
          setShowForm(false);

          await loadRegistrations();
          return;
        }
      }

      if (participantId === null) {
        throw new Error(
          "Não foi possível identificar o participante."
        );
      }

      const existingRegistration = findExistingRegistration(
        data.event,
        participantId
      );

      if (existingRegistration?.status === "ACTIVE") {
        throw new Error(
          "Este participante já possui uma inscrição ativa neste evento."
        );
      }

      if (existingRegistration?.status === "CANCELLED") {
        await updateRegistrationStatus(
          existingRegistration.id,
          "ACTIVE",
          token
        );

        setMessage("Inscrição reativada com sucesso!");
      } else {
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
      }

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

  async function handleChangeStatus(
    registration: RegistrationItem
  ): Promise<void> {
    const isActive = registration.status === "ACTIVE";

    const newStatus: RegistrationStatus = isActive
      ? "CANCELLED"
      : "ACTIVE";

    if (!getManagedEvent(registration.event)) {
      setError("Você não pode gerenciar esta inscrição.");
      return;
    }

    if (
      newStatus === "ACTIVE" &&
      getAvailableSeats(registration.event) <= 0
    ) {
      setError(
        "Não é possível reativar a inscrição: o evento está lotado."
      );
      setMessage("");
      return;
    }

    const confirmed = window.confirm(
      isActive
        ? "Deseja realmente cancelar esta inscrição?"
        : "Deseja reativar esta inscrição?"
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setUpdatingId(registration.id);
    setError("");
    setMessage("");

    try {
      await updateRegistrationStatus(
        registration.id,
        newStatus,
        token
      );

      setMessage(
        isActive
          ? "Inscrição cancelada com sucesso!"
          : "Inscrição reativada com sucesso!"
      );

      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a inscrição."
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
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        eyebrow="Gerenciamento"
        title="Inscrições"
      />

      <div className="mx-auto max-w-7xl space-y-7 p-6 md:p-10">
        <section className="relative overflow-hidden rounded-2xl border border-border-theme bg-gradient-to-br from-surface-elevated via-surface-card to-background p-7 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-soft">
              EventHub Experience
            </p>

            <h2 className="mt-3 text-2xl font-black text-text-primary md:text-4xl">
              Gerencie seus participantes.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">
              Consulte inscrições, acompanhe participantes e
              organize a ocupação dos seus eventos.
            </p>
          </div>
        </section>

        {message && (
          <div
            role="status"
            className="rounded-xl border border-border-theme bg-primary/10 p-4 text-sm text-primary-soft"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
          >
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-border-theme bg-surface-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Nova inscrição
              </h2>

              <p className="mt-2 text-sm text-text-muted">
                Cadastre um participante em um evento disponível.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateClick}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
            >
              + Nova inscrição
            </button>
          </div>
        </section>

        {showForm && (
          <div ref={formRef} className="scroll-mt-6">
            <RegistrationForm
              events={events}
              participants={participants}
              onSubmit={handleCreateRegistration}
              onCancel={handleCancelForm}
              loading={saving}
            />
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

              <div className="mt-2">
                <p className="text-2xl font-bold text-text-primary">
                  {loading
                    ? "..."
                    : stat.value.toLocaleString("pt-BR")}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-soft">
                Participantes
              </p>

              <h2 className="mt-2 text-2xl font-bold text-text-primary">
                Inscrições cadastradas
              </h2>

              <p className="mt-2 text-sm text-text-muted">
                Consulte os participantes e gerencie suas inscrições.
              </p>
            </div>

            <span className="rounded-xl border border-border-theme bg-surface-elevated px-4 py-2 text-sm font-semibold text-primary-soft">
              {registrations.length} inscrições
            </span>
          </div>

          <div className="mb-5 rounded-xl border border-border-theme bg-surface-card p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                aria-label="Buscar inscrições"
                className="w-full rounded-xl border border-border-theme bg-surface-input px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
              />

              <select
                value={selectedEvent}
                onChange={(event) =>
                  setSelectedEvent(event.target.value)
                }
                aria-label="Filtrar por evento"
                className="w-full rounded-xl border border-border-theme bg-surface-input px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
              >
                <option value="all">Todos os eventos</option>

                {events
                  .filter((event) => event.can_manage)
                  .map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border-theme bg-surface-card p-10 text-center text-text-muted">
              Carregando inscrições...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-theme bg-surface-card px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-text-primary">
                Nenhuma inscrição encontrada
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                Cadastre uma inscrição ou altere os filtros.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border-theme bg-surface-card">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-border-theme bg-surface-elevated text-xs uppercase tracking-wider text-text-secondary">
                  <tr>
                    <th className="px-4 py-3">Participante</th>
                    <th className="px-4 py-3">Contato</th>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-theme">
                  {filteredRegistrations.map((registration) => {
                    const isActive =
                      registration.status === "ACTIVE";

                    const eventHasSeats =
                      getAvailableSeats(registration.event) > 0;

                    const isUpdating =
                      updatingId === registration.id;

                    return (
                      <tr
                        key={registration.id}
                        className="transition hover:bg-primary/5"
                      >
                        <td className="px-4 py-3 font-semibold text-text-primary">
                          {registration.participant_details?.name ??
                            "Participante"}
                        </td>

                        <td className="px-4 py-3 text-text-muted">
                          <p className="break-all">
                            {registration.participant_details?.email ??
                              "—"}
                          </p>

                          <p className="mt-1 text-xs">
                            {registration.participant_details
                              ?.phone_number || "Sem telefone"}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-text-secondary">
                          {getEventName(registration.event)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                          {formatDate(registration.registration_date)}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-primary/10 text-primary-soft"
                                : "bg-surface-elevated text-text-muted"
                            }`}
                          >
                            {isActive ? "Ativa" : "Cancelada"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              void handleChangeStatus(registration)
                            }
                            disabled={
                              updatingId !== null ||
                              (!isActive && !eventHasSeats)
                            }
                            title={
                              !isActive && !eventHasSeats
                                ? "Evento sem vagas disponíveis"
                                : undefined
                            }
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              isActive
                                ? "border-red-400/30 text-red-500 hover:bg-red-500/10"
                                : "border-border-theme text-primary-soft hover:bg-primary/10"
                            }`}
                          >
                            {isUpdating
                              ? "Atualizando..."
                              : isActive
                                ? "Cancelar"
                                : "Reativar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="border-t border-border-theme pt-6 text-center text-xs tracking-wider text-text-muted">
          EVENTHUB · THE EXPERIENCE STARTS HERE
        </footer>
      </div>
    </div>
  );
}
