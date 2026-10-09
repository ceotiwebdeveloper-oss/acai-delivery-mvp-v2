"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Option = { id: string; name: string; price: number };
type OptionGroup = { id: string; name: string; required: boolean; min_options: number; max_options: number; options: Option[] };
type Props = { productId: string; productName: string; basePrice: number; optionGroups: OptionGroup[] };

function optionPhoto(name: string) {
  const value = name.toLocaleLowerCase("pt-BR");
  if (value.includes("tradicional") || value.includes("açaí") || value.includes("acai")) return "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=240&q=80";
  if (value.includes("zero")) return "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=240&q=80";
  if (value.includes("cupua")) return "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=240&q=80";
  if (value.includes("morango") || value.includes("morango")) return "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=240&q=80";
  if (value.includes("banana")) return "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=240&q=80";
  if (value.includes("granola")) return "https://images.unsplash.com/photo-1517093157656-b9ec娱乐招商?auto=format&fit=crop&w=240&q=80".replace("b9ec%E5%95%86","b9ec");
  if (value.includes("chocolate") || value.includes("choc")) return "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=240&q=80";
  if (value.includes("leite em pó") || value.includes("leite ninho")) return "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=240&q=80";
  if (value.includes("baunilha") || value.includes("creme")) return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=240&q=80";
  return "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=240&q=80";
}

export default function ProductCustomizer({ productId, productName, basePrice, optionGroups }: Props) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  function toggleOption(group: OptionGroup, option: Option) {
    setSelected((current) => {
      const currentOptions = current[group.id] ?? [];
      if (currentOptions.includes(option.id)) return { ...current, [group.id]: currentOptions.filter((id) => id !== option.id) };
      if (group.max_options === 1) return { ...current, [group.id]: [option.id] };
      if (currentOptions.length >= group.max_options) return current;
      return { ...current, [group.id]: [...currentOptions, option.id] };
    });
  }

  const optionsTotal = useMemo(() => optionGroups.reduce((total, group) => {
    const selectedIds = selected[group.id] ?? [];
    return total + group.options.filter((option) => selectedIds.includes(option.id)).reduce((sum, option) => sum + Number(option.price), 0);
  }, 0), [optionGroups, selected]);

  const total = (basePrice + optionsTotal) * quantity;
  const canAdd = optionGroups.every((group) => !group.required || (selected[group.id]?.length ?? 0) >= group.min_options);

  function addToCart() {
    if (!canAdd) return;
    const cartItem = {
      id: crypto.randomUUID(), productId, productName, quantity, basePrice,
      selected: optionGroups.reduce<Record<string, { id: string; name: string; price: number }[]>>((result, group) => {
        const chosen = group.options.filter((option) => (selected[group.id] ?? []).includes(option.id)).map((option) => ({ id: option.id, name: option.name, price: Number(option.price) }));
        if (chosen.length > 0) result[group.name] = chosen;
        return result;
      }, {}),
      selectedOptionIds: Object.values(selected).flat(), total,
    };
    const currentCart = JSON.parse(localStorage.getItem("cart") ?? "[]");
    localStorage.setItem("cart", JSON.stringify([...currentCart, cartItem]));
    window.dispatchEvent(new Event("cart-updated"));
    router.push(`/loja/${slug}/carrinho`);
  }

  return (
    <section className="px-5 pb-8 pt-8">
      {optionGroups.map((group) => (
        <div key={group.id} className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-black text-[#32103f]">{group.name}</h3>
            <p className="mt-1 text-xs font-medium text-[#85738e]">{group.required ? `Escolha ${group.min_options === 1 ? "uma opção" : "suas opções"}` : "Opcional"}</p>
          </div>
          <div className="space-y-2.5">
            {group.options.map((option) => {
              const isSelected = selected[group.id]?.includes(option.id) ?? false;
              return (
                <button key={option.id} type="button" onClick={() => toggleOption(group, option)} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-px ${isSelected ? "border-[#9b35ba] bg-[#fbf3ff] ring-1 ring-[#9b35ba]/20" : "border-[#eee4f3] bg-white hover:border-[#d9b6e8]"}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f2eaf6]">
                      <Image src={optionPhoto(option.name)} alt={option.name} fill sizes="64px" unoptimized className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-[#32103f]">{option.name}</span>
                      <span className="mt-1 block text-[11px] text-[#95849d]">{isSelected ? "Selecionado" : "Toque para escolher"}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {Number(option.price) > 0 && <span className="text-xs font-extrabold text-[#76139a]">+ R$ {Number(option.price).toFixed(2).replace(".", ",")}</span>}
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-black ${isSelected ? "border-[#8516aa] bg-[#8516aa] text-white" : "border-[#d9c9e1] bg-white text-transparent"}`}>✓</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#eee4f3] bg-[#fbf7fd] p-4">
        <span className="text-sm font-extrabold text-[#32103f]">Quantidade</span>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e2f7] text-lg font-bold text-[#6c1989]" aria-label="Diminuir quantidade">−</button>
          <span className="w-5 text-center text-base font-extrabold text-[#32103f]">{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => value + 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#76139a] text-lg font-bold text-white shadow-md shadow-purple-900/15" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>

      <button type="button" disabled={!canAdd} onClick={addToCart} className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-extrabold transition ${canAdd ? "bg-gradient-to-r from-[#76139a] to-[#a52bc5] text-white shadow-lg shadow-purple-900/20 hover:-translate-y-0.5 hover:brightness-110" : "cursor-not-allowed bg-[#eee8f1] text-[#9b8da3]"}`}>
        <span>{canAdd ? "Adicionar ao carrinho" : "Escolha as opções obrigatórias"}</span>
        <span className="font-black">R$ {total.toFixed(2).replace(".", ",")}</span>
      </button>
    </section>
  );
}