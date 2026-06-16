"use client";

import { useCart } from "@/components/cart-context";
import { ProductCard } from "@/components/product-card";

export function FeaturedProductsGrid({
  products
}: {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string | number;
    salePrice?: string | number | null;
    images: string[];
  }>;
  }) {
  const { addItem } = useCart();
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() =>
            addItem({
              productId: product.id,
              name: product.name,
              brand: product.brand,
              slug: product.slug,
              image: product.images?.[0] || "/watches/classic-fusion-titanium.jpg",
              price: Number(product.price),
              salePrice: product.salePrice ? Number(product.salePrice) : null
            })
          }
        />
      ))}
    </div>
  );
}
