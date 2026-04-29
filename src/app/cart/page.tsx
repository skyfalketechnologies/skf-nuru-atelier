"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearCart,
  readCart,
  removeFromCart,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";
import {
  clearCustomerAuth,
  getCustomerProfile,
  getCustomerToken,
  type CustomerProfile,
} from "@/lib/customerAuth";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [packagingStyle, setPackagingStyle] = useState("luxury_box");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    setCart(readCart());
    const savedToken = getCustomerToken();
    const savedCustomer = getCustomerProfile();
    if (savedToken && savedCustomer) {
      setToken(savedToken);
      setCustomer(savedCustomer);
      setGuestEmail(savedCustomer.email);
      setFullName(savedCustomer.name ?? "");
      setStep(2);
    }
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceKes * item.quantity, 0),
    [cart]
  );
  const deliveryFee = subtotal > 5000 ? 0 : 350;
  const total = subtotal + deliveryFee;

  function refreshCart() {
    setCart(readCart());
  }

  function changeQty(productId: string, nextQty: number) {
    updateCartItemQuantity(productId, nextQty);
    refreshCart();
  }

  function removeItem(productId: string) {
    removeFromCart(productId);
    refreshCart();
  }

  function signOut() {
    clearCustomerAuth();
    setToken(null);
    setCustomer(null);
    setStep(1);
  }

  async function placeOrder() {
    setError("");
    setPlacingOrder(true);
    try {
      const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          guestEmail,
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          shippingAddress: { fullName, phone, city, area, addressLine },
          giftCustomization: { message, packagingStyle },
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error || "Order failed");
        return;
      }
      const payRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/payments/mpesa/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: createData.order._id, phone }),
        }
      );
      const payData = await payRes.json();
      setResult(
        `Order ${createData.order._id} created. ${payData.instructions ?? "Proceed with M-Pesa payment."}`
      );
      clearCart();
      setCart([]);
    } catch {
      setError("Checkout could not complete. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  const stepLabelClass = (target: number) =>
    `rounded-full px-3 py-1 text-xs ${
      step >= target ? "bg-gold text-black" : "border border-gold/40 text-muted"
    }`;

  const canContinueShipping = !!(fullName && phone && city && addressLine && guestEmail);

  if (!cart.length && !result) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="luxury-card rounded-2xl p-8 text-center">
          <h1 className="section-title text-3xl text-gold sm:text-4xl">Your Cart Is Empty</h1>
          <p className="mt-3 text-sm text-muted">Add luxury products to begin your checkout journey.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="section-title text-3xl text-gold sm:text-4xl">Cart & Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Complete your order in three simple steps.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className={stepLabelClass(1)}>1. Account</span>
        <span className={stepLabelClass(2)}>2. Shipping</span>
        <span className={stepLabelClass(3)}>3. Review & Pay</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          {step === 1 ? (
            <div className="luxury-card rounded-2xl p-6">
              <h2 className="section-title text-2xl">Account</h2>
              <p className="mt-2 text-sm text-muted">
                Sign in for faster checkout, or continue as guest.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/account/login?redirect=/cart"
                  className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-black"
                >
                  Sign In
                </a>
                <a
                  href="/account/register?redirect=/cart"
                  className="gold-border rounded-full px-5 py-2 text-sm text-gold hover:bg-gold/10"
                >
                  Create Account
                </a>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-muted hover:text-gold"
                >
                  Continue as guest checkout
                </button>
              </div>
            </div>
          ) : null}

          {step >= 2 ? (
            <div className="luxury-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="section-title text-2xl">Shipping Details</h2>
                {customer ? (
                  <button onClick={signOut} className="text-xs text-muted hover:text-gold">
                    Sign out ({customer.email})
                  </button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded border border-gold/40 bg-black p-3 text-sm"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <input
                  className="rounded border border-gold/40 bg-black p-3 text-sm"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className="rounded border border-gold/40 bg-black p-3 text-sm"
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <input
                  className="rounded border border-gold/40 bg-black p-3 text-sm"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  className="rounded border border-gold/40 bg-black p-3 text-sm"
                  placeholder="Area (optional)"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
                <input
                  className="rounded border border-gold/40 bg-black p-3 text-sm sm:col-span-2"
                  placeholder="Address line"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                />
                <textarea
                  className="rounded border border-gold/40 bg-black p-3 text-sm sm:col-span-2"
                  rows={3}
                  placeholder="Gift message (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <select
                  className="rounded border border-gold/40 bg-black p-3 text-sm sm:col-span-2"
                  value={packagingStyle}
                  onChange={(e) => setPackagingStyle(e.target.value)}
                >
                  <option value="luxury_box">Luxury Box</option>
                  <option value="ribbon_wrap">Ribbon Wrap</option>
                  <option value="signature_wrap">Signature Wrap</option>
                  <option value="nuru_atelier_bag">Nuru Atelier Bag</option>
                </select>
              </div>
              {step === 2 ? (
                <button
                  disabled={!canContinueShipping}
                  onClick={() => setStep(3)}
                  className="mt-4 rounded-full bg-gold px-6 py-2 text-sm font-medium text-black disabled:opacity-60"
                >
                  Continue to Review
                </button>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="luxury-card rounded-2xl p-6">
              <h2 className="section-title text-2xl">Review & Payment</h2>
              <p className="mt-3 text-sm text-muted">
                You will receive an M-Pesa prompt/instructions after order creation.
              </p>
              <button
                onClick={placeOrder}
                disabled={placingOrder || !cart.length}
                className="mt-5 rounded-full bg-gold px-6 py-3 text-sm font-medium text-black disabled:opacity-60"
              >
                {placingOrder ? "Processing..." : "Place Order with M-Pesa"}
              </button>
              {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
              {result ? <p className="mt-3 text-sm text-gold">{result}</p> : null}
            </div>
          ) : null}
        </div>

        <aside className="luxury-card h-fit rounded-2xl p-5">
          <h2 className="section-title text-2xl">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="rounded-lg border border-gold/20 p-3">
                <p className="text-sm">{item.name}</p>
                <p className="mt-1 text-xs text-muted">Ksh {item.priceKes.toLocaleString()} each</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQty(item.productId, item.quantity - 1)}
                      className="gold-border h-7 w-7 rounded-full text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.productId, item.quantity + 1)}
                      className="gold-border h-7 w-7 rounded-full text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-muted hover:text-gold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gold/20 pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Subtotal</span>
              <span>Ksh {subtotal.toLocaleString()}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted">Delivery</span>
              <span>{deliveryFee ? `Ksh ${deliveryFee.toLocaleString()}` : "Free"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-base">
              <span>Total</span>
              <span className="text-gold">Ksh {total.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

