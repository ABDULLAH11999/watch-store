import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HeroVideo } from "@/components/hero-video";
import { VideoCardRow } from "@/components/video-card-row";
import { BrandStrip } from "@/components/brand-strip";
import { FeaturedProductsGrid } from "@/components/featured-products-grid";
import { CinematicBanner } from "@/components/cinematic-banner";
import { NewsletterStrip } from "@/components/newsletter-strip";
import { TestimonialCarousel } from "@/components/swiper-testimonials";
import { ProductCard } from "@/components/product-card";
import { demoProducts, demoTestimonials } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured: Array<{
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string;
    salePrice: string | null;
    images: string[];
  }> = [];
  let testimonials: Array<{ id: string; customerName: string; customerImage: string; rating: number; reviewText: string }> = [];

  try {
    const [products, testimonialRows] = await Promise.all([
        prisma.product.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 10
        }),
      prisma.testimonial.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" }
      })
    ]);

    featured = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || null,
      images: Array.isArray(product.images) ? (product.images as string[]) : []
    }));
    testimonials = testimonialRows.map((item) => ({
      id: item.id,
      customerName: item.customerName,
      customerImage: item.customerImage,
      rating: item.rating,
      reviewText: item.reviewText
    }));
  } catch {
    featured = [];
    testimonials = [];
  }

  if (featured.length === 0) {
    featured = demoProducts.slice(0, 10).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price,
      salePrice: product.salePrice,
      images: [...product.images]
    }));
    testimonials = demoTestimonials.map((item) => ({
      id: item.id,
      customerName: item.customerName,
      customerImage: item.customerImage,
      rating: item.rating,
      reviewText: item.reviewText
    }));
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="order-1">
          <HeroVideo />
        </div>

        <section className="order-2 mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:px-8 lg:py-10">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-6 sm:items-end sm:gap-4">
            <div className="min-w-0">
              <p className="hidden text-sm uppercase tracking-[0.4em] text-gold sm:block">Curated Portrait Stories</p>
              <h2 className="truncate font-heading text-2xl text-ink sm:mt-2 sm:text-3xl">Anmol Gadgets</h2>
            </div>
            <Link
              href="/collections"
              className="inline-flex shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:px-5 sm:py-3"
            >
              View Collection
            </Link>
          </div>
        </section>

        <section className="order-3 mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:order-4 lg:px-8 lg:py-16">
          <div className="mb-4 sm:mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-gold sm:text-sm sm:tracking-[0.4em]">Featured Products</p>
            <h2 className="mt-1 font-heading text-2xl sm:mt-2 sm:text-4xl">Luxury Watches</h2>
          </div>
          <FeaturedProductsGrid products={featured} />
        </section>

        <div className="order-4 lg:order-3">
          <VideoCardRow />
        </div>

        <div className="order-5">
          <BrandStrip />
        </div>

        <div className="order-6">
          <CinematicBanner />
        </div>

        <section className="order-7 mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-16">
          <div className="mb-4 sm:mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-gold sm:text-sm sm:tracking-[0.4em]">Testimonials</p>
            <h2 className="mt-1 font-heading text-2xl sm:mt-2 sm:text-4xl">What Our Customers Say</h2>
          </div>
          <TestimonialCarousel items={testimonials} />
        </section>

        <div className="order-8">
          <NewsletterStrip />
        </div>
      </div>
    </>
  );
}
