export type AdminModule = {
  href: string;
  label: string;
  description: string;
  group: "Commerce" | "Growth" | "Operations" | "System";
  status: "live" | "beta";
};

export const adminModules: AdminModule[] = [
  {
    href: "/admin",
    label: "Executive Dashboard",
    description: "Business overview, alerts, and daily priorities.",
    group: "Commerce",
    status: "live",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Order lifecycle, payment checks, and status updates.",
    group: "Commerce",
    status: "live",
  },
  {
    href: "/admin/pos",
    label: "POS",
    description: "Walk-in sales, quick checkout, and instant receipts.",
    group: "Commerce",
    status: "live",
  },
  {
    href: "/admin/products",
    label: "Products",
    description: "Product data, pricing, media, and merchandising.",
    group: "Commerce",
    status: "live",
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    description: "Stock health, replenishment planning, and adjustments.",
    group: "Commerce",
    status: "live",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    description: "Customer profiles, retention segments, and order history.",
    group: "Growth",
    status: "live",
  },
  {
    href: "/admin/promotions",
    label: "Promotions",
    description: "Campaign offers, discount governance, and redemption rules.",
    group: "Growth",
    status: "beta",
  },
  {
    href: "/admin/marketing",
    label: "Marketing",
    description: "Channel performance, audience targeting, and content cadence.",
    group: "Growth",
    status: "beta",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    description: "Revenue, conversion, and product intelligence.",
    group: "Growth",
    status: "live",
  },
  {
    href: "/admin/fulfillment",
    label: "Fulfillment",
    description: "Warehouse workflows, carrier SLAs, and delivery execution.",
    group: "Operations",
    status: "beta",
  },
  {
    href: "/admin/catalog",
    label: "Catalog",
    description: "Brands, categories, and gift option taxonomy.",
    group: "Operations",
    status: "live",
  },
  {
    href: "/admin/gift-customization",
    label: "Gift Atelier Config",
    description: "Curated gift categories, variants, and add-on pricing for the customization flow.",
    group: "Operations",
    status: "live",
  },
  {
    href: "/admin/finance",
    label: "Finance",
    description: "Sales reconciliation, payout status, and cashflow controls.",
    group: "Operations",
    status: "beta",
  },
  {
    href: "/admin/content",
    label: "Content",
    description: "Homepage storytelling, merchandising blocks, and SEO tasks.",
    group: "System",
    status: "beta",
  },
  {
    href: "/admin/team",
    label: "Team & Access",
    description: "Admin users, role access, and audit ownership.",
    group: "System",
    status: "beta",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description: "Store configuration, integrations, and compliance setup.",
    group: "System",
    status: "beta",
  },
];
