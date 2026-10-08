"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Option = {
  id: string;
  name: string;
  price: number;
};

type OptionGroup = {
  id: string;
  name: string;
  required: boolean;
  min_options: number;
  max_options: number;
  options: Option[];
};

type Props = {
  productId: string;
  productName: string;
  basePrice: number;
  optionGroups: OptionGroup[];
};

export default function ProductCustomizer({
  productId,
  productName,
  basePrice,
  optionGroups,
}: Props) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const slug = params.slug;

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  function toggleOption(group: OptionGroup, option: Option) {
    setSelected((current) => {
      const currentOptions = current[group.id] ?? [];

      if (currentOptions.includes(option.id)) {
        return {
          ...current,
          [group.id]: currentOptions.filter(
            (id) => id !== option.id
          ),
        };
      }

      if (group.max_options === 1) {
        return {
          ...current,
          [group.id]: [option.id],
        };
      }

      if (currentOptions.length >= group.max_options) {
        return current;
      }

      return {
        ...current,
        [group.id]: [...currentOptions, option.id],
      };
    });
  }

  const optionsTotal = useMemo(() => {
    return optionGroups.reduce((total, group) => {
      const selectedIds = selected[group.id] ?? [];

      const groupTotal = group.options
        .filter((option) => selectedIds.includes(option.id))
        .reduce(
          (sum, option) => sum + Number(option.price),
          0
        );

      return total + groupTotal;
    }, 0);
  }, [optionGroups, selected]);

  const total = (basePrice + optionsTotal) * quantity;

  const canAdd = optionGroups.every((group) => {
    if (!group.required) {
      return true;
    }

    const selectedCount = selected[group.id]?.length ?? 0;

    return selectedCount >= group.min_options;
  });

  function addToCart() {
    if (!canAdd) {
      return;
    }

    const cartItem = {
      id: crypto.randomUUID(),
      productId,
      productName,
      quantity,
      basePrice,
      selected: optionGroups.reduce<Record<string, { id: string; name: string; price: number }[]>>(
        (result, group) => {
          const chosen = group.options
            .filter((option) => (selected[group.id] ?? []).includes(option.id))
            .map((option) => ({
              id: option.id,
              name: option.name,
              price: Number(option.price),
            }));

          if (chosen.length > 0) result[group.name] = chosen;
          return result;
        },
        {}
      ),
      selectedOptionIds: Object.values(selected).flat(),
      total,
    };

    const currentCart = JSON.parse(
      localStorage.getItem("cart") ?? "[]"
    );

    const updatedCart = [...currentCart, cartItem];

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cart-updated"));

    router.push(`/loja/${slug}/carrinho`);
  }

  return (
    <section className="px-5 pt-8">
      {/* OPÇÕES */}
      {optionGroups.map((group) => (
        <div key={group.id} className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-zinc-950">
              {group.name}
            </h3>

            <p className="mt-1 text-xs font-medium text-zinc-600">
              {group.required
                ? `Escolha ${
                    group.min_options === 1
                      ? "uma opção"
                      : "suas opções"
                  }`
                : "Opcional"}
            </p>
          </div>

          <div className="space-y-2">
            {group.options.map((option) => {
              const isSelected =
                selected[group.id]?.includes(option.id) ?? false;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    toggleOption(group, option)
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-400 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </span>

                    <span className="text-sm font-semibold text-zinc-950">
                      {option.name}
                    </span>
                  </div>

                  {Number(option.price) > 0 && (
                    <span className="text-sm font-bold text-zinc-800">
                      + R${" "}
                      {Number(option.price)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* QUANTIDADE */}
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <span className="text-sm font-bold text-zinc-950">
          Quantidade
        </span>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              setQuantity((value) =>
                Math.max(1, value - 1)
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white shadow-sm transition hover:bg-zinc-800"
            aria-label="Diminuir quantidade"
          >
            −
          </button>

          <span className="w-5 text-center text-base font-extrabold text-zinc-950">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((value) => value + 1)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white shadow-sm transition hover:bg-zinc-800"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      {/* ADICIONAR AO CARRINHO */}
      <button
        type="button"
        disabled={!canAdd}
        onClick={addToCart}
        className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-bold transition ${
          canAdd
            ? "bg-zinc-950 text-white hover:bg-zinc-800"
            : "cursor-not-allowed bg-zinc-200 text-zinc-500"
        }`}
      >
        <span>
          {canAdd
            ? "Adicionar ao carrinho"
            : "Escolha as opções obrigatórias"}
        </span>

        <span className="font-extrabold">
          R$ {total.toFixed(2).replace(".", ",")}
        </span>
      </button>
    </section>
  );
}