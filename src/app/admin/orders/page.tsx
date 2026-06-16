import { prisma } from "@/lib/prisma";
import { OrderManager } from "@/components/admin/order-manager";
import { demoProducts, demoTestimonials } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const serialized = await (async () => {
    try {
      const orders = await prisma.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" }
      });
      return orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal.toString(),
        total: order.total.toString(),
        customer: {
          name: order.customer.name,
          phone: order.customer.phone,
          email: order.customer.email
        },
        createdAt: order.createdAt.toISOString(),
        items: Array.isArray(order.items) ? (order.items as Array<{ name: string; quantity: number; price: number }>) : []
      }));
    } catch {
      return demoProducts.slice(0, 6).map((product, index) => ({
        id: `demo-order-${index + 1}`,
        orderNumber: `ORD-${1000 + index}`,
        status: index % 3 === 0 ? "PENDING" : "CONFIRMED",
        subtotal: String(product.salePrice || product.price),
        total: String(product.salePrice || product.price),
        customer: {
          name: demoTestimonials[index % demoTestimonials.length].customerName,
          phone: `0300-12345${index}`,
          email: null
        },
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        items: [{ name: product.name, quantity: 1, price: Number(product.salePrice ?? product.price) }]
      }));
    }
  })();
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-black/45 sm:text-sm">Orders</p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-5xl">Order Management</h1>
        </div>
        <a href="/admin/orders/new" className="inline-flex items-center justify-center rounded-full bg-black px-4 py-3 text-sm font-semibold text-white">
          Create Order
        </a>
      </div>
      <OrderManager initialOrders={serialized} />
    </div>
  );
}
