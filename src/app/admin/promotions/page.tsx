const activePromotions = [
  { name: "Weekend Premium Bundle", channel: "Sitewide", uplift: "+14.2%", endDate: "2026-05-10" },
  { name: "VIP Repeat Customer Offer", channel: "Email", uplift: "+9.1%", endDate: "2026-05-06" },
  { name: "Cart Rescue Incentive", channel: "Automation", uplift: "+6.7%", endDate: "2026-05-02" },
];

export default function AdminPromotionsPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Promotion Studio</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Offer Governance</h1>
        <p className="mt-2 text-sm text-muted">
          Manage discount programs with margin protection and controlled campaign windows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gold/20 bg-black/30 p-4"><p className="text-xs text-muted">Live Campaigns</p><p className="mt-2 text-2xl text-gold">6</p></div>
        <div className="rounded-xl border border-gold/20 bg-black/30 p-4"><p className="text-xs text-muted">Avg. Redemption</p><p className="mt-2 text-2xl text-gold">23.4%</p></div>
        <div className="rounded-xl border border-gold/20 bg-black/30 p-4"><p className="text-xs text-muted">Margin Impact</p><p className="mt-2 text-2xl text-gold">-3.1%</p></div>
      </div>
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Active Promotions</h2>
        <div className="mt-3 space-y-2">
          {activePromotions.map((promotion) => (
            <div key={promotion.name} className="rounded-lg border border-gold/20 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>{promotion.name}</p>
                <p className="text-gold">{promotion.channel}</p>
              </div>
              <p className="mt-1 text-xs text-muted">Revenue uplift: {promotion.uplift} | Ends: {promotion.endDate}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
