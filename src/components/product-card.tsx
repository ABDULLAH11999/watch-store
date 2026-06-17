 "use client";

import Link from "next/link";
import { formatPKR } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { normalizeMediaUrl } from "@/lib/media";
import { MediaImage } from "@/components/media-image";

export function ProductCard({
  product,
  onAddToCart
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string | number;
    salePrice?: string | number | null;
    images: string[];
  };
  onAddToCart?: () => void;
}) {
  const image = normalizeMediaUrl(product.images?.[0] || "/watches/classic-fusion-titanium.jpg");
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = Number(product.price);
  return (
    <div className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-luxe">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
          <MediaImage
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </Link>
      <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
        <span className="inline-flex rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brown sm:px-3 sm:text-xs sm:tracking-[0.24em]">
          {product.brand}
        </span>
        <Link href={`/product/${product.slug}`} className="block font-heading text-lg text-ink sm:text-xl">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-xs text-black/45 line-through sm:text-sm">{formatPKR(price)}</span>
              <span className="font-semibold text-gold">{formatPKR(salePrice)}</span>
            </>
          ) : (
            <span className="font-semibold text-ink">{formatPKR(price)}</span>
          )}
        </div>
        <button
          onClick={onAddToCart}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:px-4 sm:py-3 sm:text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
