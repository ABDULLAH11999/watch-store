import { prisma } from "@/lib/prisma";
import { demoProducts } from "@/lib/demo-data";
import { ProductFormCard } from "@/components/admin/product-form-card";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || "",
      saleEndsAt: product.saleEndsAt?.toISOString().slice(0, 16) || "",
      images: Array.isArray(product.images) ? (product.images as string[]) : [],
      videoUrl: product.videoUrl || "",
      stock: product.stock,
      status: product.status as "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK",
      slug: product.slug
    };
  } catch {
    const fallback = demoProducts.find((product) => product.id === id || product.slug === id);
    if (!fallback) return null;
    return {
      id: fallback.id,
      name: fallback.name,
      brand: fallback.brand,
      description: `<p>${fallback.name} is part of the curated Anmol Gadgets collection.</p>`,
      price: fallback.price,
      salePrice: fallback.salePrice || "",
      saleEndsAt: fallback.salePrice ? new Date(Date.now() + 45 * 60 * 1000).toISOString().slice(0, 16) : "",
      images: [...fallback.images],
      videoUrl: "",
      stock: 5,
      status: "PUBLISHED" as const,
      slug: fallback.slug
    };
  }
}

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return <ProductFormCard initialProduct={product} />;
}
