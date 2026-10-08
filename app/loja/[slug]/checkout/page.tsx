"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CartItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  basePrice: number;
  selected: Record<string, unknown>;
  selectedOptionIds?: string[];
  total: number;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 2) {
    return numbers.length ? `(${numbers}` : "";
  }

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

export default function CheckoutPage({ params }: PageProps) {
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const timer = window.setTimeout(() => {
      params.then(({ slug }) => {
        if (mounted) {
          setSlug(slug);
        }
      });

      const savedCart = localStorage.getItem("cart");

      if (!mounted) return;

      try {
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch {
        setCart([]);
      }
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [params]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.total), 0),
    [cart]
  );

  const deliveryFee = deliveryType === "delivery" ? 5 : 0;
  const total = subtotal + deliveryFee;

  const canSubmit =
    name.trim().length > 0 &&
    phone.replace(/\D/g, "").length >= 10 &&
    cart.length > 0 &&
    (deliveryType === "pickup" ||
      (address.trim().length > 0 && addressNumber.trim().length > 0));

  async function finalizeOrder() {
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (storeError) {
        throw new Error(`Erro ao localizar a loja: ${storeError.message}`);
      }

      if (!store) {
        throw new Error("Loja não encontrada.");
      }

      const { data: orderId, error: orderError } = await supabase.rpc(
        "create_customer_order",
        {
          p_store_slug: slug,
          p_customer_name: name.trim(),
          p_customer_phone: phone.trim(),
          p_delivery_type: deliveryType,
          p_address: deliveryType === "delivery" ? address.trim() : null,
          p_address_number: deliveryType === "delivery" ? addressNumber.trim() : null,
          p_complement:
            deliveryType === "delivery" && complement.trim()
              ? complement.trim()
              : null,
          p_payment_method: paymentMethod,
          p_notes: notes.trim() || null,
          p_items: cart.map((item) => ({
            product_id: item.productId,
            quantity: Number(item.quantity),
            selected_option_ids: Array.isArray(item.selectedOptionIds)
              ? item.selectedOptionIds
              : [],
          })),
        }
      );

      if (orderError) {
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }

      if (typeof orderId !== "string" || !orderId) {
        throw new Error("O banco não retornou o identificador do pedido.");
      }

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));

      router.replace(`/loja/${slug}/pedido/${orderId}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível finalizar o pedido. Tente novamente.";

      console.error("ERRO AO FINALIZAR PEDIDO:", message);
      setError(message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="mx-auto min-h-screen max-w-md bg-white pb-10">
        <header className="flex items-center gap-4 border-b border-zinc-200 bg-white px-5 py-4">
          <Link
            href={`/loja/${slug}/carrinho`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-xl font-bold text-white"
            aria-label="Voltar para o carrinho"
          >
            ←
          </Link>

          <div>
            <h1 className="text-lg font-bold text-zinc-950">Checkout</h1>
            <p className="text-xs text-zinc-500">Finalize seu pedido</p>
          </div>
        </header>

        <div className="space-y-8 px-5 py-6">
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Seus dados</h2>

            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome completo"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
              />

              <input
                value={phone}
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                placeholder="Telefone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">Entrega</h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType("delivery")}
                className={`rounded-2xl border p-4 text-left ${
                  deliveryType === "delivery"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-950"
                }`}
              >
                <p className="font-bold">Entrega</p>
                <p className="mt-1 text-xs opacity-70">Receba em casa</p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType("pickup")}
                className={`rounded-2xl border p-4 text-left ${
                  deliveryType === "pickup"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-950"
                }`}
              >
                <p className="font-bold">Retirada</p>
                <p className="mt-1 text-xs opacity-70">Retire na loja</p>
              </button>
            </div>

            {deliveryType === "delivery" && (
              <div className="mt-4 space-y-3">
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Endereço"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={addressNumber}
                    onChange={(event) => setAddressNumber(event.target.value)}
                    placeholder="Número"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
                  />

                  <input
                    value={complement}
                    onChange={(event) => setComplement(event.target.value)}
                    placeholder="Complemento"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              Forma de pagamento
            </h2>

            <div className="mt-4 space-y-3">
              {[
                {
                  value: "pix",
                  label: "PIX",
                  description: "QR Code demonstrativo para testes",
                },
                {
                  value: "debit_card",
                  label: "Cartão de débito",
                  description: "Pagamento com cartão de débito",
                },
                {
                  value: "credit_card",
                  label: "Cartão de crédito",
                  description: "Pagamento com cartão de crédito",
                },
                {
                  value: "cash",
                  label: "Dinheiro",
                  description: "Pagamento na entrega",
                },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
                    paymentMethod === method.value
                      ? "border-zinc-950 bg-zinc-50"
                      : "border-zinc-300 bg-white"
                  }`}
                  aria-pressed={paymentMethod === method.value}
                >
                  <div>
                    <p className="font-bold text-zinc-950">{method.label}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {method.description}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                      paymentMethod === method.value
                        ? "border-zinc-950 bg-zinc-950"
                        : "border-zinc-300 bg-white"
                    }`}
                  />
                </button>
              ))}

              {paymentMethod === "pix" && (
                <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center">
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-800">
                    Modo de teste
                  </span>
                  <h3 className="mt-3 font-bold text-zinc-950">
                    QR Code Pix demonstrativo
                  </h3>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=DEMO-PIX-NAO-REAL-NAO-PAGAR"
                    alt="QR Code demonstrativo de teste, sem cobrança real"
                    width={220}
                    height={220}
                    className="mx-auto mt-3 rounded-xl border border-amber-200 bg-white p-2"
                  />
                  <p className="mt-3 text-sm font-semibold text-amber-900">
                    Este QR Code é apenas ilustrativo. Não transfere dinheiro e
                    não confirma pagamentos.
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    O Pix automático real será ativado quando a integração com
                    um provedor de pagamentos estiver configurada.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">Observação</h2>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Alguma observação para o pedido?"
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
            />
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              Resumo do pedido
            </h2>

            <div className="mt-4 rounded-2xl bg-zinc-50 p-5 text-zinc-950">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="font-medium text-zinc-700">
                      {item.quantity}x {item.productName}
                    </span>

                    <span className="font-bold text-zinc-950">
                      R$ {Number(item.total).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-zinc-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-zinc-600">Subtotal</span>
                  <span className="font-bold text-zinc-950">
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="font-medium text-zinc-600">Entrega</span>
                  <span className="font-bold text-zinc-950">
                    {deliveryFee === 0
                      ? "Grátis"
                      : `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-300 pt-4">
                  <span className="text-base font-extrabold text-zinc-950">
                    Total
                  </span>

                  <span className="text-xl font-extrabold text-zinc-950">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={finalizeOrder}
            className={`w-full rounded-2xl px-5 py-4 text-sm font-bold ${
              canSubmit && !loading
                ? "bg-zinc-950 text-white"
                : "cursor-not-allowed bg-zinc-200 text-zinc-500"
            }`}
          >
            {loading ? "Enviando pedido..." : "Finalizar pedido"}
          </button>
        </div>
      </div>
    </main>
  );
}
