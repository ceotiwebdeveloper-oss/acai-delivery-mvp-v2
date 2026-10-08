import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCustomizer from "./ProductCustomizer";

export const instant = false;

type PageProps = {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
};

type Option = {
  id: string;
  name: string;
  price: number;
  position: number;
  is_available: boolean;
};

type OptionGroup = {
  id: string;
  name: string;
  required: boolean;
  min_options: number;
  max_options: number;
  position: number;
  options: Option[];
};

export default async function ProdutoPage({ params }: PageProps) {
  const { slug, productId } = await params;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      is_available
    `)
    .eq("id", productId)
    .single();

  if (!product || !product.is_available) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-950">
            Produto não encontrado
          </h1>

          <Link
            href={`/loja/${slug}`}
            className="mt-4 inline-flex items-center rounded-xl bg-black px-4 py-3 text-sm font-bold text-white"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </main>
    );
  }

  const { data: productGroups } = await supabase
    .from("product_option_groups")
    .select(`
      option_groups (
        id,
        name,
        required,
        min_options,
        max_options,
        position,
        options (
          id,
          name,
          price,
          position,
          is_available
        )
      )
    `)
    .eq("product_id", productId);

  const optionGroups: OptionGroup[] = (productGroups ?? [])
    .map((item) => item.option_groups)
    .filter(Boolean)
    .map((group) => {
      const data = group as unknown as OptionGroup;

      return {
        ...data,
        options: [...(data.options ?? [])]
          .filter((option) => option.is_available)
          .sort((a, b) => a.position - b.position),
      };
    })
    .sort((a, b) => a.position - b.position);

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto min-h-screen max-w-md bg-white">

        {/* HEADER */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#ffffff",
          }}
        >
          <Link
            href={`/loja/${slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "9999px",
              backgroundColor: "#000000",
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: 900,
              textDecoration: "none",
              lineHeight: 1,
            }}
            aria-label="Voltar para a loja"
          >
            ←
          </Link>

          <h1
            style={{
              margin: 0,
              color: "#000000",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            Personalizar
          </h1>
        </header>

        {/* PRODUTO */}
        <section>
          <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-zinc-100 text-7xl">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
            ) : (
              "🍧"
            )}
          </div>

          <div className="px-5 pt-6">
            <h2 className="text-2xl font-bold text-zinc-950">
              {product.name}
            </h2>

            {product.description && (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {product.description}
              </p>
            )}

            <p className="mt-4 text-lg font-extrabold text-zinc-950">
              R${" "}
              {Number(product.price)
                .toFixed(2)
                .replace(".", ",")}
            </p>
          </div>
        </section>

        {/* PERSONALIZAÇÃO */}
        <ProductCustomizer
          productId={product.id}
          productName={product.name}
          basePrice={Number(product.price)}
          optionGroups={optionGroups}
        />

      </div>
    </main>
  );
}