import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryProducts } from "@/components/sections/category";
import { CATEGORIES, categoryBySlug } from "@/lib/products";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = categoryBySlug((await params).slug);
  if (!category) return { title: "Category not found — SonicPrints" };
  return {
    title: `${category.name} — Custom Printing | SonicPrints`,
    description: `${category.tagline} ${category.description}`,
  };
}

/** Reads the slug inside Suspense so any unlisted URL still gets the shell (and a 404). */
async function Category({ params }: { params: Params }) {
  const category = categoryBySlug((await params).slug);
  if (!category) notFound();
  return <CategoryProducts category={category} />;
}

export default function CategoryPage({ params }: { params: Params }) {
  return (
    <main>
      <Suspense fallback={<div className="min-h-svh bg-cream" />}>
        <Category params={params} />
      </Suspense>
    </main>
  );
}
