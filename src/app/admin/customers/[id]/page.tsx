import { prisma } from "@/lib/prisma";
import { CustomerDetail } from "@/components/admin/customer-detail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id }, include: { orders: true } });
  if (!customer) return notFound();

  return (
    <CustomerDetail
      customer={{
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city
      }}
      orders={customer.orders.map((order) => ({
        orderNumber: order.orderNumber,
        total: order.total.toString(),
        status: order.status,
        createdAt: order.createdAt.toISOString()
      }))}
    />
  );
}
