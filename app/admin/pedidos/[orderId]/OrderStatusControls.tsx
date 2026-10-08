"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const statuses = [
  { value: "pending", label: "Pendente", description: "Pedido recebido" },
  { value: "confirmed", label: "Confirmado", description: "Pedido aceito pela loja" },
  { value: "preparing", label: "Em preparo", description: "A equipe está preparando" },
  { value: "out_for_delivery", label: "Saiu para entrega", description: "Pedido com o entregador" },
  { value: "completed", label: "Concluído", description: "Pedido entregue ou retirado" },
  { value: "cancelled", label: "Cancelado", description: "Pedido cancelado" },
] as const;

export default function OrderStatusControls({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function changeStatus(nextStatus: string) {
    if (saving || nextStatus === currentStatus) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        setError("Sua sessão expirou. Entre novamente no painel administrativo.");
        return;
      }

      const { data, error: updateError } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId)
        .select("id, status")
        .maybeSingle();

      if (updateError) {
        setError("Falha ao salvar o status: " + updateError.message);
        return;
      }
      if (!data) {
        setError("Nenhum pedido foi atualizado. Confira as permissões de UPDATE da tabela orders no Supabase.");
        return;
      }

      const label = statuses.find((status) => status.value === data.status)?.label ?? data.status;
      setMessage("Status atualizado: " + label + ".");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro inesperado ao atualizar o pedido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Gerenciamento do pedido</p>
      <h2 className="mt-2 text-xl font-black text-zinc-950">Atualizar status</h2>
      <p className="mt-1 text-sm text-zinc-500">Escolha uma opção. A alteração será salva no banco de dados.</p>
      {message ? <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
      {error ? <p role="alert" className="mt-4 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statuses.map((status) => {
          const active = status.value === currentStatus;
          return (
            <button
              key={status.value}
              type="button"
              disabled={saving || active}
              onClick={() => changeStatus(status.value)}
              className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50"}`}
            >
              <span className="block text-sm font-extrabold">{saving && !active ? "Salvando..." : status.label}{active ? " · ATUAL" : ""}</span>
              <span className={`mt-1 block text-xs ${active ? "text-zinc-300" : "text-zinc-500"}`}>{status.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
