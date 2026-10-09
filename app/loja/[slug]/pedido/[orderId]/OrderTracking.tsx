"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const steps = [
  { value: "pending", label: "Pedido recebido", detail: "A loja recebeu seu pedido." },
  { value: "confirmed", label: "Pedido confirmado", detail: "A loja confirmou seu pedido." },
  { value: "preparing", label: "Em preparo", detail: "Estamos preparando tudo com carinho." },
  { value: "out_for_delivery", label: "Saiu para entrega", detail: "Seu pedido está a caminho." },
  { value: "completed", label: "Pedido concluído", detail: "Seu pedido foi finalizado. Bom apetite!" },
] as const;

export default function OrderTracking({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();

  useEffect(() => {
    const refreshOrder = () => router.refresh();
    const timer = window.setInterval(refreshOrder, 8000);
    const onFocus = () => { if (document.visibilityState === "visible") refreshOrder(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [router, orderId]);

  if (currentStatus === "cancelled") {
    return (
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>
          </span>
          <div><h2 className="text-lg font-black text-zinc-950">Pedido cancelado</h2><p className="mt-1 text-sm leading-6 text-zinc-500">A loja atualizou o status deste pedido. Entre em contato com a loja se precisar de mais informações.</p></div>
        </div>
      </section>
    );
  }

  const activeIndex = steps.findIndex((step) => step.value === currentStatus);
  const current = activeIndex >= 0 ? steps[activeIndex] : steps[0];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-purple-100 sm:p-7" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-purple-600">Acompanhamento em tempo real</p>
          <h2 className="mt-2 text-xl font-black text-zinc-950">{current.label}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">{current.detail}</p>
        </div>
        <span className="relative mt-1 flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
      </div>

      <ol className="mt-7 space-y-0">
        {steps.map((step, index) => {
          const done = index <= activeIndex;
          const active = index === activeIndex;
          return (
            <li key={step.value} className="relative flex gap-3 pb-6 last:pb-0">
              {index < steps.length - 1 ? <span className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${index < activeIndex ? "bg-purple-500" : "bg-zinc-200"}`} aria-hidden="true" /> : null}
              <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${done ? "border-purple-700 bg-purple-700 text-white" : "border-zinc-200 bg-white text-zinc-400"} ${active ? "ring-4 ring-purple-100" : ""}`} aria-hidden="true">
                {done ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg> : <span className="text-xs font-bold">{index + 1}</span>}
              </span>
              <div className="pt-1">
                <p className={`text-sm font-bold ${done ? "text-zinc-950" : "text-zinc-400"}`}>{step.label}</p>
                {active ? <p className="mt-1 text-xs text-purple-700">Status atual</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 border-t border-zinc-100 pt-4 text-xs text-zinc-400">Esta página atualiza automaticamente quando a loja muda o status do pedido.</p>
    </section>
  );
}
