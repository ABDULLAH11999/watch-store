import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  saleEndsAt: z.string().datetime().optional().nullable(),
  images: z.array(z.string().url()).min(1),
  videoUrl: z.string().url().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "OUT_OF_STOCK"])
});

export const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().nullable(),
  address: z.string().min(2),
  city: z.string().min(2)
});

export const testimonialSchema = z.object({
  customerName: z.string().min(2),
  customerImage: z.string().url(),
  rating: z.coerce.number().int().min(1).max(5),
  reviewText: z.string().min(10),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  sortOrder: z.coerce.number().int().min(0)
});

export const orderStatusSchema = z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]);

export const checkoutSchema = z.object({
  customer: customerSchema,
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        brand: z.string(),
        slug: z.string(),
        image: z.string().url(),
        quantity: z.coerce.number().int().min(1),
        price: z.coerce.number().min(0),
        salePrice: z.coerce.number().min(0).optional().nullable()
      })
    )
    .min(1)
});
