import { PrismaClient, Prisma, ProductStatus, TestimonialStatus, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  slug: string;
  imageUrl: string;
};

const saleEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const products: SeedProduct[] = [
  { name: "Classic Fusion Titanium", brand: "HUBLOT", price: 4850000, salePrice: 4200000, slug: "classic-fusion-titanium", imageUrl: "/watches/classic-fusion-titanium.jpg" },
  { name: "Big Bang Unico Black", brand: "HUBLOT", price: 6200000, slug: "big-bang-unico-black", imageUrl: "/watches/big-bang-unico-black.jpg" },
  { name: "Spirit of Big Bang", brand: "HUBLOT", price: 5500000, salePrice: 4900000, slug: "spirit-of-big-bang", imageUrl: "/watches/spirit-of-big-bang.jpg" },
  { name: "MP-05 LaFerrari", brand: "HUBLOT", price: 9800000, slug: "mp-05-laferrari", imageUrl: "/watches/mp-05-laferrari.jpg" },
  { name: "Nautilus 5711", brand: "PATEK PHILIPPE", price: 12500000, slug: "nautilus-5711", imageUrl: "/watches/nautilus-5711.jpg" },
  { name: "Aquanaut 5167", brand: "PATEK PHILIPPE", price: 8900000, salePrice: 7800000, slug: "aquanaut-5167", imageUrl: "/watches/aquanaut-5167.jpg" },
  { name: "Grand Complications 5270", brand: "PATEK PHILIPPE", price: 18000000, slug: "grand-complications-5270", imageUrl: "/watches/grand-complications-5270.jpg" },
  { name: "Calatrava 5196", brand: "PATEK PHILIPPE", price: 7200000, slug: "calatrava-5196", imageUrl: "/watches/calatrava-5196.jpg" }
];

const testimonials = [
  { customerName: "Ali Hassan", rating: 5, reviewText: "The watch was delivered exactly as shown. Packaging, service, and communication were all first class.", imageUrl: "/testimonials/1.webp", sortOrder: 1 },
  { customerName: "Fatima Khan", rating: 5, reviewText: "Anmol Gadgets feels like a true luxury boutique. The team was helpful and very professional.", imageUrl: "/testimonials/2.webp", sortOrder: 2 },
  { customerName: "Usman Malik", rating: 5, reviewText: "Authentic pieces, quick responses, and premium presentation. Highly recommended.", imageUrl: "/testimonials/3.webp", sortOrder: 3 },
  { customerName: "Zara Ahmed", rating: 5, reviewText: "The site looks elegant and the collection feels very premium on mobile.", imageUrl: "/testimonials/4.webp", sortOrder: 4 }
];

async function main() {
  await prisma.sequence.upsert({
    where: { id: 1 },
    create: { id: 1, lastNumber: 999 },
    update: {}
  });

  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: "admin@anmolgadgets.com" }
  });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: { email: "admin@anmolgadgets.com", passwordHash, role: AdminRole.SUPERADMIN }
    });
  }

  const businessInfo = {
    contactPhone: "+92 300 1234567",
    contactEmail: "hello@anmolgadgets.com",
    shopAddress: "Clifton, Karachi, Pakistan",
    whatsappNumber: "+923001234567"
  };

  const seoSettings = {
    siteTitle: "Anmol Gadgets",
    titleTemplate: "%s | Anmol Gadgets",
    metaDescription: "Luxury Swiss watches in Pakistan.",
    canonicalUrl: "https://anmolgadgets.com",
    metaKeywords: "luxury watches, hublot, patek philippe, pakistan",
    ogTitle: "Anmol Gadgets",
    ogDescription: "Premium Swiss timepieces.",
    ogImage: "",
    headerScripts: "",
    footerScripts: "",
    robotsTxt: "User-agent: *\nAllow: /"
  };

  const emailSettings = {
    host: "",
    port: "587",
    user: "",
    password: "",
    fromName: "Anmol Gadgets",
    fromEmail: "no-reply@anmolgadgets.com"
  };

  await prisma.siteSettings.createMany({
    data: [
      { key: "businessInfo", value: JSON.stringify(businessInfo) },
      { key: "seoSettings", value: JSON.stringify(seoSettings) },
      { key: "emailSettings", value: JSON.stringify(emailSettings) }
    ],
    skipDuplicates: true
  });

  for (const product of products) {
    const existingProduct = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (!existingProduct) {
      await prisma.product.create({
        data: {
          name: product.name,
          brand: product.brand,
          description: `<p>${product.name} is a signature ${product.brand} masterpiece, crafted for collectors who value precision and prestige.</p>`,
          price: new Prisma.Decimal(product.price),
          salePrice: product.salePrice ? new Prisma.Decimal(product.salePrice) : null,
          saleEndsAt: product.salePrice ? saleEndsAt : null,
          images: [product.imageUrl],
          videoUrl: null,
          stock: 5,
          status: ProductStatus.PUBLISHED,
          slug: product.slug
        }
      });
    }
  }

  for (const testimonial of testimonials) {
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: { customerName: testimonial.customerName }
    });
    if (!existingTestimonial) {
      await prisma.testimonial.create({
        data: {
          customerName: testimonial.customerName,
          customerImage: testimonial.imageUrl,
          rating: testimonial.rating,
          reviewText: testimonial.reviewText,
          status: TestimonialStatus.PUBLISHED,
          sortOrder: testimonial.sortOrder
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
