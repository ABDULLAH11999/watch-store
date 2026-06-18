import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { customerSchema, productSchema, testimonialSchema, orderStatusSchema } from "@/lib/validators";
import { toSlug } from "@/lib/utils";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

function formatZodError(error: unknown) {
  if (!(error instanceof ZodError)) return null;
  return error.issues.map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`).join("; ");
}

export async function GET(_: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource, id } = await context.params;

  if (resource === "products") {
    const item = await prisma.product.findUnique({ where: { id } });
    return NextResponse.json({ item });
  }
  if (resource === "customers") {
    const item = await prisma.customer.findUnique({ where: { id }, include: { orders: true } });
    return NextResponse.json({ item });
  }
  if (resource === "testimonials") {
    const item = await prisma.testimonial.findUnique({ where: { id } });
    return NextResponse.json({ item });
  }
  if (resource === "orders") {
    const item = await prisma.order.findUnique({ where: { id }, include: { customer: true } });
    return NextResponse.json({ item });
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}

export async function PUT(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource, id } = await context.params;
  const body = await request.json();

  if (resource === "products") {
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid product" }, { status: 400 });
    const baseSlug = toSlug(parsed.data.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findFirst({ where: { slug, id: { not: id } } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const item = await prisma.product.update({
      where: { id },
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
    const item = await prisma.customer.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
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
    const item = await prisma.testimonial.update({
      where: { id },
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
    const status = orderStatusSchema.safeParse(body.status);
    if (!status.success) return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    const item = await prisma.order.update({
      where: { id },
      data: {
        status: status.data,
        notes: body.notes ?? undefined
      },
      include: { customer: true }
    });
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}

export async function DELETE(_: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource, id } = await context.params;

  if (resource === "products") {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  if (resource === "customers") {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  if (resource === "testimonials") {
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  if (resource === "orders") {
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}
