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
    <header className="sticky top-0 z-20 border-b border-[#eee4f3] bg-white/95 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }}
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="store-navigation-panel"
        >
          <span className="menu-toggle-lines" aria-hidden="true">
            <span /><span /><span />
          </span>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold text-[#32103f]">{storeName}</h1>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-xs text-[#806d88]">{isOpen ? "Aberta agora" : "Fechada"}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }}
          className="menu-toggle"
          aria-label={searchOpen ? "Fechar pesquisa" : "Pesquisar"}
          aria-expanded={searchOpen}
        >
          <span className="text-[25px] leading-none" aria-hidden="true">{searchOpen ? "×" : "⌕"}</span>
        </button>
      </div>

      <div
        id="store-navigation-panel"
        aria-label="Menu da loja"
        aria-hidden={!menuOpen}
        className={`store-menu-panel ${menuOpen ? "is-open" : ""}`}
      >
        <nav className="store-menu-inner">
          <a onClick={() => setMenuOpen(false)} href="#inicio" className="store-menu-link">Início</a>
          <p className="store-menu-heading">Categorias</p>
          {categories.map((category) => (
            <a key={category.id} onClick={() => setMenuOpen(false)} href={`#categoria-${category.id}`} className="store-menu-link">{category.name}</a>
          ))}
          <a onClick={() => setMenuOpen(false)} href={`/loja/${slug}/carrinho`} className="store-menu-link store-menu-cart">Meu carrinho <span aria-hidden="true">→</span></a>
        </nav>
      </div>

      <div className={`store-search-panel ${searchOpen ? "is-open" : ""}`} aria-hidden={!searchOpen}>
        <label htmlFor="store-product-search" className="mb-2 block text-xs font-medium text-[#806d88]">Buscar produtos</label>
        <input
          id="store-product-search"
          autoFocus={searchOpen}
          tabIndex={searchOpen ? 0 : -1}
          value={query}
          onChange={(event) => searchProducts(event.target.value)}
          placeholder="Ex.: açaí, morango..."
          className="w-full rounded-xl border border-[#e7d8ef] bg-[#fcf8ff] px-4 py-3 text-sm text-[#32103f] outline-none focus:border-[#a45cc2]"
        />
        {query && <button type="button" onClick={() => searchProducts("")} className="mt-2 text-xs font-medium text-[#806d88] underline">Limpar pesquisa</button>}
      </div>
    </header>
  );
}
