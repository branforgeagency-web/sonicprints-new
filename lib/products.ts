import type { StaticImageData } from "next/image";
import data from "@/data/catalogue.json";
import { PRODUCT_IMAGES } from "./product-images";

/* ------------------------------------------------------------------ */
/* Official SonicPrints catalogue: all content lives in                */
/* data/catalogue.json — categories, their shared details, and items.  */
/* An item may carry its own `details` (overriding the category's).    */
/* Photos are matched by file name:                                    */
/*   app/public/images/products/<category-slug>/<product-slug>.webp    */
/*   (+ optional cover.webp per category)                              */
/* and wired by `npm run images` into lib/product-images.ts. Items     */
/* without a photo show a branded placeholder.                         */
/* ------------------------------------------------------------------ */

/** Where the printed logo sits on a photo (fractions of the natural image), for the logo preview. */
export interface LogoArea {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  patch: string;
  dark: boolean;
  round?: boolean;
}

export interface ProductOption {
  label: string;
  values: string[];
}

/** Fields an item can take from its category, or override with its own `details`. */
interface Details {
  text: string;
  tagline: string;
  description: string;
  alt: string;
  highlights: string[];
  options: ProductOption[];
  turnaround: string;
  printMethods: string[];
  specs: string[][];
  idealFor: string[];
  faqs: { q: string; a: string }[];
  logoArea: LogoArea;
}

interface ItemData {
  slug: string;
  name: string;
  /** Shown in the home page product slider. */
  featured?: boolean;
  details?: Partial<Details>;
}

interface CategoryData extends Omit<Details, "text" | "alt" | "logoArea"> {
  slug: string;
  number: string;
  name: string;
  kit: string;
  items: ItemData[];
}

export interface CategoryRef {
  slug: string;
  name: string;
  number: string;
}

export interface Product extends Omit<Details, "specs" | "logoArea"> {
  slug: string;
  name: string;
  category: CategoryRef;
  /** Kit slug for the quote form. */
  kit: string;
  image?: StaticImageData;
  featured: boolean;
  specs: [string, string][];
  logoArea?: LogoArea;
  /** Other products to suggest (same category). */
  related: string[];
}

export interface Category extends CategoryRef {
  tagline: string;
  description: string;
  kit: string;
  /** Cover photo — the category's own, else its first item with a photo. */
  image?: StaticImageData;
  products: Product[];
}

const pairs = (specs: string[][]) => specs.map(([k, v]) => [k, v] as [string, string]);

export const CATEGORIES: Category[] = (data as CategoryData[]).map((c) => {
  const ref: CategoryRef = { slug: c.slug, name: c.name, number: c.number };
  const products: Product[] = c.items.map((item, i) => {
    const d = item.details ?? {};
    return {
      slug: item.slug,
      name: item.name,
      category: ref,
      kit: c.kit,
      text: d.text ?? c.tagline,
      tagline: d.tagline ?? c.tagline,
      description: d.description ?? c.description,
      alt: d.alt ?? `${item.name} — ${c.name}, printed by Sonic Prints`,
      highlights: d.highlights ?? c.highlights,
      options: d.options ?? c.options,
      turnaround: d.turnaround ?? c.turnaround,
      printMethods: d.printMethods ?? c.printMethods,
      specs: pairs(d.specs ?? c.specs),
      idealFor: d.idealFor ?? c.idealFor,
      faqs: d.faqs ?? c.faqs,
      logoArea: d.logoArea,
      image: PRODUCT_IMAGES[`${c.slug}/${item.slug}`],
      featured: !!item.featured,
      // The next three items in the same category.
      related: [1, 2, 3].map((k) => c.items[(i + k) % c.items.length].slug).filter((s) => s !== item.slug),
    };
  });
  return {
    ...ref,
    tagline: c.tagline,
    description: c.description,
    kit: c.kit,
    image: PRODUCT_IMAGES[`${c.slug}/cover`] ?? products.find((p) => p.image)?.image,
    products,
  };
});

export const PRODUCTS: Product[] = CATEGORIES.flatMap((c) => c.products);

/** Home page picks, in catalogue order (photographed items first). */
export const FEATURED: Product[] = PRODUCTS.filter((p) => p.featured).sort((a, b) => Number(!!b.image) - Number(!!a.image));

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
