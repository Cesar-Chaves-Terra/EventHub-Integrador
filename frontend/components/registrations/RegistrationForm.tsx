
"use client";

import { useState, type FormEvent } from "react";

export interface RegistrationEvent {
  id: number;
  name: string;
  capacity: number;
  available_seats: number;
  can_manage: boolean;
}

export interface RegistrationParticipant {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
}

export type RegistrationFormData =
  | {
      event: number;
      participantType: "existing";
      participant: number;
    }
  | {
      event: number;
      participantType: "new";
      name: string;
      email: string;
      phone_number: string;
    };

interface RegistrationFormProps {
  events: RegistrationEvent[];
  participants: RegistrationParticipant[];
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RegistrationForm({
  events,
  participants,
  onSubmit,
  onCancel,
  loading = false,
}: RegistrationFormProps) {
  const [eventId, setEventId] = useState("");
  const [participantType, setParticipantType] = useState<
    "new" | "existing"
  >("new");
  const [participantId, setParticipantId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const availableEvents = events.filter(
    (event) => event.can_manage && event.available_seats > 0
  );

  const selectedEvent = availableEvents.find(
    (event) => event.id === Number(eventId)
  );

  const inputClass =
    "w-full rounded-xl border border-border-theme bg-surface-input px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary";

  const labelClass =
    "mb-2 block text-sm font-medium text-text-secondary";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEvent) return;

    if (participantType === "existing") {
      if (!participantId) return;

      await onSubmit({
        event: selectedEvent.id,
        participantType: "existing",
        participant: Number(participantId),
      });

      return;
    }

    await onSubmit({
      event: selectedEvent.id,
      participantType: "new",
      name: name.trim(),
      email: email.trim(),
      phone_number: phoneNumber.trim(),
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border-theme bg-surface-card shadow-lg">
      <div className="h-1 bg-gradient-to-r from-[#64118C] via-[#B900F5] to-[#E27BFF]" />

      <div className="p-6 md:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-soft">
            EventHub Experience
          </p>

          <h2 className="mt-3 text-2xl font-bold text-text-primary">
            Nova inscrição
          </h2>

          <p className="mt-2 text-sm text-text-muted">
            Selecione um evento e informe os dados do participante.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="registration-event" className={labelClass}>
              Evento
            </label>

            <select
              id="registration-event"
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              required
              className={inputClass}
            >
              <option value="">Selecione um evento</option>

              {availableEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} — {event.available_seats} vagas
                </option>
              ))}
            </select>

            {availableEvents.length === 0 && (
              <p className="mt-3 text-sm text-amber-600">
                Nenhum dos seus eventos possui vagas disponíveis.
              </p>
            )}
          </div>

          {selectedEvent && (
            <div className="rounded-xl border border-border-theme bg-surface-elevated p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-text-muted">
                    Evento selecionado
                  </p>
                  <p className="mt-1 font-semibold text-text-primary">
                    {selectedEvent.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-text-muted">
                    Vagas disponíveis
                  </p>
                  <p className="mt-1 text-lg font-bold text-primary-soft">
                    {selectedEvent.available_seats} /{" "}
                    {selectedEvent.capacity}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border-theme pt-6">
            <h3 className="text-lg font-bold text-text-primary">
              Dados do participante
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              Cadastre uma pessoa ou selecione alguém que já
              participou de outro evento.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setParticipantType("new")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  participantType === "new"
                    ? "border-primary bg-primary/10 text-primary-soft"
                    : "border-border-theme bg-surface-elevated text-text-muted"
                }`}
              >
                + Novo participante
              </button>

              <button
                type="button"
                onClick={() => setParticipantType("existing")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  participantType === "existing"
                    ? "border-primary bg-primary/10 text-primary-soft"
                    : "border-border-theme bg-surface-elevated text-text-muted"
                }`}
              >
                Participante existente
              </button>
            </div>
          </div>

          {participantType === "new" ? (
            <div className="space-y-5">
              <div>
                <label htmlFor="participant-name" className={labelClass}>
                  Nome completo
                </label>
                <input
                  id="participant-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  placeholder="Nome do participante"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="participant-email" className={labelClass}>
                  E-mail
                </label>
                <input
                  id="participant-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="exemplo@email.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="participant-phone" className={labelClass}>
                  Telefone (opcional)
                </label>
                <input
                  id="participant-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="(51) 99999-9999"
                  maxLength={15}
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="existing-participant"
                className={labelClass}
              >
                Selecionar participante
              </label>

              <select
                id="existing-participant"
                value={participantId}
                onChange={(event) => setParticipantId(event.target.value)}
                required
                className={inputClass}
              >
                <option value="">Selecione um participante</option>

                {participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name} — {participant.email}
                  </option>
                ))}
              </select>

              {participants.length === 0 && (
                <p className="mt-3 text-sm text-text-muted">
                  Nenhum participante existente disponível.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-border-theme pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-border-theme px-5 py-3 text-sm font-semibold text-text-secondary disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !selectedEvent}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "Salvando inscrição..." : "Confirmar inscrição"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
