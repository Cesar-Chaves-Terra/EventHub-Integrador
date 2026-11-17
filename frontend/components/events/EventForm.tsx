
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
  }, [
    initialData?.name,
    initialData?.description,
    initialData?.date,
    initialData?.capacity,
  ]);

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

  const inputClass =
    "w-full rounded-xl border border-[#B900F5]/20 bg-[#0C0612] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#796A83] focus:border-[#B900F5] focus:ring-1 focus:ring-[#B900F5]/30";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#B900F5]/30 bg-[#1A0C24] shadow-xl shadow-black/20">
      <div className="h-1 bg-gradient-to-r from-[#64118C] via-[#B900F5] to-[#E27BFF]" />

      <div className="p-6 md:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E27BFF]">
            EventHub Administration
          </p>

          <h3 className="mt-3 text-2xl font-bold text-white">
            {isEditing ? "Editar evento" : "Cadastrar novo evento"}
          </h3>

          <p className="mt-2 text-sm text-[#AD99B8]">
            {isEditing
              ? "Atualize as informações do evento selecionado."
              : "Preencha os dados para criar uma nova experiência."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="event-name"
              className="mb-2 block text-sm font-medium text-[#D7C4E0]"
            >
              Nome do evento
            </label>

            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Festa de encerramento"
              maxLength={200}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="mb-2 block text-sm font-medium text-[#D7C4E0]"
            >
              Descrição
            </label>

            <textarea
              id="event-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Descreva os detalhes do evento..."
              rows={4}
              required
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="event-date"
                className="mb-2 block text-sm font-medium text-[#D7C4E0]"
              >
                Data e horário
              </label>

              <input
                id="event-date"
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="event-capacity"
                className="mb-2 block text-sm font-medium text-[#D7C4E0]"
              >
                Capacidade máxima
              </label>

              <input
                id="event-capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(event) =>
                  setCapacity(event.target.value)
                }
                placeholder="Ex.: 150"
                required
                className={inputClass}
              />
            </div>
          </div>

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
              disabled={loading}
              className="rounded-xl bg-[#B900F5] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#B900F5]/20 transition hover:bg-[#D338FF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar evento"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
