import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetail } from "@/components/sections/product";
import { PRODUCTS, productBySlug } from "@/lib/products";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  if (!product) return { title: "Product not found — SonicPrints" };
  return {
    title: `${product.name} — Custom Printing | SonicPrints`,
    description: `${product.tagline} ${product.description}`,
  };
}

/** Reads the slug inside Suspense so any unlisted URL still gets the shell (and a 404). */
async function Product({ params }: { params: Params }) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <main>
      <Suspense fallback={<div className="min-h-svh bg-cream" />}>
        <Product params={params} />
      </Suspense>
    </main>
  );
}
