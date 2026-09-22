import { PrismaClient, Prisma, ProductStatus, TestimonialStatus, AdminRole, OrderStatus, EmailStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function parseDecimal(val: any): Prisma.Decimal | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" || typeof val === "string") return new Prisma.Decimal(val);
  if (typeof val === "object" && val.d && Array.isArray(val.d)) {
    const digitsStr = val.d.join("");
    const sign = val.s < 0 ? "-" : "";
    if (val.e >= digitsStr.length - 1) {
      const trailingZeros = "0".repeat(val.e - (digitsStr.length - 1));
      return new Prisma.Decimal(sign + digitsStr + trailingZeros);
    } else {
      const intPart = digitsStr.slice(0, val.e + 1);
      const decPart = digitsStr.slice(val.e + 1);
      return new Prisma.Decimal(sign + intPart + "." + decPart);
    }
  }
  return new Prisma.Decimal(Number(val));
}

function parseDate(val: any): Date | null {
  if (!val) return null;
  return new Date(val);
}

async function seedFromBackup(backupFilePath: string): Promise<boolean> {
  console.log(`[SEED] Reading backup JSON: ${backupFilePath}`);
  const rawData = fs.readFileSync(backupFilePath, "utf8");
  const backup = JSON.parse(rawData);
  const tables = backup.tables || {};

  console.log(`[SEED] Backup Version: ${backup.version}, Exported At: ${backup.exportedAt}`);

  // 1. Sequences
  if (Array.isArray(tables.sequences) && tables.sequences.length > 0) {
    console.log(`[SEED] Upserting ${tables.sequences.length} sequence(s)...`);
    for (const seq of tables.sequences) {
      await prisma.sequence.upsert({
        where: { id: seq.id },
        update: {
          lastNumber: seq.lastNumber,
          updatedAt: parseDate(seq.updatedAt) || new Date()
        },
        create: {
          id: seq.id,
          lastNumber: seq.lastNumber,
          updatedAt: parseDate(seq.updatedAt) || new Date()
        }
      });
    }
  }

  // 2. SiteSettings
  if (Array.isArray(tables.siteSettings) && tables.siteSettings.length > 0) {
    console.log(`[SEED] Upserting ${tables.siteSettings.length} site setting(s)...`);
    for (const setting of tables.siteSettings) {
      const valStr = typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value);
      await prisma.siteSettings.upsert({
        where: { key: setting.key },
        update: { value: valStr },
        create: {
          id: setting.id || undefined,
          key: setting.key,
          value: valStr
        }
      });
    }
  }

  // 3. AdminUsers
  if (Array.isArray(tables.adminUsers) && tables.adminUsers.length > 0) {
    console.log(`[SEED] Upserting ${tables.adminUsers.length} admin user(s)...`);
    for (const user of tables.adminUsers) {
      await prisma.adminUser.upsert({
        where: { email: user.email },
        update: {
          passwordHash: user.passwordHash,
          role: user.role as AdminRole,
          updatedAt: parseDate(user.updatedAt) || new Date()
        },
        create: {
          id: user.id || undefined,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role as AdminRole,
          createdAt: parseDate(user.createdAt) || new Date(),
          updatedAt: parseDate(user.updatedAt) || new Date()
        }
      });
    }
  }

  // 4. Testimonials
  if (Array.isArray(tables.testimonials) && tables.testimonials.length > 0) {
    console.log(`[SEED] Upserting ${tables.testimonials.length} testimonial(s)...`);
    for (const t of tables.testimonials) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {
          customerName: t.customerName,
          customerImage: t.customerImage,
          rating: t.rating,
          reviewText: t.reviewText || "",
          status: t.status as TestimonialStatus,
          sortOrder: t.sortOrder || 0,
          updatedAt: parseDate(t.updatedAt) || new Date()
        },
        create: {
          id: t.id,
          customerName: t.customerName,
          customerImage: t.customerImage,
          rating: t.rating,
          reviewText: t.reviewText || "",
          status: t.status as TestimonialStatus,
          sortOrder: t.sortOrder || 0,
          createdAt: parseDate(t.createdAt) || new Date(),
          updatedAt: parseDate(t.updatedAt) || new Date()
        }
      });
    }
  }

  // 5. EmailLogs
  if (Array.isArray(tables.emailLogs) && tables.emailLogs.length > 0) {
    console.log(`[SEED] Upserting ${tables.emailLogs.length} email log(s)...`);
    for (const log of tables.emailLogs) {
      await prisma.emailLog.upsert({
        where: { id: log.id },
        update: {
          toEmail: log.toEmail,
          subject: log.subject,
          template: log.template,
          status: log.status as EmailStatus,
          sentAt: parseDate(log.sentAt) || new Date()
        },
        create: {
          id: log.id,
          toEmail: log.toEmail,
          subject: log.subject,
          template: log.template,
          status: log.status as EmailStatus,
          sentAt: parseDate(log.sentAt) || new Date()
        }
      });
    }
  }

  // 6. Products
  if (Array.isArray(tables.products) && tables.products.length > 0) {
    console.log(`[SEED] Upserting ${tables.products.length} product(s)...`);
    for (const p of tables.products) {
      const priceVal = parseDecimal(p.price) || new Prisma.Decimal(0);
      const salePriceVal = parseDecimal(p.salePrice);

      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          description: p.description,
          price: priceVal,
          salePrice: salePriceVal,
          saleEndsAt: parseDate(p.saleEndsAt),
          images: p.images,
          videoUrl: p.videoUrl || null,
          stock: p.stock ?? 0,
          status: p.status as ProductStatus,
          updatedAt: parseDate(p.updatedAt) || new Date()
        },
        create: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          description: p.description,
          price: priceVal,
          salePrice: salePriceVal,
          saleEndsAt: parseDate(p.saleEndsAt),
          images: p.images,
          videoUrl: p.videoUrl || null,
          stock: p.stock ?? 0,
          status: p.status as ProductStatus,
          createdAt: parseDate(p.createdAt) || new Date(),
          updatedAt: parseDate(p.updatedAt) || new Date()
        }
      });
    }
  }

  // 7. Customers
  if (Array.isArray(tables.customers) && tables.customers.length > 0) {
    console.log(`[SEED] Upserting ${tables.customers.length} customer(s)...`);
    for (const c of tables.customers) {
      await prisma.customer.upsert({
        where: { phone: c.phone },
        update: {
          name: c.name,
          email: c.email || null,
          address: c.address,
          city: c.city
        },
        create: {
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || null,
          address: c.address,
          city: c.city,
          createdAt: parseDate(c.createdAt) || new Date()
        }
      });
    }
  }

  // 8. Orders
  if (Array.isArray(tables.orders) && tables.orders.length > 0) {
    console.log(`[SEED] Upserting ${tables.orders.length} order(s)...`);
    for (const o of tables.orders) {
      const subtotalVal = parseDecimal(o.subtotal) || new Prisma.Decimal(0);
      const totalVal = parseDecimal(o.total) || new Prisma.Decimal(0);

      await prisma.order.upsert({
        where: { id: o.id },
        update: {
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          customerPhone: o.customerPhone,
          items: o.items,
          subtotal: subtotalVal,
          total: totalVal,
          status: o.status as OrderStatus,
          notes: o.notes || null,
          updatedAt: parseDate(o.updatedAt) || new Date()
        },
        create: {
          id: o.id,
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          customerPhone: o.customerPhone,
          items: o.items,
          subtotal: subtotalVal,
          total: totalVal,
          status: o.status as OrderStatus,
          notes: o.notes || null,
          createdAt: parseDate(o.createdAt) || new Date(),
          updatedAt: parseDate(o.updatedAt) || new Date()
        }
      });
    }
  }

  console.log("[SEED] Backup data imported successfully.");
  return true;
}

async function main() {
  const backupDir = path.join(process.cwd(), "database-backup");
  let backupFile: string | null = null;

  if (fs.existsSync(backupDir)) {
    const jsonFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith(".json"));
    if (jsonFiles.length > 0) {
      backupFile = path.join(backupDir, jsonFiles[0]);
    }
  }

  if (backupFile && fs.existsSync(backupFile)) {
    await seedFromBackup(backupFile);
  } else {
    console.log("[SEED] No backup JSON found, running default fallback seed...");
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
  }

  console.log("\n=== DATABASE COUNTS ===");
  console.log({
    sequences: await prisma.sequence.count(),
    siteSettings: await prisma.siteSettings.count(),
    adminUsers: await prisma.adminUser.count(),
    testimonials: await prisma.testimonial.count(),
    emailLogs: await prisma.emailLog.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    orders: await prisma.order.count()
  });
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

