import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OrderTracking from "./OrderTracking";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string; orderId: string }>;
};

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
  selected_options: Record<string, unknown> | null;
};

type OrderLookup = { order: Order; items: OrderItem[] };

const statusLabels: Record<string, string> = {
  pending: "Recebido",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  card: "Cartão (débito/crédito)",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  cash: "Dinheiro",
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
}

function optionsText(value: Record<string, unknown> | null) {
  if (!value) return [];
  return Object.entries(value).flatMap(([group, options]) => {
    if (!Array.isArray(options)) return [];
    return options.flatMap((option) => {
      if (!option || typeof option !== "object") return [];
      const item = option as Record<string, unknown>;
      if (typeof item.name !== "string") return [];
      const price = Number(item.price) > 0 ? ` (+${money(Number(item.price))})` : "";
      return [`${group}: ${item.name}${price}`];
    });
  });
}

export default async function CustomerOrderPage({ params }: PageProps) {
  await connection();
  const { slug, orderId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_customer_order", {
    p_order_id: orderId,
  });

  if (error || !data || typeof data !== "object") notFound();

  const result = data as unknown as OrderLookup;
  if (!result.order || result.order.id !== orderId) notFound();

  const order = result.order;
  const items = Array.isArray(result.items) ? result.items : [];

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-950">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-3xl bg-white p-6 text-center shadow-sm sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-700" aria-hidden="true">✓</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Acompanhe seu pedido</p>
          <h1 className="mt-2 text-3xl font-black">Tudo certo, {order.customer_name}!</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Acompanhe o andamento do pedido nesta página. O status será atualizado automaticamente.</p>
          <p className="mt-5 break-all rounded-xl bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-600">{order.id}</p>
          <div className="mt-5 inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-800">Status: {statusLabels[order.status] ?? order.status}</div>
        </section>

        <div className="mt-5">
          <OrderTracking orderId={order.id} currentStatus={order.status} />
        </div>

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Resumo do pedido</h2>
          <div className="mt-4 divide-y divide-zinc-100">
            {items.map((item) => {
              const options = optionsText(item.selected_options);
              return (
                <div key={item.id} className="flex justify-between gap-4 py-4">
                  <div>
                    <p className="font-bold">{item.quantity}× {item.product_name}</p>
                    {options.map((option, index) => <p key={index} className="mt-1 text-xs text-zinc-500">{option}</p>)}
                    <p className="mt-1 text-xs text-zinc-500">Unitário: {money(item.unit_price)}</p>
                  </div>
                  <p className="shrink-0 font-bold">{money(item.total)}</p>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 border-t border-zinc-100 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span className="font-semibold">{money(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Entrega</span><span className="font-semibold">{money(order.delivery_fee)}</span></div>
            <div className="flex justify-between pt-2 text-base"><span className="font-black">Total</span><span className="font-black">{money(order.total)}</span></div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Entrega e pagamento</h2>
          <p className="mt-3 text-sm text-zinc-600">{order.delivery_type === "delivery" ? "Entrega" : "Retirada na loja"}</p>
          {order.delivery_type === "delivery" ? <p className="mt-1 text-sm text-zinc-600">{order.address}{order.address_number ? `, ${order.address_number}` : ""}{order.complement ? ` — ${order.complement}` : ""}</p> : null}
          <p className="mt-2 text-sm text-zinc-600">Pagamento: {paymentLabels[order.payment_method] ?? order.payment_method}</p>
          {order.notes ? <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-600">Observação: {order.notes}</p> : null}
        </section>

        <Link href={`/loja/${slug}`} className="mt-5 flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-zinc-800">Voltar para a loja</Link>
      </div>
    </main>
  );
}
