import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { createCheckoutOrder } from "@/lib/order";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout data", issues: parsed.error.flatten() }, { status: 400 });
    }

    const productIds = parsed.data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productsMap = new Map(products.map((product) => [product.id, product]));

    const items = parsed.data.items.map((item) => {
      const product = productsMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug,
        image: Array.isArray(product.images) ? (product.images[0] as string) : "",
        quantity: item.quantity,
        price: Number(product.salePrice ?? product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null
      };
    });

    const order = await createCheckoutOrder({
      customer: {
        name: parsed.data.customer.name,
        phone: parsed.data.customer.phone,
        email: parsed.data.customer.email ?? null,
        address: parsed.data.customer.address,
        city: parsed.data.customer.city
      },
      items: items.map((item) => ({
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

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to place order" }, { status: 500 });
  }
}
