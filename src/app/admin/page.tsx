import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { formatPKR } from "@/lib/utils";
import { demoProducts, demoTestimonials } from "@/lib/demo-data";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let totalOrders = 0;
  let revenue: any = { _sum: { total: 0 } };
  let totalCustomers = 0;
  let pendingOrders = 0;
  let recentOrders: Array<any> = [];

  try {
    [totalOrders, revenue, totalCustomers, pendingOrders, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.customer.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);
  } catch {
    totalOrders = demoProducts.length;
    totalCustomers = demoTestimonials.length;
    pendingOrders = Math.max(1, Math.ceil(demoProducts.length / 4));
    revenue = { _sum: { total: demoProducts.reduce((sum, product) => sum + Number(product.salePrice ?? product.price), 0) } };
    recentOrders = demoProducts.slice(0, 5).map((product, index) => ({
      id: product.id,
      orderNumber: `ORD-${1000 + index}`,
      customer: { name: demoTestimonials[index % demoTestimonials.length].customerName },
      total: Number(product.salePrice ?? product.price),
      status: index % 2 === 0 ? "PENDING" : "CONFIRMED",
      createdAt: new Date()
    }));
  }

  const chartData = recentOrders
    .slice()
    .reverse()
    .map((order) => ({
      date: order.createdAt.toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
      revenue: Number(order.total)
    }));

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-1 md:space-y-2">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold md:text-sm">Dashboard</p>
        <h1 className="font-heading text-3xl leading-tight md:text-5xl">Overview</h1>
        <p className="max-w-2xl text-sm leading-6 text-black/55 md:text-base">
          Track orders, revenue, customers, and content health from one luxury-styled admin console.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={String(totalOrders)} />
        <StatCard label="Total Revenue" value={formatPKR(Number(revenue._sum.total || 0))} />
        <StatCard label="Total Customers" value={String(totalCustomers)} />
        <StatCard label="Pending Orders" value={String(pendingOrders)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <RevenueChart data={chartData} />
          <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-2xl md:text-3xl">Recent Orders</h2>
              <a href="/admin/orders" className="text-sm font-semibold text-brown">
                View all
              </a>
            </div>
            <div className="mt-5 space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-black/5 pb-3 text-sm last:border-b-0">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-black/50">{order.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatPKR(Number(order.total))}</p>
                    <p className="text-black/50">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl md:text-3xl">Testimonials</h2>
              <a href="/admin/testimonials" className="text-sm font-semibold text-brown">
                Manage
              </a>
            </div>
            <div className="mt-5 space-y-4">
              {demoTestimonials.slice(0, 4).map((testimonial) => (
                <div key={testimonial.id} className="flex gap-3 rounded-2xl border border-black/10 p-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={testimonial.customerImage} alt={testimonial.customerName} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{testimonial.customerName}</p>
                    <p className="truncate text-sm text-black/50">{testimonial.reviewText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2">
            <a href="/admin/products" className="rounded-2xl border border-black/10 px-4 py-4 text-sm font-semibold">
              Manage Products
            </a>
            <a href="/admin/orders" className="rounded-2xl border border-black/10 px-4 py-4 text-sm font-semibold">
              Manage Orders
            </a>
            <a href="/admin/customers" className="rounded-2xl border border-black/10 px-4 py-4 text-sm font-semibold">
              Manage Customers
            </a>
            <a href="/admin/settings" className="rounded-2xl border border-black/10 px-4 py-4 text-sm font-semibold">
              Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
