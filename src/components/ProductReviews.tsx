"use client";

import { useMemo, useState } from "react";
import { apiPost } from "@/lib/api";

type Review = {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

export function ProductReviews({ slug, initialReviews }: { slug: string; initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { name: name.trim(), rating: Number(rating), comment: comment.trim() };
      const data = await apiPost<{ review: Review }>(`/api/catalog/products/${slug}/reviews`, payload);
      setReviews((prev) => [data.review, ...prev]);
      setName("");
      setRating("5");
      setComment("");
    } catch {
      setError("Could not submit review right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">REVIEWS</p>
          <h2 className="section-title mt-2 text-3xl">What Customers Are Saying</h2>
        </div>
        <p className="text-sm text-muted">
          {reviews.length ? `${averageRating.toFixed(1)} / 5 (${reviews.length} reviews)` : "No reviews yet"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="luxury-card rounded-xl p-5">
        <p className="text-xs tracking-[0.2em] text-gold">WRITE A REVIEW</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            required
          />
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="rounded border border-gold/40 bg-black p-3 text-sm"
          >
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="mt-3 w-full rounded border border-gold/40 bg-black p-3 text-sm"
          required
        />
        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 rounded-full bg-gold px-5 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        {reviews.map((review, index) => (
          <article key={review._id ?? `${review.name}-${index}`} className="luxury-card rounded-xl p-5">
            <p className="text-sm text-gold">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
            <p className="mt-3 text-sm leading-7 text-muted">"{review.comment}"</p>
            <p className="mt-3 text-sm text-foreground">{review.name}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

