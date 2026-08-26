import { prisma } from "@/lib/prisma";
import { HeroVideo } from "@/components/hero-video";
import { BrandShowcase } from "@/components/brand-showcase";
import { VideoCardRow } from "@/components/video-card-row";
import { BrandStrip } from "@/components/brand-strip";
import { FeaturedProductsGrid } from "@/components/featured-products-grid";
import { CinematicBanner } from "@/components/cinematic-banner";
import { NewsletterStrip } from "@/components/newsletter-strip";
import { TestimonialCarousel } from "@/components/swiper-testimonials";
import { WhyChooseSection } from "@/components/why-choose-section";
import { FaqSection } from "@/components/faq-section";
import { demoProducts, demoTestimonials } from "@/lib/demo-data";
import { canUseDemoFallback } from "@/lib/demo-fallback";

export const revalidate = 300;

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
    const [allProducts, testimonialRows] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.testimonial.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" }
      })
    ]);

    const seenBrands = new Set<string>();
    const selectedProducts: typeof allProducts = [];

    for (const product of allProducts) {
      const brandKey = (product.brand || "").trim().toLowerCase();
      if (!seenBrands.has(brandKey)) {
        seenBrands.add(brandKey);
        selectedProducts.push(product);
        if (selectedProducts.length === 4) break;
      }
    }

    if (selectedProducts.length < 4) {
      for (const product of allProducts) {
        if (!selectedProducts.some((p) => p.id === product.id)) {
          selectedProducts.push(product);
          if (selectedProducts.length === 4) break;
        }
      }
    }

    featured = selectedProducts.map((product) => ({
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
    const seenBrands = new Set<string>();
    const selectedDemo: typeof demoProducts = [];
    for (const product of demoProducts) {
      const brandKey = (product.brand || "").trim().toLowerCase();
      if (!seenBrands.has(brandKey)) {
        seenBrands.add(brandKey);
        selectedDemo.push(product);
        if (selectedDemo.length === 4) break;
      }
    }
    featured = selectedDemo.map((product) => ({
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

        <div className="order-2">
          <BrandShowcase />
        </div>

        <div className="order-3">
          <BrandStrip />
        </div>

        <section className="order-4 mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-16">
          <div className="mb-4 sm:mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-gold sm:text-sm sm:tracking-[0.4em]">Featured Products</p>
            <h2 className="mt-1 font-heading text-2xl sm:mt-2 sm:text-4xl">Luxury Watches</h2>
          </div>
          <FeaturedProductsGrid products={featured} />
        </section>

        <div className="order-5">
          <VideoCardRow />
        </div>

        <div className="order-6">
          <WhyChooseSection />
        </div>

        <div className="order-7">
          <CinematicBanner />
        </div>

        <section className="order-8 mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-16">
          <div className="mb-4 sm:mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-gold sm:text-sm sm:tracking-[0.4em]">Testimonials</p>
            <h2 className="mt-1 font-heading text-2xl sm:mt-2 sm:text-4xl">What Our Customers Say</h2>
          </div>
          <TestimonialCarousel items={testimonials} />
        </section>

        <div className="order-9">
          <FaqSection />
        </div>

        <div className="order-10">
          <NewsletterStrip />
        </div>
      </div>
    </>
  );
}
