import { prisma } from "@/lib/prisma";
import { demoProducts } from "@/lib/demo-data";
import { ProductTable } from "@/components/admin/product-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { products, total } = await (async () => {
    try {
      const [rows, total] = await Promise.all([
        prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.product.count()
      ]);
      return {
        products: rows.map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price.toString(),
          salePrice: product.salePrice?.toString() || null,
          images: Array.isArray(product.images) ? (product.images as string[]) : [],
          stock: product.stock,
          status: product.status,
          slug: product.slug
        })),
        total
      };
    } catch {
      return {
        products: demoProducts.map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          salePrice: product.salePrice || null,
          images: [...product.images],
          stock: 5,
          status: "PUBLISHED",
          slug: product.slug
        })),
        total: demoProducts.length
      };
    }
  })();

  return <ProductTable initialProducts={products} initialTotal={total} />;
}
