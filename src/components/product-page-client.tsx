"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { formatPKR } from "@/lib/utils";
import { SaleCountdown } from "@/components/sale-countdown";
import { StarRating } from "@/components/star-rating";

export function ProductPageClient({
  product
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string | number;
    salePrice?: string | number | null;
    stock: number;
    image: string;
  };
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = Number(product.price);
  const stockLeft = Math.max(0, product.stock || 49);
  const viewers = useMemo(() => 400 + (product.id.length % 90), [product.id]);

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug,
        image: product.image,
        price,
        salePrice
      },
      quantity
    );
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      <div className="space-y-4">
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brown">
          {product.brand}
        </span>
        <h1 className="font-heading text-4xl md:text-6xl">{product.name}</h1>
        <div className="flex items-center gap-3">
          <StarRating value={5} />
          <span className="text-sm text-black/50">(128 reviews)</span>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {salePrice ? (
            <>
              <span className="text-lg text-black/45 line-through">{formatPKR(price)}</span>
              <span className="font-heading text-4xl text-gold">{formatPKR(salePrice)}</span>
            </>
          ) : (
            <span className="font-heading text-4xl">{formatPKR(price)}</span>
          )}
        </div>
        <div className="mt-4">
          <SaleCountdown />
        </div>
      </div>

      <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 text-sm">
        <div className="flex items-center gap-2 text-black/70">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">◎</span>
          <span>{viewers} people are viewing this right now</span>
        </div>
        <div className="flex items-center gap-2 text-black/70">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">🔥</span>
          <span className="uppercase tracking-[0.2em]">Hurry up! Only {stockLeft} left in stock</span>
        </div>
        <div className="h-2 rounded-full bg-black/10">
          <div className="h-full rounded-full bg-black" style={{ width: `${Math.max(35, Math.min(92, stockLeft * 2))}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-2xl border border-black/10 bg-white">
          <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="px-5 py-4 text-2xl">
            -
          </button>
          <span className="min-w-12 px-4 text-center text-lg font-semibold">{quantity}</span>
          <button type="button" onClick={() => setQuantity((current) => current + 1)} className="px-5 py-4 text-2xl">
            +
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className="flex-1 rounded-2xl border-2 border-black bg-black px-6 py-4 font-semibold tracking-[0.2em] text-white transition hover:bg-zinc-800"
        >
          ADD TO CART
        </button>
      </div>

      <button
        onClick={handleBuyNow}
        className="w-full rounded-2xl bg-black px-6 py-4 font-semibold tracking-[0.2em] text-white transition hover:bg-zinc-800"
      >
        BUY IT NOW
      </button>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`I want to order ${product.name}`)}`}
        className="block rounded-2xl bg-[#25D366] px-6 py-4 text-center font-semibold text-black transition hover:opacity-95"
        target="_blank"
        rel="noreferrer"
      >
        Order on WhatsApp
      </a>

      <div className="grid gap-3 rounded-3xl border border-black/10 bg-white p-5 text-sm text-black/70 md:grid-cols-3">
        <span>✓ 100% Authentic</span>
        <span>✓ Free Delivery</span>
        <span>✓ Cash on Delivery</span>
      </div>
    </div>
  );
}
