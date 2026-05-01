const fulfillmentRows = [
  { hub: "Nairobi Main Hub", backlog: 31, sla: "94.2%", risk: "Medium" },
  { hub: "Mombasa Partner Hub", backlog: 12, sla: "96.1%", risk: "Low" },
  { hub: "Kisumu Satellite Hub", backlog: 19, sla: "91.7%", risk: "Medium" },
];

export default function AdminFulfillmentPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Fulfillment Desk</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Warehouse & Delivery Ops</h1>
        <p className="mt-2 text-sm text-muted">
          Track pick-pack-ship throughput and carrier performance for customer promise accuracy.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gold/20 bg-black/30 p-4"><p className="text-xs text-muted">Unfulfilled Orders</p><p className="mt-2 text-2xl text-gold">62</p></div>
        <div className="rounded-xl border border-gold/20 bg-black/30 p-4"><p className="text-xs text-muted">On-time Shipment Rate</p><p className="mt-2 text-2xl text-gold">95.0%</p></div>
        <div className="rounded-xl border border-gold/20 bg-black/30 p-4"><p className="text-xs text-muted">Average Dispatch Time</p><p className="mt-2 text-2xl text-gold">13.4 hrs</p></div>
      </div>
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Hub Performance</h2>
        <div className="mt-3 space-y-2">
          {fulfillmentRows.map((row) => (
            <div key={row.hub} className="rounded-lg border border-gold/20 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>{row.hub}</p>
                <p className="text-gold">SLA {row.sla}</p>
              </div>
              <p className="mt-1 text-xs text-muted">Backlog: {row.backlog} orders | Risk level: {row.risk}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
