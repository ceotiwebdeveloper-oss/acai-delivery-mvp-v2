"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminOrderRealtime() {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const permissionTimer = window.setTimeout(() => {
      if (!("Notification" in window)) {
        setPermission("unsupported");
      } else {
        setPermission(Notification.permission);
      }
    }, 0);

    const supabase = createClient();
    const channel = supabase
      .channel("admin-new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as { customer_name?: string; total?: number };
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("Novo pedido recebido!", {
              body: `${order.customer_name ?? "Cliente"} fez um pedido.${typeof order.total === "number" ? ` Total: R$ ${order.total.toFixed(2).replace(".", ",")}` : ""}`,
              icon: "/favicon.ico",
            });
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
          router.refresh();
        }
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      window.clearTimeout(permissionTimer);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`} />
        {connected ? "Pedidos ao vivo" : "Conectando pedidos..."}
      </span>
      {permission !== "granted" && permission !== "unsupported" && (
        <button
          type="button"
          onClick={enableNotifications}
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-800 hover:bg-violet-50"
        >
          Ativar notificações
        </button>
      )}
      {permission === "granted" && (
        <span className="text-xs font-medium text-emerald-700">Notificações ativadas</span>
      )}
    </div>
  );
}
