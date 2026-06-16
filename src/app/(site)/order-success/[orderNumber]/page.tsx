import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  let order: any = null;
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { customer: true }
    });
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-4xl">Order not found</h1>
      </div>
    );
  }

  const items = order.items as Array<{ name: string; quantity: number; price: number }>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8">
      <p className="text-sm uppercase tracking-[0.4em] text-gold">Order Placed</p>
      <h1 className="mt-3 font-heading text-5xl">Thank you {order.customer.name}!</h1>
      <p className="mt-4 text-lg text-black/65">Your order {order.orderNumber} has been placed.</p>
      <p className="mt-2 text-black/65">Our team will contact you on {order.customer.phone} to confirm delivery.</p>
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 text-left shadow-sm">
        <h2 className="font-heading text-2xl">Order Summary</h2>
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{formatPKR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 font-semibold">
          <span>Total</span>
          <span>{formatPKR(Number(order.total))}</span>
        </div>
      </div>
      <Link href="/collections" className="mt-10 inline-flex rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-zinc-800">
        Continue Shopping
      </Link>
    </div>
  );
}
