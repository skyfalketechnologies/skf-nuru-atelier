"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { isAdminRole, setAuthToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiPost<{ token: string; user: { role: string } }>("/api/auth/admin/login", {
        email,
        password,
      });
      if (!isAdminRole(data.user.role)) {
        setError("Your account does not have admin access.");
        return;
      }
      setAuthToken(data.token);
      router.push("/admin");
    } catch {
      setError("Invalid login credentials.");
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-500/35 bg-slate-950/85 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Nuru Enterprise</p>
        <h1 className="mt-1 font-serif text-3xl text-slate-100">Admin Login</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            className="rounded border border-slate-500/50 bg-slate-900 p-3 text-slate-100 placeholder:text-slate-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded border border-slate-500/50 bg-slate-900 p-3 text-slate-100 placeholder:text-slate-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="rounded-full bg-sky-500 px-5 py-3 text-slate-950 hover:bg-sky-400">Sign In</button>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}

