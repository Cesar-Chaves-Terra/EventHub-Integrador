
"use client";

import { useState, type FormEvent } from "react";

export interface RegistrationEvent {
  id: number;
  name: string;
  capacity: number;
  available_seats: number;
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

  const selectedEvent = events.find(
    (event) => event.id === Number(eventId)
  );

  const availableEvents = events.filter(
    (event) => event.available_seats > 0
  );

  const inputClass =
    "w-full rounded-xl border border-[#B900F5]/20 bg-[#0C0612] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#796A83] focus:border-[#B900F5] focus:ring-1 focus:ring-[#B900F5]/30";

  const labelClass =
    "mb-2 block text-sm font-medium text-[#D7C4E0]";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const selectedEventId = Number(eventId);

    if (!selectedEventId) {
      return;
    }

    if (participantType === "existing") {
      if (!participantId) {
        return;
      }

      await onSubmit({
        event: selectedEventId,
        participantType: "existing",
        participant: Number(participantId),
      });

      return;
    }

    await onSubmit({
      event: selectedEventId,
      participantType: "new",
      name: name.trim(),
      email: email.trim(),
      phone_number: phoneNumber.trim(),
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#B900F5]/30 bg-[#1A0C24] shadow-xl shadow-black/20">
      <div className="h-1 bg-gradient-to-r from-[#64118C] via-[#B900F5] to-[#E27BFF]" />

      <div className="p-6 md:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E27BFF]">
            EventHub Experience
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Nova inscrição
          </h2>

          <p className="mt-2 text-sm text-[#AD99B8]">
            Selecione um evento e informe os dados do
            participante.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="registration-event"
              className={labelClass}
            >
              Evento
            </label>

            <select
              id="registration-event"
              value={eventId}
              onChange={(event) =>
                setEventId(event.target.value)
              }
              required
              className={inputClass}
            >
              <option value="">
                Selecione um evento
              </option>

              {availableEvents.map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                >
                  {event.name} — {event.available_seats} vagas
                </option>
              ))}
            </select>

            {availableEvents.length === 0 && (
              <p className="mt-3 text-sm text-amber-300">
                Nenhum evento possui vagas disponíveis.
              </p>
            )}
          </div>

          {selectedEvent && (
            <div className="rounded-xl border border-[#B900F5]/20 bg-[#120819] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#AD99B8]">
                    Evento selecionado
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {selectedEvent.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#AD99B8]">
                    Vagas disponíveis
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#E27BFF]">
                    {selectedEvent.available_seats} /{" "}
                    {selectedEvent.capacity}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-[#B900F5]/15 pt-6">
            <h3 className="text-lg font-bold text-white">
              Dados do participante
            </h3>

            <p className="mt-2 text-sm text-[#AD99B8]">
              Cadastre uma pessoa ou selecione alguém
              que já participou de outro evento.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setParticipantType("new")
                }
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  participantType === "new"
                    ? "border-[#B900F5] bg-[#B900F5]/15 text-[#E27BFF]"
                    : "border-white/10 bg-[#120819] text-[#AD99B8] hover:border-[#B900F5]/40"
                }`}
              >
                + Novo participante
              </button>

              <button
                type="button"
                onClick={() =>
                  setParticipantType("existing")
                }
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  participantType === "existing"
                    ? "border-[#B900F5] bg-[#B900F5]/15 text-[#E27BFF]"
                    : "border-white/10 bg-[#120819] text-[#AD99B8] hover:border-[#B900F5]/40"
                }`}
              >
                Participante existente
              </button>
            </div>
          </div>

          {participantType === "new" ? (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="participant-name"
                  className={labelClass}
                >
                  Nome completo
                </label>

                <input
                  id="participant-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Nome do participante"
                  maxLength={100}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="participant-email"
                  className={labelClass}
                >
                  E-mail
                </label>

                <input
                  id="participant-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="exemplo@email.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="participant-phone"
                  className={labelClass}
                >
                  Telefone (opcional)
                </label>

                <input
                  id="participant-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.target.value)
                  }
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
                onChange={(event) =>
                  setParticipantId(event.target.value)
                }
                required
                className={inputClass}
              >
                <option value="">
                  Selecione um participante
                </option>

                {participants.map((participant) => (
                  <option
                    key={participant.id}
                    value={participant.id}
                  >
                    {participant.name} — {participant.email}
                  </option>
                ))}
              </select>

              {participants.length === 0 && (
                <p className="mt-3 text-sm text-[#AD99B8]">
                  Nenhum participante existente disponível
                  para seleção.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#B900F5]/15 pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-[#D7C4E0] transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                availableEvents.length === 0 ||
                !eventId
              }
              className="rounded-xl bg-[#B900F5] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#B900F5]/20 transition hover:bg-[#D338FF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Salvando inscrição..."
                : "Confirmar inscrição"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
