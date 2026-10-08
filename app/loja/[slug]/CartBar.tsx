"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  quantity: number;
  total: number;
};

type Props = {
  slug: string;
};

export default function CartBar({ slug }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    function loadCart() {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") ?? "[]"
      );

      setCart(savedCart);
    }

    loadCart();

    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  const itemCount = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-32px)] max-w-md -translate-x-1/2">
      <Link
        href={`/loja/${slug}/carrinho`}
        className="flex w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-xl transition hover:bg-zinc-800"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            🛒
          </span>

          <div className="text-left">
            <p className="text-sm font-semibold">
              Seu carrinho
            </p>

            <p className="text-xs text-zinc-400">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>

        <span className="text-sm font-semibold">
          R$ {total.toFixed(2).replace(".", ",")}
        </span>
      </Link>
    </div>
  );
}