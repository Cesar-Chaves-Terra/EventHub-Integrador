
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

import PageHeader from "@/components/layout/PageHeader";
import EventCard from "@/components/events/EventCard";
import EventForm, {
  type EventFormData,
} from "@/components/events/EventForm";
import EventStats from "@/components/events/EventStats";

interface EventItem {
  id: number;
  name: string;
  description: string;
  date: string;
  capacity: number;
  available_seats: number;
  organizer: string;
}

type EventsResponse = EventItem[] | { results: EventItem[] };

export default function EventsContent() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadEvents = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const response = await apiRequest<EventsResponse>(
        "/events/",
        {},
        token
      );

      setEvents(
        Array.isArray(response)
          ? response
          : response.results
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os eventos."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!showForm) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [showForm, editingEvent]);

  const totalCapacity = events.reduce(
    (total, event) => total + event.capacity,
    0
  );

  const availableSeats = events.reduce(
    (total, event) => total + event.available_seats,
    0
  );

  function handleCreateClick() {
    setEditingEvent(null);
    setError("");
    setMessage("");
    setShowForm(true);

    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleEdit(event: EventItem) {
    setEditingEvent(event);
    setError("");
    setMessage("");
    setShowForm(true);

    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingEvent(null);
    setError("");
  }

  async function handleSubmit(
    data: EventFormData
  ): Promise<void> {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingEvent) {
        await apiRequest<EventItem>(
          `/events/${editingEvent.id}/`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          },
          token
        );

        setMessage("Evento atualizado com sucesso!");
      } else {
        await apiRequest<EventItem>(
          "/events/",
          {
            method: "POST",
            body: JSON.stringify(data),
          },
          token
        );

        setMessage("Evento cadastrado com sucesso!");
      }

      setShowForm(false);
      setEditingEvent(null);

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o evento."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    eventId: number
  ): Promise<void> {
    const confirmed = window.confirm(
      "Deseja realmente excluir este evento?"
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.replace("/");
      return;
    }

    setDeletingId(eventId);
    setError("");
    setMessage("");

    try {
      await apiRequest<unknown>(
        `/events/${eventId}/`,
        {
          method: "DELETE",
        },
        token
      );

      if (editingEvent?.id === eventId) {
        setEditingEvent(null);
        setShowForm(false);
      }

      setMessage("Evento excluído com sucesso!");

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o evento."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getFormInitialData(): EventFormData | null {
    if (!editingEvent) {
      return null;
    }

    const eventDate = new Date(editingEvent.date);

    const pad = (value: number) =>
      String(value).padStart(2, "0");

    const localDate = [
      eventDate.getFullYear(),
      "-",
      pad(eventDate.getMonth() + 1),
      "-",
      pad(eventDate.getDate()),
      "T",
      pad(eventDate.getHours()),
      ":",
      pad(eventDate.getMinutes()),
    ].join("");

    return {
      name: editingEvent.name,
      description: editingEvent.description,
      date: localDate,
      capacity: editingEvent.capacity,
    };
  }

  return (
    <div className="min-h-screen bg-[#0C0612] text-[#F7ECFC]">
      <PageHeader
        eyebrow="Gerenciamento"
        title="Eventos"
      />

      <div className="mx-auto max-w-7xl space-y-7 p-6 md:p-10">
        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-2xl border border-[#B900F5]/20 bg-gradient-to-br from-[#30133E] via-[#1A0C24] to-[#0C0612] p-7 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B900F5]/15 blur-3xl" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E27BFF]">
              EventHub Experience
            </p>

            <h2 className="mt-3 text-2xl font-black text-white md:text-4xl">
              Seus eventos, sua experiência.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#CBB5D5]">
              Acompanhe sua programação, gerencie participantes
              e personalize suas experiências.
            </p>
          </div>
        </section>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-[#B900F5]/30 bg-[#B900F5]/10 p-4 text-sm text-[#E27BFF]"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Create event */}
        <section className="rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold text-white">
                Cadastrar novo evento
              </h2>

              <p className="mt-2 text-sm text-[#AD99B8]">
                Abra o formulário para adicionar um novo evento.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateClick}
              className="rounded-xl bg-[#B900F5] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#B900F5]/20 transition hover:bg-[#D338FF]"
            >
              + Cadastrar novo evento
            </button>
          </div>
        </section>

        {/* Event form */}
        {showForm && (
          <div
            ref={formRef}
            className="scroll-mt-6"
          >
            <EventForm
              initialData={getFormInitialData()}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={saving}
            />
          </div>
        )}

        {/* Registered events */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E27BFF]">
                Sua programação
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Eventos cadastrados
              </h2>

              <p className="mt-2 text-sm text-[#AD99B8]">
                Consulte, edite ou exclua os eventos existentes.
              </p>
            </div>

            <span className="rounded-xl border border-[#B900F5]/25 bg-[#24102F] px-4 py-2 text-sm font-semibold text-[#E27BFF]">
              {events.length} eventos
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#B900F5]/20 bg-[#1A0C24] p-10 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#B900F5]" />

              <p className="mt-4 text-sm text-[#AD99B8]">
                Carregando eventos...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#B900F5]/25 bg-[#1A0C24] px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-white">
                Nenhum evento cadastrado
              </h3>

              <p className="mt-2 text-sm text-[#AD99B8]">
                Utilize a opção acima para criar seu primeiro evento.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {deletingId !== null && (
            <p className="mt-4 text-sm text-[#E27BFF]">
              Excluindo evento #{deletingId}...
            </p>
          )}
        </section>

        {/* Compact statistics */}
        <EventStats
          totalEvents={events.length}
          totalCapacity={totalCapacity}
          availableSeats={availableSeats}
        />

        <footer className="border-t border-[#B900F5]/15 pt-6 text-center text-xs tracking-wider text-[#796A83]">
          EVENTHUB · THE EXPERIENCE STARTS HERE
        </footer>
      </div>
    </div>
  );
}
