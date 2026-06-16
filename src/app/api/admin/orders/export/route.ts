import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const orders = await prisma.order.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } });
  const rows = [
    ["Order Number", "Customer", "Phone", "Status", "Subtotal", "Total", "Created At"].join(","),
    ...orders.map((order) =>
      [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        order.status,
        Number(order.subtotal),
        Number(order.total),
        order.createdAt.toISOString()
      ].join(",")
    )
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="orders.csv"'
    }
  });
}
