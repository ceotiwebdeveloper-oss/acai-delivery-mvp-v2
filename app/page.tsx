import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-100 p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-200/60 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-violet-200/70 blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-2xl shadow-purple-950/10 backdrop-blur">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 text-4xl shadow-lg shadow-purple-900/20">
          <svg aria-hidden="true" viewBox="0 0 64 64" className="h-12 w-12" fill="none">\n            <path d="M13 20h38l-4 31H17l-4-31Z" fill="white" fillOpacity=".96" />\n            <path d="M13 20h38l-4 31H17l-4-31Z" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round" />\n            <path d="M18 25h28l-3 22H21l-3-22Z" fill="#7C3AED" />\n            <path d="M20 29c6-5 12 5 18 0s7 1 8 2l-3 16H21l-1-18Z" fill="#C084FC" />\n            <path d="M19 16c0-4 4-7 8-7 2-5 10-5 12 0 5 0 8 3 8 7v4H19v-4Z" fill="#F5D0FE" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round" />\n            <path d="M28 12c-2 3-2 5 0 7m8-8c-2 3-2 5 0 7" stroke="#A21CAF" strokeWidth="2" strokeLinecap="round" />\n            <path d="M25 33h14" stroke="white" strokeWidth="2" strokeLinecap="round" />\n          </svg>
        </div>

        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-purple-700">
          Feito para adoçar seu dia
        </p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">
          Sorveteria Água na Boca
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">
          Açaí, sorvetes e combinações do seu jeito. Seu próximo favorito está a um toque de distância.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold text-purple-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
          Sabor, frescor e felicidade
        </div>

        <Link
          href="/loja/agua-na-boca"
          className="group mt-6 flex items-center justify-center gap-3 rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-purple-950/20 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Acessar loja
          <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <p className="mt-5 text-[11px] font-medium tracking-wide text-zinc-400">PEÇA FÁCIL · APROVEITE CADA COLHERADA</p>
      </div>
    </main>
  );
}