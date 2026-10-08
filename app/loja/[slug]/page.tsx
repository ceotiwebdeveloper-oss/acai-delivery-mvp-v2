import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartBar from "./CartBar";
import StoreHeaderActions from "./StoreHeaderActions";

export const instant = false;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LojaPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select(`
      id,
      name,
      description,
      is_open,
      categories (
        id,
        name,
        position,
        products (
          id,
          name,
          description,
          price,
          image_url,
          is_available,
          position
        )
      )
    `)
    .eq("slug", slug)
    .single();

  if (!store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <h1 className="text-xl font-bold text-zinc-950">
          Loja não encontrada
        </h1>
      </main>
    );
  }

  const categories = [...(store.categories ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto min-h-screen max-w-md bg-white pb-24 shadow-sm">

        {/* HEADER */}
        <StoreHeaderActions
          storeName={store.name}
          isOpen={store.is_open}
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        />

        {/* APRESENTAÇÃO */}
        <section id="inicio" className="px-5 pb-5 pt-6">
          <p className="mb-2 text-sm font-medium text-zinc-500">
            Bem-vindo 👋
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
            {store.description}
          </h2>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <span className="text-lg text-zinc-700">
              ⌕
            </span>

            <span className="text-sm text-zinc-400">
              O que você está procurando?
            </span>
          </div>
        </section>

        {/* CATEGORIAS */}
        <nav className="sticky top-[73px] z-10 overflow-x-auto border-y bg-white px-5 py-3">
          <div className="flex w-max gap-2">
            {categories.map((category, index) => (
             <Link
  key={category.id}
  href={`#categoria-${category.id}`}
  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
    index === 0
      ? "bg-zinc-900 text-white"
      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
  }`}
>
  {category.name}
</Link>
            ))}
          </div>
        </nav>

        {/* PRODUTOS */}
        <div className="px-5 pt-6">
          {categories.map((category) => {
            const products = [...(category.products ?? [])]
              .filter((product) => product.is_available)
              .sort((a, b) => a.position - b.position);

            if (products.length === 0) {
              return null;
            }

            return (
              <section
                key={category.id}
                data-product-category
                id={`categoria-${category.id}`}
                className="mb-9 scroll-mt-36"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-zinc-950">
                    {category.name}
                  </h2>

                  <p className="mt-1 text-xs text-zinc-400">
                    Escolha o seu favorito
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      data-product-name={product.name.toLocaleLowerCase("pt-BR")}
                      href={`/loja/${slug}/produto/${product.id}`}
                      className="group overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="relative aspect-square overflow-hidden bg-zinc-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 250px"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-5xl">
                            🍧
                          </div>
                        )}
                      </div>

                      <div className="p-3.5">
                        <h3 className="line-clamp-2 min-h-10 text-sm font-bold text-zinc-900">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-zinc-950">
                            R${" "}
                            {Number(product.price)
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>

                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-lg font-medium text-white transition group-hover:scale-105"
                            aria-label={`Adicionar ${product.name}`}
                          >
                            +
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <CartBar slug={slug} />
    </main>
  );
}