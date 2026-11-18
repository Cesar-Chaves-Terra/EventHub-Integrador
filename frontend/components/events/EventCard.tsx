
"use client";

interface EventItem {
  id: number;
  name: string;
  description: string;
  date: string;
  capacity: number;
  available_seats: number;
  organizer: string;
  can_manage: boolean;
}

interface EventCardProps {
  event: EventItem;
  onEdit: (event: EventItem) => void;
  onDelete: (eventId: number) => void;
}

export default function EventCard({
  event,
  onEdit,
  onDelete,
}: EventCardProps) {
  const occupiedSeats = Math.max(
    0,
    event.capacity - event.available_seats
  );

  const occupancyPercentage =
    event.capacity > 0
      ? Math.min(
          (occupiedSeats / event.capacity) * 100,
          100
        )
      : 0;

  const formattedDate = new Date(event.date).toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-border-theme bg-surface-card transition duration-300 hover:border-primary/60 hover:shadow-lg">
      <div className="h-1 bg-gradient-to-r from-[#64118C] via-[#B900F5] to-[#E27BFF]" />

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-soft">
              EventHub Experience
            </p>

            <h3 className="mt-3 break-words text-xl font-bold text-text-primary">
              {event.name}
            </h3>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {event.description}
            </p>
          </div>

          <span className="shrink-0 rounded-lg border border-border-theme bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-soft">
            #{event.id}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border-theme bg-surface-elevated p-4">
            <p className="text-xs text-text-muted">
              Data e horário
            </p>

            <p className="mt-2 text-sm font-semibold text-text-primary">
              {formattedDate}
            </p>
          </div>

          <div className="rounded-xl border border-border-theme bg-surface-elevated p-4">
            <p className="text-xs text-text-muted">
              Organizador
            </p>

            <p className="mt-2 text-sm font-semibold text-text-primary">
              {event.organizer || "Não informado"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-text-secondary">
              Ocupação do evento
            </span>

            <span className="text-sm font-bold text-text-primary">
              {occupiedSeats} / {event.capacity}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#64118C] to-[#B900F5] transition-all duration-300"
              style={{
                width: `${occupancyPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between gap-3 text-xs">
            <span className="text-text-muted">
              {occupancyPercentage.toFixed(0)}% ocupado
            </span>

            <span className="font-semibold text-primary-soft">
              {event.available_seats} vagas restantes
            </span>
          </div>
        </div>

        {event.can_manage && (
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border-theme pt-5">
            <button
              type="button"
              onClick={() => onEdit(event)}
              className="rounded-xl border border-border-theme bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary-soft transition hover:border-primary hover:bg-primary/20"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="rounded-xl border border-red-400/30 px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
