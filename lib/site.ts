import { KIT_LIST } from "./kits";

/* ------------------------------------------------------------------ */
/* Shared business facts — from the SonicPrints master plan            */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  company: "Sonic Prints India Pvt Ltd",
  address: ["Jay Enclave, 1086, 3rd Street,", "Cross Cut Road, Gandhipuram,", "Coimbatore — 641012"],
  phone: "+91 73387 53815",
  phoneHref: "tel:+917338753815",
  whatsapp: "917338753815",
  email: "info@sonicprints.in",
  web: "www.sonicprints.in",
  mapsQuery: "Jay Enclave, 1086, 3rd Street, Cross Cut Road, Gandhipuram, Coimbatore 641012",
} as const;

export const TAGLINE = "We don't just print. We build brands.";
export const POSITIONING = "Others run a printing shop. We run a branding company.";

/** Promised quote turnaround (KPI: ≤ 2 working hours). */
export const QUOTE_SLA = "2 working hours";

export const KITS = KIT_LIST.map((k) => k.title);

export interface CrewMember {
  name: string;
  role: string;
  does: string;
  /** Order stages this member owns (see How It Works). */
  stages: string;
}

export const CREW: CrewMember[] = [
  { name: "INKA", role: "Front Office", does: "Answers your enquiry, sends your quote and keeps you posted.", stages: "Stages 01–02 · Inquiry & Quotation" },
  { name: "PIXEL", role: "Design", does: "Turns your brief into a print-ready design you can preview.", stages: "Stage 03 · Design" },
  { name: "PRESSO", role: "Production", does: "Runs the machines and the 3-point quality check.", stages: "Stage 05 · Production" },
  { name: "LEADO", role: "Marketing & Sales", does: "Helps brands plan the right kit for their stage.", stages: "Kits, campaigns & new brands" },
  { name: "FLASH", role: "Delivery", does: "Gets your order to your door — with photo proof.", stages: "Stages 06–07 · Packing & Delivery" },
  { name: "SWIFTY", role: "Delivery", does: "Delivers, and asks how we did once it lands.", stages: "Stages 06–07 · Packing & Delivery" },
];

export const whatsappLink = (text?: string) =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const mailtoLink = (subject: string, body: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapsQuery)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapsQuery)}&output=embed`;
