import { prisma } from "@/lib/prisma";
import { OrderManager } from "@/components/admin/order-manager";
import { demoProducts, demoTestimonials } from "@/lib/demo-data";
import { canUseDemoFallback } from "@/lib/demo-fallback";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { orders, total } = await (async () => {
    try {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          include: { customer: true },
          orderBy: { createdAt: "desc" },
          take: 10
        }),
        prisma.order.count()
      ]);
      return {
        orders: orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          subtotal: order.subtotal.toString(),
          total: order.total.toString(),
          customer: {
            name: order.customer.name,
            phone: order.customer.phone,
            email: order.customer.email,
            address: order.customer.address,
            city: order.customer.city
          },
          createdAt: order.createdAt.toISOString(),
          items: Array.isArray(order.items) ? (order.items as Array<{ name: string; quantity: number; price: number }>) : []
        })),
        total
      };
    } catch {
      if (!canUseDemoFallback()) {
        return { orders: [], total: 0 };
      }
      const orders = demoProducts.slice(0, 6).map((product, index) => ({
        id: `demo-order-${index + 1}`,
        orderNumber: `ORD-${1000 + index}`,
        status: index % 3 === 0 ? "PENDING" : "CONFIRMED",
        subtotal: String(product.salePrice || product.price),
        total: String(product.salePrice || product.price),
        customer: {
          name: demoTestimonials[index % demoTestimonials.length].customerName,
          phone: `0300-12345${index}`,
          email: null,
          address: "Luxury Plaza, Karachi",
          city: "Karachi"
        },
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        items: [{ name: product.name, quantity: 1, price: Number(product.salePrice ?? product.price) }]
      }));
      return { orders, total: orders.length };
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
      <OrderManager initialOrders={orders} initialTotal={total} />
    </div>
  );
}
