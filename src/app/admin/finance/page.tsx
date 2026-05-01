const financeLines = [
  { label: "Gross Sales (MTD)", value: "Ksh 6,980,000" },
  { label: "Refunds (MTD)", value: "Ksh 184,000" },
  { label: "Gateway Fees", value: "Ksh 132,500" },
  { label: "Net Collected", value: "Ksh 6,663,500" },
];

export default function AdminFinancePage() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Finance Console</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Revenue & Reconciliation</h1>
        <p className="mt-2 text-sm text-muted">
          Validate transaction health, payouts, and merchant settlements.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {financeLines.map((line) => (
          <div key={line.label} className="rounded-xl border border-gold/20 bg-black/30 p-4">
            <p className="text-xs text-muted">{line.label}</p>
            <p className="mt-2 text-xl text-gold">{line.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
