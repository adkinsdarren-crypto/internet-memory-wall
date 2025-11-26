export default function CancelPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950/90 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.95)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400/90">
          Checkout cancelled
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Payment cancelled – your tile is not reserved yet.
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          No charge was made. If you’d still like to claim a tile on the wall,
          you can go back and start the checkout again.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Back to the wall
          </a>
        </div>
      </div>
    </main>
  );
}
