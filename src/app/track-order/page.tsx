"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type PaymentStatus = "pending" | "initiated" | "paid" | "failed";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const queryOrderId = searchParams.get("orderId");
    const queryOrderRef = searchParams.get("orderRef");
    const lookup = queryOrderRef || queryOrderId;
    if (!lookup) return;
    setOrderId((current) => current || lookup);
  }, [searchParams]);

  useEffect(() => {
    if (!orderId) return;
    void checkStatus();
    // only auto-run when orderId appears (from query param or first manual fill)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function checkStatus() {
    if (!orderId.trim()) {
      setError("Enter your order ID first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/payments/mpesa/status/${orderId.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not find that order.");
        return;
      }

      setStatus(data.paymentStatus || "pending");
      setOrderStatus(data.status || "pending");
      setPaymentReference(data.paymentReference || "");
      setReceiptNumber(data.receiptNumber || "");
      if (data.paymentStatus === "paid") {
        setMessage(
          `Payment confirmed.${data.receiptNumber ? ` Receipt: ${data.receiptNumber}.` : ""}`
        );
      } else if (data.paymentStatus === "failed") {
        setMessage(data.resultDesc || "Payment attempt failed. Retry STK push.");
      } else if (data.paymentStatus === "initiated") {
        setMessage("Payment request is in progress. Check your phone for M-Pesa prompt.");
      } else {
        setMessage("Order found. Payment is pending.");
      }
    } catch {
      setError("Could not check order status right now.");
    } finally {
      setLoading(false);
    }
  }

  async function retryStkPush() {
    if (!orderId.trim()) {
      setError("Enter your order ID first.");
      return;
    }
    if (!phone.trim()) {
      setError("Enter your M-Pesa phone number to retry STK push.");
      return;
    }

    setRetrying(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/payments/mpesa/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || data.instructions || "Failed to retry STK push.");
        return;
      }
      setStatus("initiated");
      setMessage(data.instructions || "STK push sent. Check your phone.");
    } catch {
      setError("Could not retry STK push right now.");
    } finally {
      setRetrying(false);
    }
  }

  useEffect(() => {
    if (!orderId || status !== "initiated") return;
    const id = window.setInterval(() => {
      void checkStatus();
    }, 8000);
    return () => window.clearInterval(id);
  }, [orderId, status]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void checkStatus();
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">ORDER SUPPORT</p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">Track Your Order</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Enter your order reference below to check your order progress.
        </p>
      </section>

      <section className="luxury-card rounded-2xl p-6">
        <form className="grid gap-3 sm:grid-cols-[1fr_180px]" onSubmit={onSubmit}>
          <input
            placeholder="Enter Order Reference (e.g. NURU-20260429-AB12CD)"
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gold px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>
        <div className="mt-3">
          <input
            placeholder="M-Pesa phone for retry (e.g. 07...)"
            className="w-full rounded border border-gold/40 bg-black p-3 text-sm"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={retryStkPush}
            disabled={retrying || !orderId}
            className="gold-border rounded-full px-5 py-2 text-xs text-gold disabled:opacity-60"
          >
            {retrying ? "Retrying..." : "Retry M-Pesa STK Push"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-gold">{message}</p> : null}
        {orderId && !error ? (
          <p className="mt-2 text-xs text-muted">
            Order Reference: {paymentReference || orderId} | Order: {orderStatus || "pending"} | Payment: {status}
            {receiptNumber ? ` | Receipt: ${receiptNumber}` : ""}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-muted">
          If you need help, contact us at <span className="text-foreground">shop@nuruatelier.com</span> or call <span className="text-foreground">014 101 0644</span>.
        </p>
      </section>
    </main>
  );
}

