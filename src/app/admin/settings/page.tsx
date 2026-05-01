const settingGroups = [
  { name: "Store Configuration", detail: "Regional settings, currency, taxes, and shipping defaults." },
  { name: "Payments & Risk", detail: "Gateway keys, fraud checks, and transaction webhooks." },
  { name: "Integrations", detail: "Image CDN, ERP sync, CRM events, and BI exports." },
  { name: "Compliance", detail: "Data retention, privacy workflows, and access governance." },
];

export default function AdminSettingsPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Platform Settings</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">System Configuration</h1>
        <p className="mt-2 text-sm text-muted">
          Centralize operational settings, integrations, and governance controls.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {settingGroups.map((item) => (
          <div key={item.name} className="rounded-xl border border-gold/20 bg-black/30 p-4">
            <p className="text-sm text-gold">{item.name}</p>
            <p className="mt-2 text-xs text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
