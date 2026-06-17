import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serializeDates(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeDates);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, current]) => [key, serializeDates(current)])
    );
  }
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [customers, products, orders, testimonials, siteSettings, emailLogs, adminUsers, sequences] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "asc" }, include: { orders: true } }),
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "asc" }, include: { customer: true } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.findMany({ orderBy: { key: "asc" } }),
    prisma.emailLog.findMany({ orderBy: { sentAt: "asc" } }),
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.sequence.findMany({ orderBy: { id: "asc" } })
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    tables: {
      customers: serializeDates(customers),
      products: serializeDates(products),
      orders: serializeDates(orders),
      testimonials: serializeDates(testimonials),
      siteSettings: serializeDates(siteSettings),
      emailLogs: serializeDates(emailLogs),
      adminUsers: serializeDates(adminUsers),
      sequences: serializeDates(sequences)
    }
  };

  const filename = `anmol-gadgets-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const json = JSON.stringify(backup, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
