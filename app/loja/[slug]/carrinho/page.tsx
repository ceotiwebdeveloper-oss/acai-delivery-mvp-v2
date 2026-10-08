"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  params: Promise<{
    slug: string;
  }>;
};

export default function CarrinhoPage({ params }: PageProps) {
const [slug, setSlug] = useState("");
const [cart, setCart] = useState<CartItem[]>([]);

useEffect(() => {
  let mounted = true;

  params.then(({ slug }) => {
    if (mounted) {
      setSlug(slug);
    }
  });

  const timer = window.setTimeout(() => {
    try {
      const savedCart: unknown = JSON.parse(localStorage.getItem("cart") ?? "[]");
      if (mounted) setCart(Array.isArray(savedCart) ? savedCart as CartItem[] : []);
    } catch {
      if (mounted) setCart([]);
    }
  }, 0);

  return () => {
    mounted = false;
    window.clearTimeout(timer);
  };
}, [params]);
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.total), 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity,
            total:
              (Number(item.total) / item.quantity) * quantity,
          }
        : item
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
  }

  function removeItem(id: string) {
    const updatedCart = cart.filter((item) => item.id !== id);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto min-h-screen max-w-md bg-white">

        {/* HEADER */}
        <header className="flex items-center gap-4 border-b bg-white px-5 py-4">
          <Link
            href={`/loja/${slug}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xl font-extrabold text-white"
            aria-label="Voltar para a loja"
          >
            ←
          </Link>

          <div>
            <h1 className="text-lg font-bold text-zinc-950">
              Seu carrinho
            </h1>

            <p className="text-xs font-medium text-zinc-500">
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "itens"}
            </p>
          </div>
        </header>

        {/* CARRINHO VAZIO */}
        {cart.length === 0 && (
          <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-4xl">
              🛒
            </div>

            <h2 className="mt-5 text-xl font-bold text-zinc-950">
              Seu carrinho está vazio
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
              Escolha seus produtos favoritos e eles
              aparecerão aqui.
            </p>

            <Link
              href={`/loja/${slug}`}
              className="mt-6 rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white"
            >
              Ver produtos
            </Link>

          </section>
        )}

        {/* ITENS */}
        {cart.length > 0 && (
          <section className="px-5 py-6">

            <div className="space-y-3">
              {cart.map((item) => {
                const unitPrice =
                  Number(item.total) / item.quantity;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">
                        <h2 className="font-bold text-zinc-950">
                          {item.productName}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-zinc-700">
                          R${" "}
                          {unitPrice
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs font-bold text-red-600"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-lg font-bold text-white"
                        >
                          −
                        </button>

                        <span className="w-5 text-center font-extrabold text-zinc-950">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-lg font-bold text-white"
                        >
                          +
                        </button>
                      </div>

                      <strong className="text-base font-extrabold text-zinc-950">
                        R${" "}
                        {Number(item.total)
                          .toFixed(2)
                          .replace(".", ",")}
                      </strong>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* RESUMO */}
            <div className="mt-8 border-t border-zinc-200 pt-5">

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600">
                  Subtotal
                </span>

                <span className="font-bold text-zinc-950">
                  R${" "}
                  {total.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600">
                  Entrega
                </span>

                <span className="text-sm font-bold text-zinc-950">
                  A calcular
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-lg font-bold text-zinc-950">
                  Total
                </span>

                <span className="text-xl font-extrabold text-zinc-950">
                  R${" "}
                  {total.toFixed(2).replace(".", ",")}
                </span>
              </div>

             <Link
  href={`/loja/${slug}/checkout`}
  className="mt-5 block w-full rounded-2xl bg-zinc-950 px-5 py-4 text-center font-semibold text-white"
>
  Continuar para checkout
</Link>

              <Link
                href={`/loja/${slug}`}
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-zinc-200 px-5 py-4 text-sm font-bold text-zinc-950"
              >
                Continuar comprando
              </Link>

            </div>
          </section>
        )}
      </div>
    </main>
  );
}