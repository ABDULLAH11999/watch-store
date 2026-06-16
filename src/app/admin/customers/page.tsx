import { prisma } from "@/lib/prisma";
import { CustomerManager } from "@/components/admin/customer-manager";
import { demoTestimonials } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const serialized = await (async () => {
    try {
      const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
      return customers.map((customer) => ({
        ...customer,
        createdAt: customer.createdAt.toISOString()
      }));
    } catch {
      return demoTestimonials.map((testimonial, index) => ({
        id: `demo-customer-${index + 1}`,
        name: testimonial.customerName,
        phone: `0300-00000${index}`,
        email: null,
        address: "Luxury Plaza, Karachi",
        city: ["Lahore", "Karachi", "Islamabad", "Rawalpindi"][index % 4],
        createdAt: new Date().toISOString()
      }));
    }
  })();
  return <CustomerManager initialCustomers={serialized} />;
}
