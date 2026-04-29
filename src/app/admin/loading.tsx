export default function AdminLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded border border-gold/20 bg-white/5" />
        ))}
      </div>
    </section>
  );
}

