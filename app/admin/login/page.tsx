"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setError("Configuração do Supabase ausente. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY na Vercel.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao serviço de login. Verifique a configuração do Supabase e tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Administração
          </p>
          <h1 className="mt-2 text-3xl font-black text-zinc-950">
            Entrar no painel
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Acesse o gerenciamento da sua loja.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-900">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-900">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-zinc-950 px-5 py-4 font-black text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
