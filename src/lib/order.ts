import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/utils";
import { adminOrderAlertEmail, orderConfirmationEmail, resolveMailConfig, sendMail } from "@/lib/email";
import type { Prisma } from "@prisma/client";

export type CheckoutItem = {
  productId: string;
  name: string;
  brand: string;
  slug: string;
  image: string;
  quantity: number;
  price: number;
  salePrice?: number | null;
};

export async function nextOrderNumber() {
  const sequence = await prisma.sequence.upsert({
    where: { id: 1 },
    create: { id: 1, lastNumber: 999 },
    update: { lastNumber: { increment: 1 } }
  });

  return `ORD-${sequence.lastNumber}`;
}

export async function createCheckoutOrder(input: {
  customer: { name: string; phone: string; email?: string | null; address: string; city: string };
  items: CheckoutItem[];
  notes?: string | null;
}) {
  const customer = await prisma.customer.upsert({
    where: { phone: input.customer.phone },
    create: {
      name: input.customer.name,
      phone: input.customer.phone,
      email: input.customer.email || null,
      address: input.customer.address,
      city: input.customer.city
    },
    update: {
      name: input.customer.name,
      email: input.customer.email || null,
      address: input.customer.address,
      city: input.customer.city
    }
  });

  const orderNumber = await nextOrderNumber();
  const subtotal = input.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const total = subtotal;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerPhone: customer.phone,
      items: input.items as unknown as Prisma.InputJsonValue,
      subtotal,
      total,
      notes: input.notes || null
    }
  });

  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ["businessInfo"] } }
  });
  const business = settings.find((setting) => setting.key === "businessInfo");
  const businessInfo = business ? JSON.parse(business.value) : {};
  const businessContacts = {
    phone: businessInfo.contactPhone || process.env.SMTP_FROM_EMAIL || "",
    email: businessInfo.contactEmail || process.env.SMTP_FROM_EMAIL || "",
    address: businessInfo.shopAddress || customer.address
  };

  const customerTemplate = orderConfirmationEmail({
    orderNumber,
    customerName: customer.name,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    items: input.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    subtotal,
    total,
    business: businessContacts
  });

  const adminTemplate = adminOrderAlertEmail({
    orderNumber,
    customerName: customer.name,
    customerEmail: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    items: input.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    subtotal,
    total,
    business: businessContacts,
    notes: input.notes || null
  });

  const { adminEmail } = await resolveMailConfig();
  const emailJobs: Array<Promise<unknown>> = [];

  if (input.customer.email) {
    emailJobs.push(
      sendMail({
        to: input.customer.email,
        subject: customerTemplate.subject,
        html: customerTemplate.html,
        template: "order-confirmation"
      })
    );
  }

  if (adminEmail) {
    emailJobs.push(
      sendMail({
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        template: "admin-order-alert"
      })
    );
  }

  await Promise.allSettled(emailJobs);

  return order;
}

export function slugForProduct(name: string) {
  return toSlug(name);
}
