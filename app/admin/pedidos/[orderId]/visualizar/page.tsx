import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Props = {
  params: Promise<{
    orderId: string;
  }>;
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
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export default async function ViewOrderPage({ params }: Props) {
  await connection();

  const { orderId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-zinc-950">
            Acesso administrativo
          </h1>

          <Link
            href="/admin/login"
            className="mt-5 inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white"
          >
            Entrar
          </Link>
        </div>
      </main>
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_phone, delivery_type, address, address_number, complement, payment_method, notes, subtotal, delivery_fee, total, status, created_at"
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, product_name, quantity, unit_price, total, selected_options"
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const safeOrder = order as Order;
  const safeItems = (items ?? []) as OrderItem[];

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
            >
              ← Voltar para pedidos
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
              Informações do pedido
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Recebido em {formatDate(safeOrder.created_at)}
            </p>
          </div>

          <Link
            href={`/admin/pedidos/${safeOrder.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800"
          >
            GERENCIAR PEDIDO
            <span>→</span>
          </Link>
        </header>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Status atual
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-orange-500" />

            <span className="text-2xl font-black text-zinc-950">
              {statusLabels[safeOrder.status] ?? safeOrder.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Para alterar o andamento, clique em{" "}
            <strong>Gerenciar pedido</strong>.
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Cliente
            </p>

            <h2 className="mt-3 text-xl font-bold text-zinc-950">
              {safeOrder.customer_name}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              📞 {safeOrder.customer_phone}
            </p>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Entrega
            </p>

            <h2 className="mt-3 text-xl font-bold text-zinc-950">
              {safeOrder.delivery_type === "delivery"
                ? "🚚 Entrega"
                : "🏪 Retirada"}
            </h2>

            {safeOrder.delivery_type === "delivery" && (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {safeOrder.address || "Endereço não informado"}
                {safeOrder.address_number
                  ? `, ${safeOrder.address_number}`
                  : ""}
                {safeOrder.complement
                  ? ` — ${safeOrder.complement}`
                  : ""}
              </p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Pagamento
            </p>

            <h2 className="mt-3 text-xl font-bold text-zinc-950">
              {paymentLabels[safeOrder.payment_method] ??
                safeOrder.payment_method}
            </h2>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-100">
          <div className="border-b border-zinc-100 px-6 py-5">
            <h2 className="text-lg font-bold text-zinc-950">
              Itens do pedido
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Produtos e quantidades.
            </p>
          </div>

          <div className="divide-y divide-zinc-100">
            {safeItems.length === 0 ? (
              <div className="px-6 py-8 text-sm text-zinc-500">
                Nenhum item encontrado.
              </div>
            ) : (
              safeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 px-6 py-5"
                >
                  <div>
                    <p className="font-bold text-zinc-950">
                      {item.quantity}x {item.product_name}
                    </p>

                    {item.selected_options &&
                      Object.keys(item.selected_options).length > 0 && (
                        <p className="mt-2 text-xs text-zinc-500">
                          Personalizações selecionadas
                        </p>
                      )}
                  </div>

                  <p className="shrink-0 font-bold text-zinc-950">
                    {money(item.total)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Observações
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {safeOrder.notes || "Nenhuma observação informada."}
            </p>
          </section>

          <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span>{money(safeOrder.subtotal)}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm text-zinc-400">
              <span>Taxa de entrega</span>
              <span>{money(safeOrder.delivery_fee)}</span>
            </div>

            <div className="mt-5 flex justify-between border-t border-white/10 pt-5">
              <span className="text-lg font-bold">Total</span>

              <span className="text-2xl font-black">
                {money(safeOrder.total)}
              </span>
            </div>

            <Link
              href={`/admin/pedidos/${safeOrder.id}`}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-zinc-950 transition hover:bg-zinc-200"
            >
              GERENCIAR PEDIDO →
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}