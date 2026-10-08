import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function PedidoAdminPage({
  params,
}: PageProps) {
  const { orderId } = await params;

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return (
      <main className="min-h-screen bg-zinc-100 p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin"
            className="text-sm font-bold text-zinc-600"
          >
            ← Voltar para pedidos
          </Link>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-xl font-black text-zinc-950">
              Pedido não encontrado
            </h1>
          </div>
        </div>
      </main>
    );
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <Link
            href="/admin"
            className="text-sm font-bold text-zinc-600"
          >
            ← Voltar para pedidos
          </Link>

          <h1 className="mt-3 text-2xl font-black text-zinc-950">
            Pedido
          </h1>

          <p className="mt-1 break-all text-xs text-zinc-500">
            {order.id}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl space-y-5 px-5 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Cliente
          </p>

          <h2 className="mt-2 text-xl font-black text-zinc-950">
            {order.customer_name}
          </h2>

          <p className="mt-2 text-sm font-medium text-zinc-700">
            Telefone: {order.customer_phone}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Entrega
          </p>

          <p className="mt-3 font-bold text-zinc-950">
            {order.delivery_type === "delivery"
              ? "Entrega"
              : "Retirada na loja"}
          </p>

          {order.delivery_type === "delivery" && (
            <div className="mt-3 space-y-1 text-sm text-zinc-700">
              <p>{order.address}</p>

              <p>
                Número: {order.address_number}
              </p>

              {order.complement && (
                <p>
                  Complemento: {order.complement}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Itens
          </p>

          <div className="mt-4 divide-y divide-zinc-200">
            {(items ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-bold text-zinc-950">
                    {item.quantity}x {item.product_name}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    R${" "}
                    {Number(item.unit_price)
                      .toFixed(2)
                      .replace(".", ",")}{" "}
                    cada
                  </p>
                </div>

                <p className="font-black text-zinc-950">
                  R${" "}
                  {Number(item.total)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Pagamento
          </p>

          <p className="mt-2 font-bold text-zinc-950">
            {order.payment_method}
          </p>

          {order.notes && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Observação
              </p>

              <p className="mt-2 text-sm text-zinc-700">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-zinc-950 p-5 text-white">
          <div className="flex justify-between text-sm text-zinc-300">
            <span>Subtotal</span>
            <span>
              R${" "}
              {Number(order.subtotal)
                .toFixed(2)
                .replace(".", ",")}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm text-zinc-300">
            <span>Entrega</span>
            <span>
              R${" "}
              {Number(order.delivery_fee)
                .toFixed(2)
                .replace(".", ",")}
            </span>
          </div>

          <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
            <span className="font-bold">Total</span>

            <span className="text-xl font-black">
              R${" "}
              {Number(order.total)
                .toFixed(2)
                .replace(".", ",")}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}