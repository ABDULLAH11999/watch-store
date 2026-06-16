import { prisma } from "@/lib/prisma";
import { demoProducts } from "@/lib/demo-data";
import { ProductTable } from "@/components/admin/product-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await (async () => {
    try {
      const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || null,
        images: Array.isArray(product.images) ? (product.images as string[]) : [],
        stock: product.stock,
        status: product.status,
        slug: product.slug
      }));
    } catch {
      return demoProducts.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        salePrice: product.salePrice || null,
        images: [...product.images],
        stock: 5,
        status: "PUBLISHED",
        slug: product.slug
      }));
    }
  })();

  return <ProductTable initialProducts={products} />;
}
