
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface EventItem {
  id: number;
  name: string;
  description: string;
  date: string;
  capacity: number;
  available_seats: number;
  organizer: string;
}

export default function EventosPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    const token = sessionStorage.getItem("access");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const result = await apiRequest<EventItem[]>(
        "/events/",
        {},
        token
      );

      setEvents(result);
    } catch {
      setError("Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = sessionStorage.getItem("access");

    if (!token) {
      router.push("/");
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest<EventItem>(
        "/events/",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            description,
            date: new Date(date).toISOString(),
            capacity: Number(capacity),
          }),
        },
        token
      );

      setName("");
      setDescription("");
      setDate("");
      setCapacity("");
      setMessage("Evento cadastrado com sucesso!");

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar o evento."
      );
    }
  }

  if (loading) {
    return <main className="p-8">Carregando eventos...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Eventos
        </h1>

        <button
          onClick={() => router.push("/dashboard")}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          Voltar ao dashboard
        </button>
      </header>

      <section className="mb-10 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">
          Cadastrar novo evento
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome do evento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded border p-3"
          />

          <textarea
            placeholder="Descrição do evento"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full rounded border p-3"
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Data e horário
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded border p-3"
            />
          </div>

          <input
            type="number"
            placeholder="Capacidade de participantes"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min="1"
            required
            className="w-full rounded border p-3"
          />

          <button
            type="submit"
            className="rounded bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Cadastrar evento
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600">{message}</p>
        )}

        {error && (
          <p className="mt-4 text-red-600">{error}</p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Eventos cadastrados
        </h2>

        {events.length === 0 ? (
          <p className="rounded bg-white p-6 text-gray-600 shadow">
            Nenhum evento cadastrado.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-lg bg-white p-6 shadow"
              >
                <h3 className="mb-2 text-lg font-bold">
                  {event.name}
                </h3>

                <p className="mb-3 text-gray-600">
                  {event.description}
                </p>

                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(event.date).toLocaleString("pt-BR")}
                </p>

                <p>
                  <strong>Capacidade:</strong> {event.capacity}
                </p>

                <p>
                  <strong>Vagas disponíveis:</strong>{" "}
                  {event.available_seats}
                </p>

                <p>
                  <strong>Organizador:</strong> {event.organizer}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
