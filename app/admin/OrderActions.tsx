"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { orderId: string };

export default function OrderActions({ orderId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteOrder() {
    if (deleting) return;
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este pedido? Essa ação não pode ser desfeita."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.rpc("delete_store_order", {
        p_order_id: orderId,
      });
      if (deleteError) throw deleteError;
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível excluir o pedido."
      );
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:w-full">
      <a
        href={`/admin/pedidos/${orderId}/visualizar`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-zinc-800"
      >
        VER INFORMAÇÕES <span aria-hidden="true">→</span>
      </a>
      <button
        type="button"
        onClick={deleteOrder}
        disabled={deleting}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
      >
        {deleting ? "Excluindo..." : "Excluir pedido"}
      </button>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
