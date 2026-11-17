
"use client";

import { useEffect, useState, type FormEvent } from "react";

export interface EventFormData {
  name: string;
  description: string;
  date: string;
  capacity: number;
}

interface EventFormProps {
  initialData?: EventFormData | null;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function EventForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: EventFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");


  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setDate(initialData.date.slice(0, 16));
      setCapacity(String(initialData.capacity));
    } else {
      setName("");
      setDescription("");
      setDate("");
      setCapacity("");
    }
  }, [initialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      capacity: Number(capacity),
    });
  }

  const isEditing = Boolean(initialData);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#15121A] p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B99A55]">
          Gerenciamento
        </p>

        <h3 className="mt-2 text-xl font-bold text-white">
          {isEditing ? "Editar evento" : "Cadastrar novo evento"}
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          {isEditing
            ? "Atualize as informações do seu evento."
            : "Preencha os dados para criar um novo evento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="event-name"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Nome do evento
          </label>

          <input
            id="event-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Festa de encerramento"
            required
            maxLength={200}
            className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D]"
          />
        </div>

        <div>
          <label
            htmlFor="event-description"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Descrição
          </label>

          <textarea
            id="event-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva os detalhes do evento..."
            required
            rows={4}
            className="w-full resize-y rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D]"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="event-date"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Data e horário
            </label>

            <input
              id="event-date"
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-sm text-white outline-none transition focus:border-[#A8328D]"
            />
          </div>

          <div>
            <label
              htmlFor="event-capacity"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Capacidade máxima
            </label>

            <input
              id="event-capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder="Ex.: 150"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D]"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#A8328D] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#A8328D]/20 transition hover:bg-[#D66ABD] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Criar evento"}
          </button>
        </div>
      </form>
    </section>
  );
}
