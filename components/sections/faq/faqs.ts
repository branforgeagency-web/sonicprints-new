import { CONTACT, KITS, POSITIONING, QUOTE_SLA } from "@/lib/site";

export interface Faq {
  q: string;
  a: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: Faq[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "ordering",
    title: "Ordering",
    items: [
      {
        q: "What can you print on?",
        a: "Almost anything — business cards, letterheads, T-shirts, caps, tote bags, mugs, boxes, labels, standees, banners, signboards and more. Bring us the product or pick one of ours.",
      },
      {
        q: "What are the 12 kits?",
        a: `Kits bundle everything a brand needs at each stage: ${KITS.join(", ")}. You can order a full kit or just the pieces you need.`,
      },
      {
        q: "How do I place an order?",
        a: "Fill in the Get a Quote form, message us on WhatsApp, or walk in to our Gandhipuram HQ. From there your order runs through seven stages — inquiry, quotation, design, approval, production, packing and delivery.",
      },
      {
        q: "Can I order online?",
        a: "Today every order starts with a quick quote over the website or WhatsApp. Full online ordering with instant prices for popular products — visiting cards, flex, stickers, brochures and ID cards — is on its way.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & payment",
    items: [
      {
        q: "How fast will I get a quote?",
        a: `Within ${QUOTE_SLA}. Our pricing engine works out the price from the product, quantity and finish, and INKA sends it to you on WhatsApp and email.`,
      },
      {
        q: "Will I pay the same as everyone else?",
        a: "Yes. Whether you walk in, WhatsApp us or order online, the same product costs the same. Prices come from our system — there's no haggling and no special rates for whoever asks louder.",
      },
      {
        q: "Does ordering more bring the price down?",
        a: "Usually, yes. Prices are set in quantity tiers, so the per-piece cost drops as your quantity goes up. Your quote shows exactly what you're paying for.",
      },
      {
        q: "How do I pay?",
        a: "Pay 100% upfront online, or 50% in advance and the balance at pickup or delivery. Custom and corporate orders need an advance before production starts.",
      },
      {
        q: "Do you give GST invoices?",
        a: "Yes — every order comes with a GST invoice. Share your GSTIN when you order and we'll add it.",
      },
    ],
  },
  {
    id: "design",
    title: "Design & proofs",
    items: [
      {
        q: "I don't have a design. Can you help?",
        a: "That's what PIXEL, our design team, is for. Share your brief, logo and any references and we'll create a print-ready design. Starting from scratch? The Brand Identity Kit sets up your logo, colours and guidelines first.",
      },
      {
        q: "Can I send my own artwork?",
        a: "Of course. Print-ready PDFs or high-resolution files work best — attach them on WhatsApp or email and we'll check them before printing.",
      },
      {
        q: "Will I see a proof before you print?",
        a: "Always. The design is uploaded to your order for you to preview. Nothing gets printed until you approve it — then it's locked as final.",
      },
      {
        q: "What finishes do you offer?",
        a: "Matte, gloss, textured and spot UV, among others — what's available depends on the product. Mention your preference in the quote form and we'll advise.",
      },
    ],
  },
  {
    id: "production",
    title: "Production & quality",
    items: [
      {
        q: "Who prints my order?",
        a: "Either PRESSO, our in-house production team, or a vetted partner from our vendor network who specialises in that product. Same price and same quality standard either way.",
      },
      {
        q: "How do you check quality?",
        a: "Every job goes through a 3-point check — colour, alignment and material — and must pass before it's dispatched. You get photo updates while it's being made.",
      },
      {
        q: "How long will my order take?",
        a: "It depends on the product and quantity — your quote includes the lead time. Need it urgently? Pick \"This week\" in the quote form and we'll tell you what's possible.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & tracking",
    items: [
      {
        q: "Do you deliver?",
        a: "Yes. FLASH and SWIFTY, our delivery team, bring orders to your door with photo and signature proof. You can also pick up from our Gandhipuram HQ.",
      },
      {
        q: "How do I track my order?",
        a: "You'll get a WhatsApp update as your order moves through each stage, from approval to production to delivery.",
      },
      {
        q: "What if something's wrong with my order?",
        a: "Tell us straight away on WhatsApp or call our front office with a photo. Every job is checked before it leaves, so if we got it wrong, we'll make it right.",
      },
    ],
  },
  {
    id: "about",
    title: "About Sonic Prints",
    items: [
      {
        q: "Are you just a print shop?",
        a: `${POSITIONING} We look after the whole branding journey for a business — from the first logo to the hundredth shop board — so everything stays consistent.`,
      },
      {
        q: "Where are you?",
        a: `Our HQ is at ${CONTACT.address.join(" ")} Call ${CONTACT.phone} or email ${CONTACT.email}.`,
      },
      {
        q: "Can my print business partner with you?",
        a: "Yes. We work with vendor partners for flex printing, large-format, offset, signage and packaging, and we're opening Sonic Express outlets with local print shops. Get in touch through the contact page.",
      },
    ],
  },
];
