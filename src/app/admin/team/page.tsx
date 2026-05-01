const teamMembers = [
  { name: "Amina Yusuf", role: "SUPER_ADMIN", scope: "Global", lastSeen: "Today 14:22" },
  { name: "Brian Ochieng", role: "ADMIN", scope: "Catalog + Orders", lastSeen: "Today 11:06" },
  { name: "Linet Wanjiru", role: "STAFF", scope: "Customer Care", lastSeen: "Yesterday 18:41" },
];

export default function AdminTeamPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Access Control</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Team & Permissions</h1>
        <p className="mt-2 text-sm text-muted">
          Manage admin access boundaries and operational ownership by function.
        </p>
      </div>
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Admin Users</h2>
        <div className="mt-3 space-y-2">
          {teamMembers.map((member) => (
            <div key={member.name} className="rounded-lg border border-gold/20 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>{member.name}</p>
                <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[10px] text-gold">{member.role}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Scope: {member.scope} | Last active: {member.lastSeen}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
