
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
      iconColor: "text-[#D66ABD]",
      iconBackground: "bg-[#A8328D]/15",
    },
    {
      label: "Capacidade total",
      value: totalCapacity,
      description: "Vagas disponibilizadas",
      icon: "♙",
      iconColor: "text-[#B99A55]",
      iconBackground: "bg-[#B99A55]/15",
    },
    {
      label: "Vagas restantes",
      value: availableSeats,
      description: "Vagas ainda disponíveis",
      icon: "◇",
      iconColor: "text-emerald-400",
      iconBackground: "bg-emerald-400/10",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/10 bg-[#15121A] p-6 transition hover:border-[#A8328D]/30"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {stat.value.toLocaleString("pt-BR")}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.iconColor} ${stat.iconBackground}`}
            >
              {stat.icon}
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            {stat.description}
          </p>
        </div>
      ))}
    </section>
  );
}
