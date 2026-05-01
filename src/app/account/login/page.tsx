"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setCustomerAuth, type CustomerProfile } from "@/lib/customerAuth";
import { getQueryParam } from "@/lib/queryParams";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost<{ token: string; user: CustomerProfile }>("/api/auth/login", {
        email,
        password,
      });
      setCustomerAuth(data.token, data.user);
      router.push(getQueryParam("redirect") || "/cart");
    } catch {
      setError("Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="luxury-card rounded-2xl p-6">
        <h1 className="section-title text-3xl text-gold">Sign In</h1>
        <p className="mt-2 text-sm text-muted">Continue checkout and manage your orders.</p>
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            type="email"
            placeholder="Email"
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="rounded-full bg-gold px-5 py-3 text-black disabled:opacity-60" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </form>
        <p className="mt-4 text-sm text-muted">
          New here?{" "}
          <Link href="/account/register?redirect=/cart" className="text-gold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </section>
  );
}

