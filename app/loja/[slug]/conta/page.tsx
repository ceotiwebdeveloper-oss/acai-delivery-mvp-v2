"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^55/, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function CustomerAccountPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "verify" | "signed-in">("details");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("full_name, phone, birth_date")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (!active) return;
      if (profile) {
        setName(profile.full_name);
        setPhone(formatPhone(profile.phone));
        setBirthDate(profile.birth_date);
      } else if (data.user.phone) {
        setPhone(formatPhone(data.user.phone));
      }
      setStep("signed-in");
    });
    return () => { active = false; };
  }, []);

  async function sendCode() {
    setError("");
    setMessage("");
    if (name.trim().length < 2 || phone.replace(/\D/g, "").replace(/^55/, "").length < 10 || !birthDate) {
      setError("Preencha nome, telefone e data de nascimento.");
      return;
    }
    if (new Date(birthDate) > new Date()) {
      setError("A data de nascimento não pode estar no futuro.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: normalizePhone(phone),
        options: { shouldCreateUser: true },
      });
      if (authError) throw authError;
      setStep("verify");
      setMessage("Enviamos um código por SMS. Digite-o abaixo para confirmar seu telefone.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar o código. Verifique a configuração de SMS e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError("");
    setMessage("");
    if (code.trim().length < 4) {
      setError("Digite o código recebido por SMS.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: normalizePhone(phone),
        token: code.trim(),
        type: "sms",
      });
      if (verifyError) throw verifyError;
      if (!data.user) throw new Error("Não foi possível confirmar sua conta.");
      const { error: profileError } = await supabase.from("customer_profiles").upsert({
        user_id: data.user.id,
        full_name: name.trim(),
        phone: normalizePhone(phone),
        birth_date: birthDate,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (profileError) throw profileError;
      setStep("signed-in");
      setMessage("Cadastro confirmado! Seus dados foram salvos com segurança.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível confirmar o código.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Sua sessão expirou. Entre novamente com seu telefone.");
      const { error: profileError } = await supabase.from("customer_profiles").upsert({
        user_id: user.id,
        full_name: name.trim(),
        phone: normalizePhone(phone),
        birth_date: birthDate,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (profileError) throw profileError;
      setMessage("Seus dados foram atualizados.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar os dados.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCode("");
    setStep("details");
    setMessage("Você saiu da sua conta.");
  }

  return (
    <main className="min-h-screen bg-[#f8f5fa] px-4 py-8 text-[#32103f] sm:py-14">
      <div className="mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-[#eee4f3] bg-white shadow-xl shadow-purple-950/5">
        <header className="bg-gradient-to-br from-[#26092f] to-[#76139a] px-6 py-7 text-white sm:px-8">
          <Link href={`/loja/${slug}`} className="text-sm font-semibold text-white/75 hover:text-white">← Voltar à loja</Link>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[.2em] text-fuchsia-200">Sua conta</p>
          <h1 className="mt-2 text-3xl font-black">Seus dados, do seu jeito.</h1>
          <p className="mt-2 text-sm leading-6 text-white/75">Cadastre-se usando somente nome, telefone e data de nascimento. Confirmamos seu telefone por código SMS.</p>
        </header>

        <div className="space-y-4 px-6 py-7 sm:px-8">
          <label className="block text-sm font-bold">Nome completo
            <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={120} placeholder="Como podemos te chamar?" className="mt-2 w-full rounded-xl border border-[#e7d8ef] px-4 py-3.5 text-sm outline-none focus:border-[#9a36bd]" />
          </label>
          <label className="block text-sm font-bold">Telefone
            <input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} type="tel" inputMode="tel" autoComplete="tel" placeholder="(16) 99999-9999" className="mt-2 w-full rounded-xl border border-[#e7d8ef] px-4 py-3.5 text-sm outline-none focus:border-[#9a36bd]" />
          </label>
          <label className="block text-sm font-bold">Data de nascimento
            <input value={birthDate} onChange={e => setBirthDate(e.target.value)} type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-xl border border-[#e7d8ef] px-4 py-3.5 text-sm outline-none focus:border-[#9a36bd]" />
          </label>

          {step === "verify" && (
            <label className="block text-sm font-bold">Código recebido por SMS
              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="Digite o código" className="mt-2 w-full rounded-xl border border-[#e7d8ef] px-4 py-3.5 text-sm tracking-[.3em] outline-none focus:border-[#9a36bd]" />
            </label>
          )}

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

          {step === "details" && <button type="button" disabled={loading} onClick={sendCode} className="w-full rounded-xl bg-[#76139a] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#5e0f7c] disabled:opacity-60">{loading ? "Enviando código..." : "Continuar com meu telefone"}</button>}
          {step === "verify" && <div className="space-y-3"><button type="button" disabled={loading} onClick={verifyCode} className="w-full rounded-xl bg-[#76139a] px-5 py-4 text-sm font-extrabold text-white disabled:opacity-60">{loading ? "Confirmando..." : "Confirmar e salvar cadastro"}</button><button type="button" disabled={loading} onClick={sendCode} className="w-full rounded-xl border border-[#e7d8ef] px-5 py-3 text-sm font-bold text-[#76139a]">Enviar outro código</button></div>}
          {step === "signed-in" && <div className="space-y-3"><button type="button" disabled={loading} onClick={saveProfile} className="w-full rounded-xl bg-[#76139a] px-5 py-4 text-sm font-extrabold text-white disabled:opacity-60">{loading ? "Salvando..." : "Salvar meus dados"}</button><Link href={`/loja/${slug}/checkout`} className="block w-full rounded-xl bg-[#f6eafa] px-5 py-4 text-center text-sm font-extrabold text-[#76139a]">Continuar para o pedido</Link><button type="button" onClick={signOut} className="w-full py-2 text-sm font-semibold text-[#806d88] underline">Sair da conta</button></div>}
          <p className="text-xs leading-5 text-[#897794]">Seus dados ficam privados e vinculados à sua conta. A data de nascimento é opcional para fazer pedidos como visitante; o cadastro é opcional.</p>
        </div>
      </div>
    </main>
  );
}
