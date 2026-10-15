/* ------------------------------------------------------------------ */
/* The 12 SonicPrints kits — single source for the home cards,         */
/* the /kits page and the quote form.                                  */
/* ------------------------------------------------------------------ */

export interface Kit {
  slug: string;
  number: string;
  title: string;
  description: string;
  includes: string[];
  /** Card colours, rotating through the brand palette. */
  background: string;
  color: string;
}

const THEMES = [
  { background: "#001408", color: "#f7f4ee" },
  { background: "#f7f4ee", color: "#001408" },
  { background: "#bd5501", color: "#f7f4ee" },
];

const RAW: Omit<Kit, "number" | "background" | "color">[] = [
  {
    slug: "brand-identity",
    title: "Brand Identity",
    description: "Logo, colours, typography and brand guidelines — set up once and printed consistently on everything you make.",
    includes: ["Logo design", "Colour palette", "Typography", "Brand guidelines"],
  },
  {
    slug: "stationery",
    title: "Stationery",
    description: "Letterheads, envelopes, notebooks, notepads and pens — everyday paper goods that carry your brand.",
    includes: ["Letterheads", "Envelopes", "Notebooks", "Notepads", "Pens"],
  },
  {
    slug: "team-employee",
    title: "Team & Employee",
    description: "T-shirts, caps, ID cards, lanyards and welcome bags that make every team member part of the brand.",
    includes: ["T-shirts", "Caps", "ID cards", "Lanyards", "Welcome bags"],
  },
  {
    slug: "client-welcome",
    title: "Client Welcome",
    description: "Branded boxes, thank-you cards, mugs and notebooks that make a lasting first impression on new clients.",
    includes: ["Branded boxes", "Thank-you cards", "Mugs", "Notebooks"],
  },
  {
    slug: "business-card",
    title: "Business Card",
    description: "Premium business cards in matte, gloss, textured or spot-UV finishes — printed sharp and delivered fast.",
    includes: ["Matte", "Gloss", "Textured", "Spot UV"],
  },
  {
    slug: "marketing-promotion",
    title: "Marketing & Promotion",
    description: "Flyers, brochures, posters, stickers and giveaways built to spread the word about your brand.",
    includes: ["Flyers", "Brochures", "Posters", "Stickers", "Giveaways"],
  },
  {
    slug: "packaging",
    title: "Packaging",
    description: "Custom boxes, bags, labels, tape and tissue that turn every delivery into an unboxing moment.",
    includes: ["Custom boxes", "Bags", "Labels", "Tape", "Tissue"],
  },
  {
    slug: "signage-display",
    title: "Signage & Display",
    description: "Standees, roll-up banners, signboards and wall graphics that get your brand noticed from across the room.",
    includes: ["Standees", "Roll-up banners", "Signboards", "Wall graphics"],
  },
  {
    slug: "event-exhibition",
    title: "Event & Exhibition",
    description: "Backdrops, booth graphics, badges, banners and merchandise for events that stand out.",
    includes: ["Backdrops", "Booth graphics", "Badges", "Banners", "Merchandise"],
  },
  {
    slug: "retail-pos",
    title: "Retail & Point-of-Sale",
    description: "Shelf talkers, counter displays, price tags and window graphics that help your products sell.",
    includes: ["Shelf talkers", "Counter displays", "Price tags", "Window graphics"],
  },
  {
    slug: "corporate-gift",
    title: "Corporate Gift",
    description: "Branded bottles, diaries, bags, caps and hampers — gifts people actually keep and use.",
    includes: ["Bottles", "Diaries", "Bags", "Caps", "Hampers"],
  },
  {
    slug: "digital-brand-assets",
    title: "Digital Brand Assets",
    description: "Social media templates, email signatures, presentations and digital cards that match your print.",
    includes: ["Social templates", "Email signatures", "Presentations", "Digital cards"],
  },
];

export const KIT_LIST: Kit[] = RAW.map((kit, i) => ({
  ...kit,
  number: String(i + 1).padStart(2, "0"),
  ...THEMES[i % THEMES.length],
}));

export const kitBySlug = (slug: string) => KIT_LIST.find((k) => k.slug === slug);
