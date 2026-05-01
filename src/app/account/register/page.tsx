"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setCustomerAuth, type CustomerProfile } from "@/lib/customerAuth";
import { getQueryParam } from "@/lib/queryParams";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost<{ token: string; user: CustomerProfile }>("/api/auth/register", {
        name,
        email,
        password,
      });
      setCustomerAuth(data.token, data.user);
      router.push(getQueryParam("redirect") || "/cart");
    } catch {
      setError("Could not create account. Please try different credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="luxury-card rounded-2xl p-6">
        <h1 className="section-title text-3xl text-gold">Create Account</h1>
        <p className="mt-2 text-sm text-muted">Save details and speed up your future checkouts.</p>
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            placeholder="Full name"
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            placeholder="Password (min 8 chars)"
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <button className="rounded-full bg-gold px-5 py-3 text-black disabled:opacity-60" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </form>
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/account/login?redirect=/cart" className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

