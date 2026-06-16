import { prisma } from "@/lib/prisma";
import { ProductManager } from "@/components/admin/product-manager";
import { demoProducts } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const serialized = await (async () => {
    try {
      const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
      return products.map((product) => ({
        ...product,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || null,
        saleEndsAt: product.saleEndsAt?.toISOString() || null,
        images: Array.isArray(product.images) ? (product.images as string[]) : [],
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }));
    } catch {
      return demoProducts.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        description: `<p>${product.name} is part of the curated Anmol Gadgets collection.</p>`,
        price: String(product.price),
        salePrice: product.salePrice ? String(product.salePrice) : null,
        saleEndsAt: product.salePrice ? new Date(Date.now() + 45 * 60 * 1000).toISOString() : null,
        images: [...product.images],
        videoUrl: null,
        stock: 5,
        status: "PUBLISHED",
        slug: product.slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
  })();
  return <ProductManager initialProducts={serialized} />;
}
