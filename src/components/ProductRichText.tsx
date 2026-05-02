import { sanitizeProductDescription } from "@/lib/sanitizeProductDescription";

type Props = {
  html: string;
  className?: string;
};

/** Renders admin-authored product HTML (sanitized). */
export function ProductRichText({ html, className = "" }: Props) {
  const safe = sanitizeProductDescription(html);
  if (!safe) {
    return <p className="text-sm text-muted">No description has been added for this product yet.</p>;
  }
  return (
    <div
      className={`product-rich-text prose prose-invert max-w-none text-muted prose-headings:tracking-tight prose-h2:mt-8 prose-h2:text-2xl prose-h2:text-gold prose-h3:mt-6 prose-h3:text-xl prose-h3:text-gold prose-h4:text-gold prose-p:my-4 prose-p:leading-7 prose-strong:text-foreground prose-li:my-1 prose-ul:my-4 prose-ol:my-4 [&>div]:mb-3 [&>div]:last:mb-0 [&>div]:leading-7 ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
