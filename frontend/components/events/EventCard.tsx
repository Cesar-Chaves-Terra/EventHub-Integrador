
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
    <article className="group overflow-hidden rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24] transition duration-300 hover:border-[#B900F5]/60 hover:shadow-xl hover:shadow-[#B900F5]/10">
      <div className="h-1 bg-gradient-to-r from-[#64118C] via-[#B900F5] to-[#E27BFF]" />

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E27BFF]">
              EventHub Experience
            </p>

            <h3 className="mt-3 break-words text-xl font-bold text-white">
              {event.name}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#CBB5D5]">
              {event.description}
            </p>
          </div>

          <span className="shrink-0 rounded-lg border border-[#B900F5]/25 bg-[#B900F5]/10 px-3 py-1 text-xs font-semibold text-[#E27BFF]">
            #{event.id}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-[#120819] p-4">
            <p className="text-xs text-[#AD99B8]">
              Data e horário
            </p>

            <p className="mt-2 text-sm font-semibold text-white">
              {formattedDate}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#120819] p-4">
            <p className="text-xs text-[#AD99B8]">
              Organizador
            </p>

            <p className="mt-2 text-sm font-semibold text-white">
              {event.organizer || "Não informado"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[#CBB5D5]">
              Ocupação do evento
            </span>

            <span className="text-sm font-bold text-white">
              {occupiedSeats} / {event.capacity}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#382044]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#64118C] to-[#B900F5] transition-all duration-300"
              style={{
                width: `${occupancyPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between gap-3 text-xs">
            <span className="text-[#AD99B8]">
              {occupancyPercentage.toFixed(0)}% ocupado
            </span>

            <span className="font-semibold text-[#E27BFF]">
              {event.available_seats} vagas restantes
            </span>
          </div>
        </div>

        {event.can_manage && (
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#B900F5]/15 pt-5">
            <button
              type="button"
              onClick={() => onEdit(event)}
              className="rounded-xl border border-[#B900F5]/40 bg-[#B900F5]/10 px-5 py-2.5 text-sm font-semibold text-[#E27BFF] transition hover:border-[#B900F5] hover:bg-[#B900F5]/20"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="rounded-xl border border-red-400/20 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
