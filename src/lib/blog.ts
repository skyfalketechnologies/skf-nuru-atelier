export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Fragrance" | "Skincare" | "Gifting" | "Lifestyle";
  coverImage: string;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  seoDescription: string;
  content: string[];
};

export const blogCategories = ["Fragrance", "Skincare", "Gifting", "Lifestyle"] as const;
export type BlogCategory = (typeof blogCategories)[number];

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-a-signature-fragrance",
    title: "How to Choose a Signature Fragrance",
    excerpt:
      "Learn a practical way to find one scent that feels uniquely yours, from notes to wear testing.",
    category: "Fragrance",
    coverImage:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80",
    author: "NURU Editorial",
    publishedAt: "2026-03-12",
    readTimeMinutes: 5,
    seoDescription:
      "A practical fragrance guide to help you identify your scent profile, test perfumes correctly, and choose a signature fragrance that lasts.",
    content: [
      "A signature fragrance should feel effortless on your skin and natural in your daily routine. Instead of chasing trends, start by identifying scent families you already enjoy: floral, woody, citrus, gourmand, or fresh aromatic.",
      "When testing in store, spray one scent per wrist and one on a test strip. Give each perfume at least 20 to 30 minutes so you can experience the heart and base notes. Top notes fade quickly and can be misleading if you decide too early.",
      "Pay attention to how the fragrance evolves in warm weather, office settings, and evening plans. The best choice is one that still feels elegant after several hours and does not overwhelm the room.",
      "At NURU ATELIER, we always recommend living with a sample before committing to a full bottle. A fragrance that feels right on day one and day three is usually a long-term match.",
    ],
  },
  {
    slug: "body-care-layering-for-long-lasting-scent",
    title: "Body Care Layering for Long-Lasting Scent",
    excerpt:
      "Make your perfume last longer with a simple layering routine using body wash, lotion, and fragrance.",
    category: "Skincare",
    coverImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80",
    author: "NURU Beauty Desk",
    publishedAt: "2026-02-18",
    readTimeMinutes: 4,
    seoDescription:
      "Use scent layering to improve perfume longevity with body care pairings, moisturizing routines, and strategic application points.",
    content: [
      "Fragrance lasts longer on hydrated skin. Start with a gentle cleanser that does not strip moisture, then apply body lotion while your skin is still slightly damp.",
      "Choose lotion notes that complement your perfume. For example, vanilla-based lotions pair beautifully with amber fragrances, while light citrus lotions can support fresh daytime perfumes.",
      "Apply perfume to pulse points such as wrists, neck, and inner elbows. For softer diffusion, spray once on clothing from a safe distance. Avoid rubbing your wrists together as this can flatten top notes.",
      "A good layering routine creates better projection without overspraying. It is the easiest way to keep your scent polished from morning to evening.",
    ],
  },
  {
    slug: "gift-box-ideas-for-birthdays-and-anniversaries",
    title: "Gift Box Ideas for Birthdays and Anniversaries",
    excerpt:
      "Curated gift box combinations that feel thoughtful, premium, and easy to personalize for any celebration.",
    category: "Gifting",
    coverImage:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80",
    author: "NURU Gift Atelier",
    publishedAt: "2026-01-29",
    readTimeMinutes: 6,
    seoDescription:
      "Discover premium gift box ideas with fragrance, body care, and personalized touches for birthdays, anniversaries, and milestone moments.",
    content: [
      "The best gift boxes combine beauty and usefulness. A balanced set usually includes one hero item, one everyday essential, and one surprise detail that adds personality.",
      "For birthdays, try a perfume, matching body mist, and a handwritten note. For anniversaries, elevate the experience with a candle, luxury body cream, and elegant packaging.",
      "Keep presentation clean and intentional: neutral wrapping, a consistent color theme, and one signature ribbon style. Small details often make the gift feel more premium than expensive.",
      "Our Gift Atelier team helps customers build custom combinations based on budget, recipient style, and occasion timeline, so every box feels personally curated.",
    ],
  },
  {
    slug: "creating-a-luxury-self-care-evening",
    title: "Creating a Luxury Self-Care Evening at Home",
    excerpt:
      "Turn a regular evening into a calming ritual with fragrance, skincare, and a few intentional habits.",
    category: "Lifestyle",
    coverImage:
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80",
    author: "NURU Journal",
    publishedAt: "2025-12-11",
    readTimeMinutes: 5,
    seoDescription:
      "Build a premium self-care night routine with scent rituals, gentle skincare, and relaxing atmosphere design at home.",
    content: [
      "Luxury self-care is about rhythm, not complexity. Begin by reducing noise: dim lighting, set your phone aside, and choose one playlist that helps you slow down.",
      "Use warm water and a nourishing cleanser, followed by a calming body lotion or oil. Add a soft fragrance to complete the sensory shift from busy mode to rest mode.",
      "Create a mini ritual that you can repeat weekly, such as journaling for ten minutes or reading with herbal tea. Consistency makes the experience restorative.",
      "A thoughtful evening routine improves sleep quality, mood, and confidence. Small moments of care can have a big effect on how you feel the next day.",
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function categoryToSlug(category: BlogCategory): string {
  return category.toLowerCase();
}

export function slugToCategory(slug: string): BlogCategory | undefined {
  return blogCategories.find((category) => categoryToSlug(category) === slug.toLowerCase());
}

export function getBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.category === category);
}

export function searchBlogPosts(term: string): BlogPost[] {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return getAllBlogPosts();

  return getAllBlogPosts().filter((post) => {
    return (
      post.title.toLowerCase().includes(normalizedTerm) ||
      post.excerpt.toLowerCase().includes(normalizedTerm) ||
      post.content.some((paragraph) => paragraph.toLowerCase().includes(normalizedTerm))
    );
  });
}
