import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OrderStatusControls from "./OrderStatusControls";

export const instant = false;

type Props = { params: Promise<{ orderId: string }> };

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  address: string | null;
  address_number: string | null;
  complement: string | null;
  payment_method: string;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  selected_options: unknown;
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  card: "Cartão (débito/crédito)",
  cash: "Dinheiro",
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
}

function selectedOptionsText(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") {
    try { return selectedOptionsText(JSON.parse(value)); } catch { return [value]; }
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (typeof entry === "string") return [entry];
      if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        const name = typeof obj.name === "string" ? obj.name : typeof obj.label === "string" ? obj.label : "";
        const price = typeof obj.price === "number" && obj.price > 0 ? " (+" + money(obj.price) + ")" : "";
        return name ? [name + price] : [];
      }
      return [];
    });
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([, entry]) => {
      if (typeof entry === "string" || typeof entry === "number") return [String(entry)];
      if (Array.isArray(entry)) return selectedOptionsText(entry);
      if (entry && typeof entry === "object") return selectedOptionsText(entry);
      return [];
    });
  }
  return [];
}

export default async function ManageOrderPage({ params }: Props) {
  await connection();
  const { orderId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-5">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-black text-zinc-950">Acesso administrativo</h1>
          <p className="mt-2 text-sm text-zinc-500">Entre para gerenciar este pedido.</p>
          <Link href="/admin/login" className="mt-5 inline-flex rounded-xl bg-zinc-950 px-5 py-3 font-bold text-white">Entrar</Link>
        </section>
      </main>
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, customer_name, customer_phone, delivery_type, address, address_number, complement, payment_method, notes, subtotal, delivery_fee, total, status, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) notFound();

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, product_name, quantity, unit_price, total, selected_options")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const safeOrder = order as Order;
  const safeItems = (items ?? []) as OrderItem[];

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={`/admin/pedidos/${safeOrder.id}/visualizar`} className="text-sm font-semibold text-zinc-500 hover:text-zinc-950">← Voltar às informações do pedido</Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">Gerenciar pedido</h1>
            <p className="mt-1 text-sm text-zinc-500">Pedido de {safeOrder.customer_name} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(safeOrder.created_at))}</p>
          </div>
          <a href={`https://wa.me/55169992445413?text=${encodeURIComponent(["TESTE DE PEDIDO — Açaí Delivery", `Pedido: ${safeOrder.id}`, `Cliente: ${safeOrder.customer_name}`, `Telefone: ${safeOrder.customer_phone}`, `Tipo: ${safeOrder.delivery_type === "delivery" ? "Entrega" : "Retirada"}`, safeOrder.delivery_type === "delivery" ? `Endereço: ${safeOrder.address || ""}, ${safeOrder.address_number || ""} ${safeOrder.complement || ""}`.trim() : "", `Pagamento: ${paymentLabels[safeOrder.payment_method] ?? safeOrder.payment_method}`, `Status: ${statusLabels[safeOrder.status] ?? safeOrder.status}`, "Itens:", ...safeItems.map((item) => `- ${item.quantity}x ${item.product_name}: ${money(item.total)}`), `Subtotal: ${money(safeOrder.subtotal)}`, `Entrega: ${money(safeOrder.delivery_fee)}`, `TOTAL: ${money(safeOrder.total)}`, safeOrder.notes ? `Observações: ${safeOrder.notes}` : ""].filter(Boolean).join("\n"))}`} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">Enviar teste pelo WhatsApp</a>
          <Link href="/admin" className="inline-flex w-fit rounded-xl bg-white px-4 py-3 text-sm font-bold text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50">Lista de pedidos</Link>
        </header>

        <div className="mt-6">
          <OrderStatusControls orderId={safeOrder.id} currentStatus={safeOrder.status} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cliente</p>
            <h2 className="mt-3 text-xl font-bold text-zinc-950">{safeOrder.customer_name}</h2>
            <p className="mt-2 text-sm text-zinc-600">{safeOrder.customer_phone}</p>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Entrega ou retirada</p>
            <h2 className="mt-3 text-lg font-bold text-zinc-950">{safeOrder.delivery_type === "delivery" ? "Entrega" : "Retirada na loja"}</h2>
            {safeOrder.delivery_type === "delivery" ? <p className="mt-2 text-sm leading-6 text-zinc-600">{safeOrder.address || "Endereço não informado"}{safeOrder.address_number ? ", " + safeOrder.address_number : ""}{safeOrder.complement ? " — " + safeOrder.complement : ""}</p> : null}
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pagamento</p>
            <h2 className="mt-3 text-lg font-bold text-zinc-950">{paymentLabels[safeOrder.payment_method] ?? safeOrder.payment_method}</h2>
            <p className="mt-2 text-sm text-zinc-500">Status: {statusLabels[safeOrder.status] ?? safeOrder.status}</p>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-100">
          <div className="border-b border-zinc-100 px-6 py-5">
            <h2 className="text-lg font-bold text-zinc-950">Itens do pedido</h2>
          </div>
          {itemsError ? <p className="p-6 text-sm text-red-700">Erro ao carregar itens: {itemsError.message}</p> : null}
          <div className="divide-y divide-zinc-100">
            {safeItems.length ? safeItems.map((item) => {
              const options = selectedOptionsText(item.selected_options);
              return (
                <div key={item.id} className="flex items-start justify-between gap-4 px-6 py-5">
                  <div>
                    <p className="font-bold text-zinc-950">{item.quantity}× {item.product_name}</p>
                    <p className="mt-1 text-sm text-zinc-500">Unitário: {money(item.unit_price)}</p>
                    {options.length ? <p className="mt-2 text-sm text-zinc-600">Adicionais: {options.join(", ")}</p> : null}
                  </div>
                  <p className="shrink-0 font-bold text-zinc-950">{money(item.total)}</p>
                </div>
              );
            }) : <p className="px-6 py-8 text-sm text-zinc-500">Nenhum item encontrado para este pedido.</p>}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Observações do cliente</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{safeOrder.notes || "Nenhuma observação informada."}</p>
          </section>
          <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm">
            <div className="flex justify-between text-sm text-zinc-300"><span>Subtotal</span><span>{money(safeOrder.subtotal)}</span></div>
            <div className="mt-3 flex justify-between text-sm text-zinc-300"><span>Taxa de entrega</span><span>{money(safeOrder.delivery_fee)}</span></div>
            <div className="mt-5 flex justify-between border-t border-white/10 pt-5"><span className="text-lg font-bold">Total</span><span className="text-2xl font-black">{money(safeOrder.total)}</span></div>
          </section>
        </div>
      </div>
    </main>
  );
}
