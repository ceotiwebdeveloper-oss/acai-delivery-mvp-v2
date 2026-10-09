import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartBar from "./CartBar";
import StoreHeaderActions from "./StoreHeaderActions";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const productFallbacks = [
  "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=85",
];

export default async function LojaPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select(`
      id, name, description, is_open,
      categories (
        id, name, position,
        products ( id, name, description, price, image_url, is_available, position )
      )
    `)
    .eq("slug", slug)
    .single();

  if (!store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f4fa] px-5">
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6eafa] text-[#8c26b4]" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l-1.5 10h-11L5 9Z"/><path d="M4 9c0-2 2-3 4-2 1-3 5-3 6 0 2-1 5 0 5 2"/><path d="M9 5c-.8-1-.5-2 .3-2.8M14 5c.8-.8.8-1.8.2-2.5"/></svg></span>
          <h1 className="mt-4 text-xl font-black text-[#32103f]">Loja não encontrada</h1>
          <p className="mt-2 text-sm text-[#806d88]">Confira o endereço e tente novamente.</p>
        </div>
      </main>
    );
  }

  const categories = [...(store.categories ?? [])].filter((category) => !category.name.toLocaleLowerCase("pt-BR").includes("adicionais")).sort((a, b) => a.position - b.position);
  let fallbackIndex = 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f5fa] text-[#2d1638]">
      <div className="mx-auto min-h-screen max-w-7xl bg-white pb-28 shadow-[0_0_70px_rgba(54,16,75,.08)]">
        <StoreHeaderActions
          slug={slug}
          storeName={store.name}
          isOpen={store.is_open}
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        />

        <section id="inicio" className="relative isolate overflow-hidden bg-[#210729] text-white">
          <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#210729] via-[#310b3c]/95 to-[#4d1457]/40" />
          <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-fuchsia-600/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 -z-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="grid min-h-[330px] items-center gap-5 px-6 py-10 sm:px-10 md:grid-cols-[1.05fr_.95fr] md:px-14 md:py-12">
            <div className="relative z-10 max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-white/5 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.22em] text-fuchsia-200 sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {store.is_open ? "A loja está aberta" : "Confira nossos horários"}
              </p>
              <p className="text-xs font-extrabold uppercase tracking-[.24em] text-fuchsia-300">Açaí é energia, saúde e felicidade</p>
              <h1 className="mt-3 max-w-lg text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                Seu momento <span className="text-fuchsia-400">mais gostoso</span> do dia.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75 sm:text-base">
                {store.description || "Açaí cremoso, combinações incríveis e muito sabor em cada colherada."}
              </p>
              <a href="#cardapio" className="mt-7 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-fuchsia-700 to-purple-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-fuchsia-950/30 hover:-translate-y-0.5 hover:brightness-110">
                Ver cardápio <span aria-hidden="true" className="text-lg">→</span>
              </a>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/70">
                <span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>Feito com carinho</span><span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>Ingredientes selecionados</span><span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-4.3-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 7-7 11-7 11Z"/><path d="M12 7v8m-3-4h6"/></svg>Sabor de verdade</span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg md:py-4">
              <div className="absolute inset-8 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-2xl shadow-black/30">
                <Image
                  src="https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=90"
                  alt="Frutas frescas para acompanhar seu açaí"
                  width={1200}
                  height={900}
                  priority
                  unoptimized
                  className="h-[220px] w-full rounded-[1.5rem] object-cover sm:h-[300px] md:h-[340px]"
                />
                <div className="absolute bottom-5 left-5 rounded-2xl border border-white/25 bg-[#260b31]/85 px-4 py-3 shadow-xl backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-fuchsia-200">Uma colherada de felicidade</p>
                  <p className="mt-1 text-lg font-black">Monte do seu jeito ✨</p>
                </div>
              </div>
              <div className="absolute -right-2 top-0 hidden -rotate-6 rounded-2xl bg-white px-4 py-3 text-[#40114c] shadow-xl sm:block">
                <p className="text-xs font-bold">Feito na hora</p><p className="text-[10px] text-[#806d88]">Fresquinho pra você</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 border-b border-[#eee4f3] bg-white px-5 py-5 sm:px-10">
          {[
            { icon: "✦", title: "Muito sabor", sub: "Combinações especiais" },
            { icon: "♡", title: "Feito com carinho", sub: "Qualidade em cada pedido" },
            { icon: "⌁", title: "Peça sem complicação", sub: "Escolha seus favoritos" },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6eafa] text-[#8c26b4]" aria-hidden="true">{item.icon === "✦" ? <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg> : item.icon === "♡" ? <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg> : <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.3-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 7-7 11-7 11Z"/><path d="M12 7v8m-3-4h6"/></svg>}</span>
              <div><p className="text-xs font-extrabold sm:text-sm">{item.title}</p><p className="mt-1 hidden text-[11px] text-[#8b7a92] sm:block">{item.sub}</p></div>
            </div>
          ))}
        </section>

        <section id="cardapio" className="px-5 pt-8 sm:px-10 sm:pt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#9a36bd]">Escolha seu favorito</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Nosso cardápio</h2>
              <p className="mt-1 text-sm text-[#85738e]">Uma delícia atrás da outra.</p>
            </div>
            <span className="rounded-full bg-[#f7eafa] px-3 py-2 text-xs font-bold text-[#8122a6]">{categories.length} categorias</span>
          </div>
        </section>

        <nav className="sticky top-[73px] z-20 overflow-x-auto border-y border-[#eee4f3] bg-white/95 px-5 py-3 backdrop-blur sm:px-10">
          <div className="flex w-max gap-2">
            {categories.map((category, index) => (
              <Link key={category.id} href={`#categoria-${category.id}`} className={`rounded-full px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 ${index === 0 ? "bg-[#76139a] text-white shadow-md shadow-purple-900/15" : "bg-[#f6f0f9] text-[#60466c] hover:bg-[#efe0f7]"}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="px-5 pt-7 sm:px-10 sm:pt-9">
          {categories.map((category) => {
            const products = [...(category.products ?? [])].filter((product) => product.is_available).sort((a, b) => a.position - b.position);
            if (products.length === 0) return null;

            return (
              <section key={category.id} data-product-category id={`categoria-${category.id}`} className="mb-10 scroll-mt-36">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div><h2 className="text-xl font-black sm:text-2xl">{category.name}</h2><p className="mt-1 text-xs text-[#8b7a92]">Escolha o seu favorito</p></div>
                  <span className="text-xs font-bold text-[#9a36bd]">{products.length} {products.length === 1 ? "opção" : "opções"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                  {products.map((product) => {
                    const fallback = productFallbacks[fallbackIndex++ % productFallbacks.length];
                    return (
                      <Link key={product.id} data-product-name={product.name.toLocaleLowerCase("pt-BR")} href={`/loja/${slug}/produto/${product.id}`} className="group overflow-hidden rounded-[1.4rem] border border-[#eee4f3] bg-white shadow-[0_5px_18px_rgba(72,28,100,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#d9b6e8] hover:shadow-xl hover:shadow-purple-950/10">
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#f2eaf6]">
                          <Image src={product.image_url || fallback} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-[#76139a] shadow-sm backdrop-blur">Feito com carinho</span>
                        </div>
                        <div className="p-3.5 sm:p-4">
                          <h3 className="line-clamp-2 min-h-10 text-sm font-extrabold text-[#32103f] sm:text-base">{product.name}</h3>
                          {product.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#897794]">{product.description}</p>}
                          <div className="mt-4 flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-[#32103f] sm:text-base">R$ {Number(product.price).toFixed(2).replace(".", ",")}</p>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8516aa] to-[#b12bd0] text-xl font-medium text-white shadow-md shadow-purple-900/20 transition group-hover:scale-110" aria-label={`Ver ${product.name}`}>+</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-10 bg-[#26092f] px-6 py-8 text-white sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-lg font-black">{store.name}</p><p className="mt-1 text-sm text-white/65">Açaí é vida. O seu dia merece esse sabor. 💜</p></div>
            <a href="#inicio" className="w-fit rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10">Voltar ao topo ↑</a>
          </div>
        </footer>
      </div>
      <CartBar slug={slug} />
    </main>
  );
}