import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { formatPKR } from "@/lib/utils";
import { demoProducts, demoTestimonials } from "@/lib/demo-data";

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
        <p className="text-[11px] uppercase tracking-[0.4em] text-black/45 md:text-sm">Dashboard</p>
        <h1 className="font-heading text-3xl leading-tight md:text-5xl">Overview</h1>
        <p className="max-w-2xl text-sm leading-6 text-black/55 md:text-base">
          Track orders, revenue, customers, and content health from one luxury-styled admin console.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={String(totalOrders)} />
        <StatCard label="Total Revenue" value={formatPKR(Number(revenue._sum.total || 0))} />
        <StatCard label="Total Customers" value={String(totalCustomers)} />
        <StatCard label="Pending Orders" value={String(pendingOrders)} />
      </div>
      <div className="space-y-4">
        <RevenueChart data={chartData} />
        <div className="grid gap-2 rounded-3xl border border-black/10 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
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
  );
}
