import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPageClient } from "@/components/product-page-client";
import { ProductCard } from "@/components/product-card";
import { demoProducts } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: any = null;
  let related: Array<any> = [];

  try {
    product = await prisma.product.findUnique({ where: { slug: params.slug } });
    if (product && product.status === "PUBLISHED") {
      related = await prisma.product.findMany({
        where: {
          brand: product.brand,
          id: { not: product.id },
          status: "PUBLISHED"
        },
        take: 4
      });
    } else if (!product) {
      product = demoProducts.find((item) => item.slug === params.slug) ?? null;
      if (product) {
        related = demoProducts.filter((item) => item.brand === product.brand && item.slug !== product.slug).slice(0, 4);
      }
    }
  } catch {
    product = demoProducts.find((item) => item.slug === params.slug) ?? null;
    if (product) {
      related = demoProducts.filter((item) => item.brand === product.brand && item.slug !== product.slug).slice(0, 4);
    }
  }

  if (!product) return notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/watches/classic-fusion-titanium.jpg"]}
          videoUrl={product.videoUrl}
          name={product.name}
        />
        <ProductPageClient
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            brand: product.brand,
            price: product.price.toString(),
            salePrice: product.salePrice?.toString() || null,
            stock: product.stock ?? 0,
            image: (Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/watches/classic-fusion-titanium.jpg"])[0]
          }}
        />
      </div>

      <section className="mt-16">
        <h2 className="font-heading text-3xl">Description</h2>
        <div className="prose prose-lg mt-5 max-w-none rounded-3xl border border-black/10 bg-white p-6">
          <div
            dangerouslySetInnerHTML={{
              __html:
                product.description ||
                `<p>${product.name} is a signature ${product.brand} masterpiece, crafted for collectors who value precision and prestige.</p>`
            }}
          />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-3xl">Related Products</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.id,
                name: item.name,
                slug: item.slug,
                brand: item.brand,
                price: item.price.toString(),
                salePrice: item.salePrice?.toString() || null,
                images: Array.isArray(item.images) && item.images.length ? (item.images as string[]) : ["/watches/classic-fusion-titanium.jpg"]
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
