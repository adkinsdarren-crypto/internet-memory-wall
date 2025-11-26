// app/checkout/success/page.tsx

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-slate-950/90 px-6 py-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.95)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
          Checkout complete
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Thank you – your tile payment went through. ✨
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Your tile is now reserved on the Internet Memory Wall. You can add or
          update your memory from the main page.
        </p>

        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Back to the wall
        </a>
      </div>
    </main>
  );
}
