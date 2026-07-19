import { prisma } from "@/lib/prisma";
import { CustomerManager } from "@/components/admin/customer-manager";
import { demoTestimonials } from "@/lib/demo-data";
import { canUseDemoFallback } from "@/lib/demo-fallback";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const { customers, total } = await (async () => {
    try {
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.customer.count()
      ]);
      return {
        customers: customers.map((customer) => ({
          ...customer,
          createdAt: customer.createdAt.toISOString()
        })),
        total
      };
    } catch {
      if (!canUseDemoFallback()) {
        return { customers: [], total: 0 };
      }
      const customers = demoTestimonials.map((testimonial, index) => ({
        id: `demo-customer-${index + 1}`,
        name: testimonial.customerName,
        phone: `0300-00000${index}`,
        email: null,
        address: "Luxury Plaza, Karachi",
        city: ["Lahore", "Karachi", "Islamabad", "Rawalpindi"][index % 4],
        createdAt: new Date().toISOString()
      }));
      return { customers, total: customers.length };
    }
  })();
  return <CustomerManager initialCustomers={customers} initialTotal={total} />;
}
