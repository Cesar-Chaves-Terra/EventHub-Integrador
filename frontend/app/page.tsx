
"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

interface TokenResponse {
  access: string;
  refresh: string;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const data = await apiRequest<TokenResponse>("/auth/token/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      sessionStorage.setItem("access", data.access);
      sessionStorage.setItem("refresh", data.refresh);

      setSuccess(true);
      router.push("/dashboard");
    } catch {
      setError("Usuário ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0A0F] px-4 py-12">
      {/* Background lighting */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#A8328D]/15 blur-[130px]" />

      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[550px] w-[550px] rounded-full bg-[#B99A55]/10 blur-[140px]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0A0F_75%)]" />

      {/* Login panel */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[#15121A]/90 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-10">
          {/* Brand */}
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[#A8328D]/30 bg-[#A8328D]/10">
              <span className="text-3xl text-[#D66ABD]">✦</span>
            </div>

            <h1 className="text-3xl font-black tracking-[0.16em] text-white">
              EVENT<span className="text-[#A8328D]">HUB</span>
            </h1>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#B99A55]">
              Experience more
            </p>

            <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#A8328D] to-transparent" />

            <h2 className="mt-6 text-xl font-bold text-white">
              Bem-vindo de volta
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Entre na sua conta para continuar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Usuário
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                placeholder="Digite seu usuário"
                className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D] focus:ring-2 focus:ring-[#A8328D]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Senha
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="Digite sua senha"
                className="w-full rounded-xl border border-white/10 bg-[#0B0A0F] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#A8328D] focus:ring-2 focus:ring-[#A8328D]/10"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <p className="text-sm text-emerald-400">
                  Login realizado com sucesso!
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#A8328D] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#A8328D]/20 transition hover:bg-[#D66ABD] hover:shadow-[#A8328D]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar na plataforma"}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-gray-500">
              EVENTHUB EXPERIENCE
            </p>

            <p className="mt-2 text-xs text-gray-600">
              Gerencie seus eventos com estilo.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          © 2026 EventHub. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
