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
    <div className="cart-bar-fixed">
      <Link
        href={`/loja/${slug}/carrinho`}
        className="cart-bar-link"
        aria-label={`Abrir carrinho: ${itemCount} ${itemCount === 1 ? "item" : "itens"}, total R$ ${total.toFixed(2).replace(".", ",")}`}
      >
        <span className="cart-bar-icon" aria-hidden="true">🛒</span>
        <span className="cart-bar-copy">
          <span className="cart-bar-title">Meu carrinho</span>
          <span className="cart-bar-count" aria-live="polite">
            {itemCount === 0 ? "Seu pedido começa aqui" : `${itemCount} ${itemCount === 1 ? "item" : "itens"} no pedido`}
          </span>
        </span>
        <span className="cart-bar-total">R$ {total.toFixed(2).replace(".", ",")}</span>
        <span className="cart-bar-arrow" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
