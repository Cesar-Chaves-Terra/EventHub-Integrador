
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
  const editRef = useRef<HTMLDivElement | null>(null);

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

  const [editingParticipant, setEditingParticipant] =
    useState<RegistrationParticipant | null>(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

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
          : "Não foi possível carregar os participantes."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRegistrations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRegistrations]);

  useEffect(() => {
    if (!showForm) return;

    const frame = requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [showForm]);

  useEffect(() => {
    if (!editingParticipant) return;

    const frame = requestAnimationFrame(() => {
      editRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [editingParticipant]);

  function getManagedEvent(eventId: number) {
    return events.find(
      (event) => event.id === eventId && event.can_manage
    );
  }

  function getAvailableSeats(eventId: number): number {
    return (
      events.find((event) => event.id === eventId)
        ?.available_seats ?? 0
    );
  }

  function findExistingRegistration(
    eventId: number,
    participantId: number
  ) {
    return registrations.find(
      (registration) =>
        registration.event === eventId &&
        registration.participant === participantId
    );
  }

  function openCreateForm() {
    setShowForm(true);
    setEditingParticipant(null);
    setError("");
    setMessage("");

    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function openEditForm(participant: RegistrationParticipant) {
    setEditingParticipant(participant);
    setShowForm(false);
    setEditName(participant.name);
    setEditEmail(participant.email);
    setEditPhone(participant.phone_number ?? "");
    setError("");
    setMessage("");
  }

  function closeEditForm() {
    setEditingParticipant(null);
  }

  async function handleEditSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (!editingParticipant) return;

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest<RegistrationParticipant>(
        `/participants/${editingParticipant.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: editName.trim(),
            email: editEmail.trim().toLowerCase(),
            phone_number: editPhone.trim() || null,
          }),
        },
        token
      );

      setMessage("Participante atualizado com sucesso!");
      setEditingParticipant(null);
      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível editar o participante."
      );
    } finally {
      setSaving(false);
    }
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
      if (data.participantType === "standalone") {
        await apiRequest<RegistrationParticipant>(
          "/participants/",
          {
            method: "POST",
            body: JSON.stringify({
              name: data.name.trim(),
              email: data.email.trim().toLowerCase(),
              phone_number: data.phone_number.trim() || null,
            }),
          },
          token
        );

        setMessage("Participante cadastrado sem evento!");
      } else {
        const managedEvent = getManagedEvent(data.event);

        if (!managedEvent) {
          throw new Error(
            "Você não pode gerenciar este evento."
          );
        }

        if (managedEvent.available_seats <= 0) {
          throw new Error(
            "Este evento não possui vagas disponíveis."
          );
        }

        let participantId: number | null = null;

        if (data.participantType === "existing") {
          participantId = data.participant;
        } else {
          const normalizedEmail =
            data.email.trim().toLowerCase();

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
                  phone_number:
                    data.phone_number.trim() || null,
                }),
              },
              token
            );

            setMessage("Inscrição cadastrada com sucesso!");
          }
        }

        if (participantId !== null) {
          const existingRegistration =
            findExistingRegistration(
              data.event,
              participantId
            );

          if (existingRegistration?.status === "ACTIVE") {
            throw new Error(
              "Este participante já possui inscrição ativa."
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
        }
      }

      setShowForm(false);
      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o cadastro."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeStatus(
    registration: RegistrationItem
  ): Promise<void> {
    if (!getManagedEvent(registration.event)) {
      setError("Você não pode gerenciar esta inscrição.");
      return;
    }

    const isActive = registration.status === "ACTIVE";
    const nextStatus: RegistrationStatus = isActive
      ? "CANCELLED"
      : "ACTIVE";

    if (
      !isActive &&
      getAvailableSeats(registration.event) <= 0
    ) {
      setError(
        "Não é possível reativar: o evento está lotado."
      );
      return;
    }

    if (
      !window.confirm(
        isActive
          ? "Deseja cancelar esta inscrição?"
          : "Deseja reativar esta inscrição?"
      )
    ) {
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
        nextStatus,
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

  async function handleDeleteRegistration(
    registration: RegistrationItem
  ): Promise<void> {
    if (!getManagedEvent(registration.event)) {
      setError("Você não pode excluir esta inscrição.");
      return;
    }

    if (
      !window.confirm(
        "Excluir definitivamente esta inscrição? Essa ação não pode ser desfeita."
      )
    ) {
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
      await apiRequest<unknown>(
        `/registrations/${registration.id}/`,
        { method: "DELETE" },
        token
      );

      setMessage("Inscrição excluída com sucesso!");
      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir a inscrição."
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
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        participant?.name?.toLowerCase().includes(query) ||
        participant?.email?.toLowerCase().includes(query);

      const matchesEvent =
        selectedEvent === "all" ||
        String(registration.event) === selectedEvent;

      return Boolean(matchesSearch && matchesEvent);
    }
  );

  const standaloneParticipants = participants.filter(
    (participant) =>
      !registrations.some(
        (registration) =>
          registration.participant === participant.id
      )
  );

  const filteredStandalone = standaloneParticipants.filter(
    (participant) => {
      const query = search.trim().toLowerCase();

      return (
        !query ||
        participant.name.toLowerCase().includes(query) ||
        participant.email.toLowerCase().includes(query)
      );
    }
  );

  const activeCount = registrations.filter(
    (registration) => registration.status === "ACTIVE"
  ).length;

  const cancelledCount = registrations.filter(
    (registration) => registration.status === "CANCELLED"
  ).length;

  const inputClass =
    "w-full rounded-xl border border-border-theme bg-surface-input px-4 py-3 text-sm text-text-primary outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        eyebrow="Gerenciamento"
        title="Inscrições"
      />

      <div className="mx-auto max-w-7xl space-y-7 p-6 md:p-10">
        <section className="rounded-2xl border border-border-theme bg-gradient-to-br from-surface-elevated via-surface-card to-background p-7 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-soft">
            EventHub Experience
          </p>

          <h2 className="mt-3 text-2xl font-black text-text-primary md:text-4xl">
            Gerencie seus participantes.
          </h2>

          <p className="mt-3 text-sm text-text-secondary">
            Cadastre participantes, gerencie inscrições e
            acompanhe a ocupação dos eventos.
          </p>
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

        <section className="rounded-2xl border border-border-theme bg-surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Novo cadastro
              </h2>

              <p className="mt-2 text-sm text-text-muted">
                Cadastre uma inscrição ou um participante sem
                evento.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover"
            >
              + Novo cadastro
            </button>
          </div>
        </section>

        {showForm && (
          <div ref={formRef} className="scroll-mt-6">
            <RegistrationForm
              events={events}
              participants={participants}
              onSubmit={handleCreateRegistration}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          </div>
        )}

        {editingParticipant && (
          <section
            ref={editRef}
            className="scroll-mt-6 rounded-2xl border border-border-theme bg-surface-card p-6"
          >
            <h2 className="text-xl font-bold text-text-primary">
              Editar participante
            </h2>

            <p className="mt-2 text-sm text-text-muted">
              Atualize os dados de {editingParticipant.name}.
            </p>

            <form
              onSubmit={handleEditSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-2 block text-sm text-text-secondary"
                >
                  Nome completo
                </label>

                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                  maxLength={100}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-email"
                  className="mb-2 block text-sm text-text-secondary"
                >
                  E-mail
                </label>

                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(event) =>
                    setEditEmail(event.target.value)
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-phone"
                  className="mb-2 block text-sm text-text-secondary"
                >
                  Telefone (opcional)
                </label>

                <input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(event) =>
                    setEditPhone(event.target.value)
                  }
                  maxLength={15}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="rounded-xl border border-border-theme px-5 py-3 text-sm font-semibold text-text-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            ["Total de inscrições", registrations.length],
            ["Inscrições ativas", activeCount],
            ["Inscrições canceladas", cancelledCount],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-border-theme bg-surface-card p-5"
            >
              <p className="text-xs text-text-muted">{label}</p>

              <p className="mt-3 text-2xl font-bold text-text-primary">
                {loading ? "..." : value}
              </p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-text-primary">
            Inscrições cadastradas
          </h2>

          <p className="mt-2 text-sm text-text-muted">
            Consulte, edite e exclua os cadastros existentes.
          </p>

          <div className="my-5 grid gap-3 rounded-xl border border-border-theme bg-surface-card p-4 md:grid-cols-2">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por nome ou e-mail..."
              aria-label="Buscar participantes"
              className={inputClass}
            />

            <select
              value={selectedEvent}
              onChange={(event) =>
                setSelectedEvent(event.target.value)
              }
              aria-label="Filtrar por evento"
              className={inputClass}
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

          {loading ? (
            <div className="rounded-xl border border-border-theme bg-surface-card p-8 text-center text-text-muted">
              Carregando inscrições...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="rounded-xl border border-border-theme bg-surface-card p-8 text-center text-text-muted">
              Nenhuma inscrição encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border-theme bg-surface-card">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="border-b border-border-theme bg-surface-elevated text-xs uppercase text-text-secondary">
                  <tr>
                    <th className="px-4 py-3">Participante</th>
                    <th className="px-4 py-3">Contato</th>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-theme">
                  {filteredRegistrations.map((registration) => {
                    const isActive =
                      registration.status === "ACTIVE";

                    const isUpdating =
                      updatingId === registration.id;

                    const hasSeats =
                      getAvailableSeats(registration.event) > 0;

                    return (
                      <tr
                        key={registration.id}
                        className="hover:bg-primary/5"
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
                            className={
                              isActive
                                ? "font-semibold text-primary-soft"
                                : "text-text-muted"
                            }
                          >
                            {isActive ? "Ativa" : "Cancelada"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={updatingId !== null}
                              onClick={() =>
                                openEditForm(
                                  registration.participant_details
                                )
                              }
                              className="rounded-lg border border-border-theme px-3 py-2 text-xs font-semibold text-primary-soft disabled:opacity-40"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleChangeStatus(registration)
                              }
                              disabled={
                                updatingId !== null ||
                                (!isActive && !hasSeats)
                              }
                              className="rounded-lg border border-border-theme px-3 py-2 text-xs font-semibold text-text-secondary disabled:opacity-40"
                            >
                              {isUpdating
                                ? "Aguarde..."
                                : isActive
                                  ? "Cancelar"
                                  : "Reativar"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteRegistration(registration)
                              }
                              disabled={updatingId !== null}
                              className="rounded-lg border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-500 disabled:opacity-40"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-text-primary">
              Participantes sem evento
            </h2>

            <p className="mt-2 text-sm text-text-muted">
              Pessoas cadastradas que não possuem inscrições
              nos seus eventos.
            </p>
          </div>

          {filteredStandalone.length === 0 ? (
            <div className="rounded-xl border border-border-theme bg-surface-card p-8 text-center text-text-muted">
              Nenhum participante sem evento encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border-theme bg-surface-card">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-border-theme bg-surface-elevated text-xs uppercase text-text-secondary">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Telefone</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-theme">
                  {filteredStandalone.map((participant) => (
                    <tr key={participant.id}>
                      <td className="px-4 py-3 font-semibold text-text-primary">
                        {participant.name}
                      </td>

                      <td className="px-4 py-3 text-text-secondary">
                        {participant.email}
                      </td>

                      <td className="px-4 py-3 text-text-muted">
                        {participant.phone_number || "Sem telefone"}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openEditForm(participant)}
                          className="rounded-lg border border-border-theme px-3 py-2 text-xs font-semibold text-primary-soft"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
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
