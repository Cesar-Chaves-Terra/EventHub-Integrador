
"use client";

interface EventBannerProps {
  onCreateClick: () => void;
}

export default function EventBanner({
  onCreateClick,
}: EventBannerProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#100D13] p-8 md:p-12">
      <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#A8328D]/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-[#B99A55]/10 blur-3xl" />

      <svg
        viewBox="0 0 500 340"
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none absolute -right-8 bottom-0 z-0 hidden h-full w-[65%] opacity-60 md:block"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="eventShadow"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#21182B" />
            <stop offset="100%" stopColor="#17131D" />
          </linearGradient>
        </defs>

        <g fill="url(#eventShadow)">
          <path d="M320 25 H355 V65 L368 91 L382 119 V330 H293 V119 L307 91 L320 65 Z" />
          <rect x="322" y="9" width="31" height="20" rx="3" />
          <path d="M322 9 L353 9 L349 0 H326 Z" />
        </g>

        <rect
          x="305"
          y="170"
          width="65"
          height="85"
          rx="4"
          fill="#21182B"
          opacity="0.7"
        />

        <g fill="#17131D">
          <path d="M65 75 H155 L145 140 Q133 172 110 180 Q87 172 75 140 Z" />
          <rect x="106" y="177" width="8" height="105" />
          <rect x="78" y="280" width="64" height="8" rx="4" />
        </g>

        <g fill="#17131D">
          <path d="M175 95 H265 L255 160 Q243 192 220 200 Q197 192 185 160 Z" />
          <rect x="216" y="197" width="8" height="85" />
          <rect x="188" y="280" width="64" height="8" rx="4" />
        </g>

        <ellipse
          cx="250"
          cy="325"
          rx="230"
          ry="12"
          fill="#17131D"
          opacity="0.7"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#100D13] via-[#100D13]/90 to-transparent" />

      <div className="relative z-10 max-w-2xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#B99A55]">
          EventHub Experience
        </p>

        <h3 className="text-3xl font-black leading-tight text-white md:text-5xl">
          Crie experiências.
          <span className="block text-[#D66ABD]">
            Gerencie momentos.
          </span>
        </h3>

        <p className="mt-5 max-w-lg text-sm leading-7 text-gray-300 md:text-base">
          Organize seus eventos, acompanhe a capacidade e gerencie
          suas vagas em um só lugar.
        </p>

        <button
          onClick={onCreateClick}
          className="mt-8 rounded-xl bg-[#A8328D] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#A8328D]/20 transition hover:bg-[#D66ABD]"
        >
          + Criar novo evento
        </button>
      </div>
    </section>
  );
}
