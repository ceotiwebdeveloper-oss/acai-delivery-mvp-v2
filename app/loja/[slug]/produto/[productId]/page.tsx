import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCustomizer from "./ProductCustomizer";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string; productId: string }>;
};

type Option = {
  id: string; name: string; price: number; position: number; is_available: boolean;
};

type OptionGroup = {
  id: string; name: string; required: boolean; min_options: number; max_options: number; position: number; options: Option[];
};

function productPhoto(name: string) {
  const value = name.toLocaleLowerCase("pt-BR");
  if (value.includes("sorvete")) return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=90";
  if (value.includes("cupua")) return "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=90";
  if (value.includes("zero")) return "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=90";
  if (value.includes("água") || value.includes("agua")) return "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=90";
  if (value.includes("refrigerante") || value.includes("coca") || value.includes("guaran")) return "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=1200&q=90";
  return "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=90";
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug, productId } = await params;
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase.from("stores").select("id").eq("slug", slug).maybeSingle();
  if (storeError || !store) notFound();

  const { data: product } = await supabase.from("products").select("id,name,description,price,image_url,is_available").eq("id", productId).eq("store_id", store.id).single();

  if (!product || !product.is_available) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f4fa] p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#32103f]">Produto não encontrado</h1>
          <Link href={`/loja/${slug}`} className="mt-4 inline-flex rounded-xl bg-[#35104f] px-4 py-3 text-sm font-bold text-white">← Voltar para a loja</Link>
        </div>
      </main>
    );
  }

  const { data: productGroups } = await supabase.from("product_option_groups").select(`
    option_groups ( id, name, required, min_options, max_options, position,
      options ( id, name, price, position, is_available )
    )
  `).eq("product_id", productId);

  const optionGroups: OptionGroup[] = (productGroups ?? [])
    .map((item) => item.option_groups)
    .filter(Boolean)
    .map((group) => {
      const data = group as unknown as OptionGroup;
      return { ...data, options: [...(data.options ?? [])].filter((option) => option.is_available).sort((a, b) => a.position - b.position) };
    })
    .filter((group) => !group.name.toLocaleLowerCase("pt-BR").includes("adicionais"))
    .sort((a, b) => a.position - b.position);

  const photo = product.image_url || productPhoto(product.name);

  return (
    <main className="min-h-screen bg-[#f8f5fa] text-[#32103f]">
      <div className="mx-auto min-h-screen max-w-xl overflow-hidden bg-white shadow-xl shadow-purple-950/5">
        <header className="flex items-center gap-4 border-b border-[#eee4f3] bg-white px-5 py-4">
          <Link href={`/loja/${slug}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#35104f] text-2xl font-black text-white" aria-label="Voltar para a loja">←</Link>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9a36bd]">Seu pedido</p><h1 className="text-base font-extrabold">Personalize do seu jeito</h1></div>
        </header>

        <section>
          <div className="relative aspect-[5/4] overflow-hidden bg-[#f2eaf6]">
            <Image src={photo} alt={product.name} fill sizes="(max-width: 768px) 100vw, 600px" unoptimized priority className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#210729]/75 to-transparent p-5 pt-16">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">Preparado com carinho 💜</span>
            </div>
          </div>
          <div className="px-5 pt-6">
            <h2 className="text-2xl font-black text-[#32103f]">{product.name}</h2>
            {product.description && <p className="mt-2 text-sm leading-6 text-[#85738e]">{product.description}</p>}
            <p className="mt-4 text-xl font-black text-[#76139a]">R$ {Number(product.price).toFixed(2).replace(".", ",")}</p>
          </div>
        </section>

        <ProductCustomizer productId={product.id} productName={product.name} basePrice={Number(product.price)} optionGroups={optionGroups} />
      </div>
    </main>
  );
}