"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiPost<{ token: string; user: { role: string } }>("/api/auth/login", {
        email,
        password,
      });
      if (!["SUPER_ADMIN", "ADMIN", "STAFF"].includes(data.user.role)) {
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
      <div className="luxury-card rounded-xl p-6">
        <h1 className="font-serif text-3xl text-gold">Admin Login</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            className="rounded border border-gold/40 bg-black p-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded border border-gold/40 bg-black p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="rounded-full bg-gold px-5 py-3 text-black">Sign In</button>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}

