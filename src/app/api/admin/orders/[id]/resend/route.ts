import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { orderConfirmationEmail, sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const order = await prisma.order.findUnique({ where: { id }, include: { customer: true } });
  if (!order || !order.customer.email) return NextResponse.json({ error: "Order email not available" }, { status: 400 });

  const business = await prisma.siteSettings.findUnique({ where: { key: "businessInfo" } });
  const businessInfo = business ? JSON.parse(business.value) : {};
  const template = orderConfirmationEmail({
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    phone: order.customer.phone,
    address: order.customer.address,
    city: order.customer.city,
    items: (order.items as Array<{ name: string; quantity: number; price: number }>).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    business: {
      phone: businessInfo.contactPhone || "",
      email: businessInfo.contactEmail || "",
      address: businessInfo.shopAddress || ""
    }
  });

  await sendMail({ to: order.customer.email, subject: template.subject, html: template.html, template: "order-confirmation" });
  return NextResponse.json({ ok: true });
}
