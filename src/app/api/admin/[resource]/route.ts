import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";
import { customerSchema, productSchema, testimonialSchema, checkoutSchema } from "@/lib/validators";
import { toSlug } from "@/lib/utils";
import { createCheckoutOrder } from "@/lib/order";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

function serializeProduct(product: {
  id: string;
  name: string;
  brand: string;
  price: { toString(): string };
  salePrice: { toString(): string } | null;
  images: unknown;
  stock: number;
  status: string;
  slug: string;
}) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price.toString(),
    salePrice: product.salePrice?.toString() || null,
    images: Array.isArray(product.images) ? (product.images as string[]) : [],
    stock: product.stock,
    status: product.status,
    slug: product.slug
  };
}

function serializeCustomer(customer: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  createdAt: Date;
}) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    createdAt: customer.createdAt.toISOString()
  };
}

function serializeOrder(order: {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: { toString(): string };
  total: { toString(): string };
  createdAt: Date;
  items: unknown;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string;
    city: string;
  };
}) {
  return {
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
  };
}

function formatZodError(error: unknown) {
  if (!(error instanceof ZodError)) return null;
  return error.issues.map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`).join("; ");
}

function refreshStorefront(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path, "page");
  }
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
            { brand: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {};
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (page - 1) * take, take, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where })
    ]);
    return NextResponse.json({ items: items.map(serializeProduct), total });
  }

  if (resource === "customers") {
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const search = url.searchParams.get("search") || "";
    const take = 10;
    const where: Prisma.CustomerWhereInput = search
        ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {};
    const [items, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * take, take, orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where })
    ]);
    return NextResponse.json({ items: items.map(serializeCustomer), total });
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
    return NextResponse.json({ items: items.map(serializeOrder), total });
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
    refreshStorefront(["/", "/collections", `/product/${item.slug}`]);
    return NextResponse.json({ item: serializeProduct(item) });
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
    return NextResponse.json({ item: serializeCustomer(item) });
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
    refreshStorefront(["/", "/product/[slug]"]);
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
    refreshStorefront(["/"]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}
