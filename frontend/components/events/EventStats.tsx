
interface EventStatsProps {
  totalEvents: number;
  totalCapacity: number;
  availableSeats: number;
}

export default function EventStats({
  totalEvents,
  totalCapacity,
  availableSeats,
}: EventStatsProps) {
  const stats = [
    {
      label: "Eventos cadastrados",
      value: totalEvents,
      description: "Total de eventos criados",
      icon: "✦",
    },
    {
      label: "Capacidade total",
      value: totalCapacity,
      description: "Vagas disponibilizadas",
      icon: "♙",
    },
    {
      label: "Vagas restantes",
      value: availableSeats,
      description: "Vagas ainda disponíveis",
      icon: "◇",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex min-h-28 flex-col justify-between rounded-xl border border-[#B900F5]/20 bg-[#1A0C24] p-4 transition hover:border-[#B900F5]/50"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#AD99B8]">
              {stat.label}
            </p>

            <span className="text-lg text-[#E27BFF]">
              {stat.icon}
            </span>
          </div>

          <div className="mt-2">
            <p className="text-2xl font-bold text-white">
              {stat.value.toLocaleString("pt-BR")}
            </p>

            <p className="mt-1 text-xs text-[#8F7A9B]">
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
