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

function readCart(): CartItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("cart") ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        Number.isFinite(Number(item.quantity)) &&
        Number(item.quantity) > 0 &&
        Number.isFinite(Number(item.total))
    );
  } catch {
    return [];
  }
}

export default function CartBar({ slug }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = () => setCart(readCart());

    loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("cart-updated", loadCart);

    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("cart-updated", loadCart);
    };
  }, []);

  const itemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  const total = cart.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-32px)] max-w-md -translate-x-1/2">
      <Link
        href={`/loja/${slug}/carrinho`}
        className="flex w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-xl transition hover:bg-zinc-800"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-hidden="true">🛒</span>
          <div className="text-left">
            <p className="text-sm font-semibold">Seu carrinho</p>
            <p className="text-xs text-zinc-400">{itemCount} {itemCount === 1 ? "item" : "itens"}</p>
          </div>
        </div>
        <span className="text-sm font-semibold">R$ {total.toFixed(2).replace(".", ",")}</span>
      </Link>
    </div>
  );
}
