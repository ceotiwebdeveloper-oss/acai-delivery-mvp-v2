"use client";

import { useState } from "react";

type Category = { id: string; name: string };

type Props = {
  storeName: string;
  slug: string;
  isOpen: boolean;
  categories: Category[];
};

export default function StoreHeaderActions({ storeName, slug, isOpen, categories }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function searchProducts(value: string) {
    setQuery(value);
    const term = value.trim().toLocaleLowerCase("pt-BR");
    document.querySelectorAll<HTMLElement>("[data-product-name]").forEach((card) => {
      const name = card.dataset.productName ?? "";
      card.hidden = Boolean(term) && !name.includes(term);
    });
    document.querySelectorAll<HTMLElement>("[data-product-category]").forEach((section) => {
      const cards = section.querySelectorAll<HTMLElement>("[data-product-name]");
      section.hidden = cards.length > 0 && [...cards].every((card) => card.hidden);
    });
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lg text-white shadow-sm transition hover:bg-zinc-800"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >☰</button>
        <div className="text-center">
          <h1 className="text-sm font-bold text-zinc-900">{storeName}</h1>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-xs text-zinc-500">{isOpen ? "Aberta agora" : "Fechada"}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lg text-white shadow-sm transition hover:bg-zinc-800"
          aria-label={searchOpen ? "Fechar pesquisa" : "Pesquisar"}
          aria-expanded={searchOpen}
        >⌕</button>
      </div>
      {menuOpen && (
        <nav aria-label="Menu da loja" className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
          <a onClick={() => setMenuOpen(false)} href="#inicio" className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-zinc-100">Início</a>
          <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Categorias</p>
          {categories.map((category) => (
            <a key={category.id} onClick={() => setMenuOpen(false)} href={`#categoria-${category.id}`} className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-100">{category.name}</a>
          ))}
          <a onClick={() => setMenuOpen(false)} href={`/loja/${slug}/carrinho`} className="mt-2 block rounded-xl px-3 py-2 text-sm font-medium hover:bg-zinc-100">Meu carrinho</a>
        </nav>
      )}
      {searchOpen && (
        <div className="mt-4">
          <label htmlFor="store-product-search" className="mb-2 block text-xs font-medium text-zinc-500">Buscar produtos</label>
          <input
            id="store-product-search"
            autoFocus
            value={query}
            onChange={(event) => searchProducts(event.target.value)}
            placeholder="Ex.: açaí, morango..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          {query && <button type="button" onClick={() => searchProducts("")} className="mt-2 text-xs font-medium text-zinc-600 underline">Limpar pesquisa</button>}
        </div>
      )}
    </header>
  );
}
