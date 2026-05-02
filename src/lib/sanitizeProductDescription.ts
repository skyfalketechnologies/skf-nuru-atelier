import sanitizeHtml from "sanitize-html";

/** Tags commonly produced by the admin contentEditable (RichTextEditor). */
const PRODUCT_DESCRIPTION_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "div",
    "br",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "pre",
    "code",
  ],
  allowedAttributes: false,
  transformTags: { h1: "h2" },
};

export function sanitizeProductDescription(html: string): string {
  if (!html || typeof html !== "string") return "";
  const trimmed = html.trim();
  if (!trimmed) return "";
  return sanitizeHtml(trimmed, PRODUCT_DESCRIPTION_OPTIONS);
}
