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

const STAR_PATH =
  "M12 2.5l2.76 5.6 6.18.9-4.47 4.35 1.05 6.16L12 16.9l-5.52 2.9 1.05-6.16-4.47-4.35 6.18-.9L12 2.5z";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="100%" height="100%" aria-hidden>
      <path fill="currentColor" d={STAR_PATH} />
    </svg>
  );
}

/** Read-only row of stars; `value` may be fractional (e.g. average 4.3). */
function StarRatingDisplay({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const clamped = Math.min(5, Math.max(0, value));
  const dim = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const label = `${(Math.round(clamped * 10) / 10).toFixed(1)} out of 5 stars`;

  return (
    <div className={`flex gap-0.5 ${size === "lg" ? "gap-1" : ""}`} role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, clamped - i));
        return (
          <div key={i} className={`relative shrink-0 ${dim}`}>
            <span className="absolute inset-0 text-white/[0.12]">
              <StarIcon />
            </span>
            <span className="absolute inset-0 overflow-hidden text-gold" style={{ width: `${fill * 100}%` }}>
              <StarIcon />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InteractiveStarRating({
  value,
  onChange,
  id,
}: {
  value: number;
  onChange: (n: number) => void;
  id: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Your rating</p>
      <div
        className="flex gap-1"
        role="group"
        aria-labelledby={`${id}-rating-label`}
        onMouseLeave={() => setHover(null)}
      >
        <span id={`${id}-rating-label`} className="sr-only">
          Choose from 1 to 5 stars
        </span>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = display >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`Set rating to ${n} out of 5 stars`}
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              className="relative h-10 w-10 shrink-0 rounded-lg transition hover:bg-gold/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
            >
              <span className={`absolute inset-1.5 ${filled ? "text-gold" : "text-white/[0.14]"}`}>
                <StarIcon />
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted">
        <span className="tabular-nums text-foreground">{value}</span> out of 5 stars selected
      </p>
    </div>
  );
}

function formatReviewDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function ProductReviews({ slug, initialReviews }: { slug: string; initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
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
      const payload = { name: name.trim(), rating, comment: comment.trim() };
      const data = await apiPost<{ review: Review }>(`/api/catalog/products/${slug}/reviews`, payload);
      setReviews((prev) => [data.review, ...prev]);
      setName("");
      setRating(5);
      setComment("");
    } catch {
      setError("Could not submit review right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-8" aria-labelledby="reviews-heading">
      <div className="luxury-card rounded-2xl border border-gold/12 p-6 sm:p-8">
        <div className="flex flex-col gap-6 border-b border-gold/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] text-gold">CUSTOMER REVIEWS</p>
            <h2 id="reviews-heading" className="section-title mt-2 text-2xl text-foreground sm:text-3xl">
              Ratings & feedback
            </h2>
          </div>
          {reviews.length > 0 ? (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-semibold tabular-nums text-foreground sm:text-5xl">
                  {(Math.round(averageRating * 10) / 10).toFixed(1)}
                </span>
                <StarRatingDisplay value={averageRating} size="lg" />
              </div>
              <p className="text-sm text-muted">
                Based on <span className="text-foreground">{reviews.length}</span>{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">No reviews yet, be the first to share your experience.</p>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-gold">WRITE A REVIEW</p>
            <p className="mt-1 text-sm text-muted">Help others by rating this product and sharing honest feedback.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-2 w-full rounded-lg border border-gold/30 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold/55 focus:ring-1 focus:ring-gold/30"
                required
                autoComplete="name"
              />
            </label>
            <div className="sm:pt-6">
              <InteractiveStarRating id="pdp-review" value={rating} onChange={setRating} />
            </div>
          </div>

          <label className="block text-xs font-medium uppercase tracking-wide text-muted">
            Your review
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? How was quality, packaging, or delivery?"
              rows={4}
              className="mt-2 w-full resize-y rounded-lg border border-gold/30 bg-black/40 px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold/55 focus:ring-1 focus:ring-gold/30"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-gold/45 bg-gold px-8 py-2.5 text-sm font-medium text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      </div>

      {reviews.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => {
            const dateLabel = formatReviewDate(review.createdAt);
            return (
              <li key={review._id ?? `${review.name}-${index}`}>
                <article className="luxury-card flex h-full flex-col rounded-xl border border-gold/10 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <StarRatingDisplay value={review.rating} size="sm" />
                    {dateLabel ? <time className="shrink-0 text-[11px] tabular-nums text-muted">{dateLabel}</time> : null}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-7 text-muted">{review.comment}</p>
                  <footer className="mt-5 border-t border-gold/10 pt-4">
                    <p className="text-sm font-medium text-foreground">{review.name}</p>
                    <p className="mt-0.5 text-xs text-muted">Customer review</p>
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
