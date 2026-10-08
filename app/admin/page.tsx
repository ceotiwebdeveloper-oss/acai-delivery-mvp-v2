import Link from "next/link";
import OrderActions from "@/app/admin/OrderActions";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
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

function formatMoney(value: number) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "preparing":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "out_for_delivery":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-orange-200 bg-orange-50 text-orange-700";
  }
}

function statusDot(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-blue-500";
    case "preparing":
      return "bg-amber-500";
    case "out_for_delivery":
      return "bg-violet-500";
    case "completed":
      return "bg-emerald-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-orange-500";
  }
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Sorveteria Água na Boca
          </p>

          <h1 className="mt-3 text-2xl font-bold text-zinc-950">
            Área administrativa
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Faça login para acessar os pedidos.
          </p>

          <Link
            href="/admin/login"
            className="mt-6 inline-flex rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Entrar no painel
          </Link>
        </div>
      </main>
    );
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_phone, delivery_type, payment_method, total, status, created_at"
    )
    .order("created_at", { ascending: false });

  const safeOrders = (orders ?? []) as Order[];

  const pendingCount = safeOrders.filter(
    (order) => order.status === "pending"
  ).length;

  const activeCount = safeOrders.filter((order) =>
    ["confirmed", "preparing", "out_for_delivery"].includes(order.status)
  ).length;

  const completedCount = safeOrders.filter(
    (order) => order.status === "completed"
  ).length;

  const revenue = safeOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <p className="text-sm font-semibold text-zinc-600">
                Sorveteria Água na Boca
              </p>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
              Painel administrativo
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Acompanhe e gerencie os pedidos da sua loja.
            </p>
          </div>

          <Link
            href="/loja/agua-na-boca"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-50"
          >
            Ver loja
            <span>↗</span>
          </Link>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Erro ao carregar pedidos: {error.message}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-medium text-zinc-500">
              Total de pedidos
            </p>
            <p className="mt-3 text-3xl font-bold text-zinc-950">
              {safeOrders.length}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Pedidos registrados
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-medium text-zinc-500">
              Aguardando atenção
            </p>
            <p className="mt-3 text-3xl font-bold text-orange-600">
              {pendingCount}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Novos pedidos
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-medium text-zinc-500">
              Em andamento
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-600">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Produção ou entrega
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-medium text-zinc-500">
              Faturamento
            </p>
            <p className="mt-3 text-3xl font-bold text-zinc-950">
              {formatMoney(revenue)}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {completedCount} concluído(s)
            </p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-100">
          <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-zinc-950">
              Pedidos recentes
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Consulte as informações do pedido antes de gerenciá-lo.
            </p>
          </div>

          {safeOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-zinc-900">
                Nenhum pedido ainda
              </p>
            </div>
          ) : (
            <div className="space-y-3 bg-zinc-50/70 p-3 sm:p-4">
              {safeOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-bold text-white">
                        {initials(order.customer_name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-zinc-950">
                            {order.customer_name}
                          </p>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusClasses(
                              order.status
                            )}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${statusDot(
                                order.status
                              )}`}
                            />

                            {statusLabels[order.status] ?? order.status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                            📞 {order.customer_phone}
                          </span>

                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                            {order.delivery_type === "delivery"
                              ? "🚚 Entrega"
                              : "🏪 Retirada"}
                          </span>

                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                            💳{" "}
                            {paymentLabels[order.payment_method] ??
                              order.payment_method}
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-zinc-400">
                          Recebido em {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center lg:min-w-[250px] lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                      <div className="text-left lg:text-right">
                        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                          Total
                        </p>

                        <p className="mt-1 text-2xl font-black text-zinc-950">
                          {formatMoney(order.total)}
                        </p>
                      </div>

                      <OrderActions orderId={order.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}