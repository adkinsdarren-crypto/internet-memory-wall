import Link from "next/link";

export default function M2Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="max-w-md text-center space-y-4 px-4">
        <h1 className="text-3xl font-bold tracking-tight">M² is coming soon</h1>
        <p className="text-slate-400">
          The second wall isn&apos;t open yet. For now, you can explore and
          claim tiles on the main wall.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-2 text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          ← Back to the main wall
        </Link>
      </div>
    </main>
  );
}
