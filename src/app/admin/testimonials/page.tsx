import { prisma } from "@/lib/prisma";
import { TestimonialManager } from "@/components/admin/testimonial-manager";
import { demoTestimonials } from "@/lib/demo-data";
import { canUseDemoFallback } from "@/lib/demo-fallback";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const serialized = await (async () => {
    try {
      const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
      return testimonials.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }));
    } catch {
      if (!canUseDemoFallback()) {
        return [];
      }
      return demoTestimonials.map((item, index) => ({
        id: item.id,
        customerName: item.customerName,
        customerImage: item.customerImage,
        rating: item.rating,
        reviewText: item.reviewText,
        status: index % 2 === 0 ? "PUBLISHED" : "DRAFT",
        sortOrder: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
  })();
  return <TestimonialManager initialTestimonials={serialized} />;
}
