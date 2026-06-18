import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";
import { customerSchema, productSchema, testimonialSchema, checkoutSchema } from "@/lib/validators";
import { toSlug } from "@/lib/utils";
import { createCheckoutOrder } from "@/lib/order";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

function formatZodError(error: unknown) {
  if (!(error instanceof ZodError)) return null;
  return error.issues.map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`).join("; ");
}

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource } = await context.params;
  const url = new URL(request.url);

  if (resource === "products") {
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const search = url.searchParams.get("search") || "";
    const take = 10;
    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { brand: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {};
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (page - 1) * take, take, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where })
    ]);
    return NextResponse.json({ items, total });
  }

  if (resource === "customers") {
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const search = url.searchParams.get("search") || "";
    const take = 10;
    const where: Prisma.CustomerWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {};
    const [items, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * take, take, orderBy: { createdAt: "desc" }, include: { orders: true } }),
      prisma.customer.count({ where })
    ]);
    return NextResponse.json({ items, total });
  }

  if (resource === "testimonials") {
    const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ items });
  }

  if (resource === "orders") {
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const take = 10;
    const where: Prisma.OrderWhereInput = {
      AND: [
        status ? { status: status as OrderStatus } : {},
        search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" as const } },
                { customer: { is: { name: { contains: search, mode: "insensitive" as const } } } },
                { customerPhone: { contains: search, mode: "insensitive" as const } }
              ]
            }
          : {}
      ]
    };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { customer: true },
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.count({ where })
    ]);
    return NextResponse.json({ items, total });
  }

  if (resource === "settings") {
    const items = await prisma.siteSettings.findMany();
    return NextResponse.json({ items });
  }

  if (resource === "email-logs") {
    const items = await prisma.emailLog.findMany({ orderBy: { sentAt: "desc" }, take: 50 });
    return NextResponse.json({ items });
  }

  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource } = await context.params;
  const body = await request.json();

  if (resource === "products") {
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid product" }, { status: 400 });
    }
    const baseSlug = toSlug(parsed.data.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const item = await prisma.product.create({
      data: {
        name: parsed.data.name,
        brand: parsed.data.brand,
        description: parsed.data.description,
        price: parsed.data.price,
        salePrice: parsed.data.salePrice ?? null,
        saleEndsAt: parsed.data.saleEndsAt ? new Date(parsed.data.saleEndsAt) : null,
        images: parsed.data.images,
        videoUrl: parsed.data.videoUrl ?? null,
        stock: parsed.data.stock,
        status: parsed.data.status,
        slug,
      }
    });
    return NextResponse.json({ item });
  }

  if (resource === "customers") {
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid customer" }, { status: 400 });
    const item = await prisma.customer.upsert({
      where: { phone: parsed.data.phone },
      create: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email ?? null,
        address: parsed.data.address,
        city: parsed.data.city
      },
      update: {
        name: parsed.data.name,
        email: parsed.data.email ?? null,
        address: parsed.data.address,
        city: parsed.data.city
      }
    });
    return NextResponse.json({ item });
  }

  if (resource === "testimonials") {
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid testimonial" }, { status: 400 });
    const item = await prisma.testimonial.create({
      data: {
        customerName: parsed.data.customerName,
        customerImage: parsed.data.customerImage,
        rating: parsed.data.rating,
        reviewText: parsed.data.reviewText,
        status: parsed.data.status,
        sortOrder: parsed.data.sortOrder
      }
    });
    return NextResponse.json({ item });
  }

  if (resource === "orders") {
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid order" }, { status: 400 });
    const order = await createCheckoutOrder({
      customer: {
        name: parsed.data.customer.name,
        phone: parsed.data.customer.phone,
        email: parsed.data.customer.email ?? null,
        address: parsed.data.customer.address,
        city: parsed.data.customer.city
      },
      items: parsed.data.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        slug: item.slug,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        salePrice: item.salePrice ?? null
      })),
      notes: parsed.data.notes
    });
    return NextResponse.json({ item: order });
  }

  if (resource === "settings") {
    const values = body?.values || body || {};
    await prisma.$transaction(
      Object.entries(values).map(([key, value]) =>
        prisma.siteSettings.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) }
        })
      )
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}
