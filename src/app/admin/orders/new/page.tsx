import { prisma } from "@/lib/prisma";
import { OrderCreateForm } from "@/components/admin/order-create-form";

export const dynamic = "force-dynamic";

export default async function AdminCreateOrderPage() {
  const products = await prisma.product.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } });
  const serialized = products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    slug: product.slug,
    price: product.price.toString(),
    salePrice: product.salePrice?.toString() || null,
    images: Array.isArray(product.images) ? (product.images as string[]) : []
  }));
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-black/45">Orders</p>
        <h1 className="mt-2 font-heading text-5xl">Create Order</h1>
      </div>
      <OrderCreateForm products={serialized} />
    </div>
  );
}
