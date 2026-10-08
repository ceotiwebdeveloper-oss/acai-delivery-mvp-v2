import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">
          Sorveteria Água na Boca
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Açaí, sorvetes e muito mais do seu jeito.
        </p>

        <Link
          href="/loja/agua-na-boca"
          className="mt-6 block rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white"
        >
          Acessar loja
        </Link>
      </div>
    </main>
  );
}