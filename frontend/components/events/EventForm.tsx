
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!date || Number(capacity) < 1) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      capacity: Number(capacity),
    });
  }

  const isEditing = Boolean(initialData);

  const inputClass =
    "w-full rounded-xl border border-border-theme bg-surface-input px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30";

  const labelClass =
    "mb-2 block text-sm font-medium text-text-secondary";

  return (
    <section className="overflow-hidden rounded-2xl border border-border-theme bg-surface-card shadow-lg">
      <div className="h-1 bg-gradient-to-r from-[#64118C] via-[#B900F5] to-[#E27BFF]" />

      <div className="p-6 md:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-soft">
            EventHub Administration
          </p>

          <h3 className="mt-3 text-2xl font-bold text-text-primary">
            {isEditing ? "Editar evento" : "Cadastrar novo evento"}
          </h3>

          <p className="mt-2 text-sm text-text-muted">
            {isEditing
              ? "Atualize as informações do evento selecionado."
              : "Preencha os dados para criar uma nova experiência."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="event-name" className={labelClass}>
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
            <label htmlFor="event-description" className={labelClass}>
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
              <label htmlFor="event-date" className={labelClass}>
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
              <label htmlFor="event-capacity" className={labelClass}>
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
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border-theme pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-border-theme px-5 py-3 text-sm font-semibold text-text-secondary transition hover:bg-surface-elevated disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
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
