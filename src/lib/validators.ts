import { z } from "zod";

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export const productSchema = z.object({
  name: z.string().trim().min(2),
  brand: z.string().trim().min(2),
  description: z
    .string()
    .min(1)
    .refine((value) => stripHtml(value).length > 0, {
      message: "Description must contain text"
    }),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  saleEndsAt: z.string().datetime().optional().nullable(),
  images: z.array(z.string().min(1)).min(1),
  videoUrl: z.string().trim().min(1).optional().nullable(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "OUT_OF_STOCK"])
});

export const customerSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  email: z.string().trim().email().optional().nullable(),
  address: z.string().trim().min(2),
  city: z.string().trim().min(2)
});

export const testimonialSchema = z.object({
  customerName: z.string().trim().min(2),
  customerImage: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1).max(5).optional().default(5),
  reviewText: z.string().trim().optional().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
  sortOrder: z.coerce.number().int().min(0).optional().default(0)
});

export const orderStatusSchema = z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]);

export const checkoutSchema = z.object({
  customer: customerSchema,
  notes: z.string().trim().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string().trim(),
        brand: z.string().trim(),
        slug: z.string().trim(),
        image: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1),
        price: z.coerce.number().min(0),
        salePrice: z.coerce.number().min(0).optional().nullable()
      })
    )
    .min(1)
});
