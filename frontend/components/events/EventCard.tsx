
interface EventCardProps {
  event: {
    id: number;
    name: string;
    description: string;
    date: string;
    capacity: number;
    available_seats: number;
    organizer: string;
  };
  onEdit: (event: EventCardProps["event"]) => void;
  onDelete: (eventId: number) => void;
}

export default function EventCard({
  event,
  onEdit,
  onDelete,
}: EventCardProps) {
  const occupiedSeats = event.capacity - event.available_seats;

  const occupancyPercentage =
    event.capacity > 0
      ? Math.min((occupiedSeats / event.capacity) * 100, 100)
      : 0;

  const formattedDate = new Date(event.date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-bold text-white">
            {event.name}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            {event.description}
          </p>
        </div>

        <span className="shrink-0 rounded-lg border border-[#B99A55]/20 bg-[#B99A55]/10 px-3 py-1 text-xs font-semibold text-[#B99A55]">
          #{event.id}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">Data do evento</p>
          <p className="mt-2 text-sm font-medium text-gray-200">
            {formattedDate}
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">Organizador</p>
          <p className="mt-2 text-sm font-medium text-gray-200">
            {event.organizer || "Não informado"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-300">
            Ocupação do evento
          </span>

          <span className="text-sm font-bold text-white">
            {occupiedSeats} / {event.capacity}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#A8328D] to-[#D66ABD] transition-all"
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs">
          <span className="text-gray-500">
            {occupancyPercentage.toFixed(0)}% ocupado
          </span>

          <span className="font-medium text-emerald-400">
            {event.available_seats} vagas restantes
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={() => onEdit(event)}
          className="rounded-xl border border-[#B99A55]/30 px-4 py-2 text-sm font-semibold text-[#B99A55] transition hover:bg-[#B99A55]/10"
        >
          ✎ Editar
        </button>

        <button
          type="button"
          onClick={() => onDelete(event.id)}
          className="rounded-xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}
