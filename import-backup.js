const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const BACKUP_FILE = 'C:/Users/LapStore/Downloads/anmol-gadgets-backup-2026-07-01T19-18-05-113Z.json';

if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  }
}

const directUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Z1SEArJ9zPyu@ep-twilight-rain-au87jk8e-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
});

function parseDecimal(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (typeof val === 'object' && val.d && Array.isArray(val.d)) {
    const digitsStr = val.d.join('');
    const sign = val.s < 0 ? '-' : '';
    if (val.e >= digitsStr.length - 1) {
      const trailingZeros = '0'.repeat(val.e - (digitsStr.length - 1));
      return parseFloat(sign + digitsStr + trailingZeros);
    } else {
      const intPart = digitsStr.slice(0, val.e + 1);
      const decPart = digitsStr.slice(val.e + 1);
      return parseFloat(sign + intPart + '.' + decPart);
    }
  }
  return Number(val);
}

function parseDate(val) {
  if (!val) return null;
  return new Date(val);
}

async function importBackup() {
  console.log("=== STARTING BACKUP IMPORT ===");
  console.log(`Reading backup file: ${BACKUP_FILE}`);
  
  const rawData = fs.readFileSync(BACKUP_FILE, 'utf8');
  const backup = JSON.parse(rawData);
  const tables = backup.tables;

  console.log("Export metadata:");
  console.log(` - Exported At: ${backup.exportedAt}`);
  console.log(` - Backup Version: ${backup.version}`);

  await prisma.$connect();
  console.log("Connected to PostgreSQL database successfully.\n");

  // 1. Import Sequences
  if (tables.sequences && tables.sequences.length > 0) {
    console.log(`Importing ${tables.sequences.length} sequence record(s)...`);
    for (const seq of tables.sequences) {
      await prisma.sequence.upsert({
        where: { id: seq.id },
        update: {
          lastNumber: seq.lastNumber,
          updatedAt: parseDate(seq.updatedAt) || new Date(),
        },
        create: {
          id: seq.id,
          lastNumber: seq.lastNumber,
          updatedAt: parseDate(seq.updatedAt) || new Date(),
        },
      });
    }
    console.log(" -> Sequences imported.");
  }

  // 2. Import SiteSettings
  if (tables.siteSettings && tables.siteSettings.length > 0) {
    console.log(`Importing ${tables.siteSettings.length} siteSetting record(s)...`);
    for (const setting of tables.siteSettings) {
      await prisma.siteSettings.upsert({
        where: { key: setting.key },
        update: {
          value: typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value),
        },
        create: {
          id: setting.id,
          key: setting.key,
          value: typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value),
        },
      });
    }
    console.log(" -> SiteSettings imported.");
  }

  // 3. Import AdminUsers
  if (tables.adminUsers && tables.adminUsers.length > 0) {
    console.log(`Importing ${tables.adminUsers.length} adminUser record(s)...`);
    for (const user of tables.adminUsers) {
      await prisma.adminUser.upsert({
        where: { email: user.email },
        update: {
          passwordHash: user.passwordHash,
          role: user.role,
          updatedAt: parseDate(user.updatedAt) || new Date(),
        },
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          createdAt: parseDate(user.createdAt) || new Date(),
          updatedAt: parseDate(user.updatedAt) || new Date(),
        },
      });
    }
    console.log(" -> AdminUsers imported.");
  }

  // 4. Import Testimonials
  if (tables.testimonials && tables.testimonials.length > 0) {
    console.log(`Importing ${tables.testimonials.length} testimonial record(s)...`);
    for (const t of tables.testimonials) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {
          customerName: t.customerName,
          customerImage: t.customerImage,
          rating: t.rating,
          reviewText: t.reviewText || "",
          status: t.status,
          sortOrder: t.sortOrder || 0,
          updatedAt: parseDate(t.updatedAt) || new Date(),
        },
        create: {
          id: t.id,
          customerName: t.customerName,
          customerImage: t.customerImage,
          rating: t.rating,
          reviewText: t.reviewText || "",
          status: t.status,
          sortOrder: t.sortOrder || 0,
          createdAt: parseDate(t.createdAt) || new Date(),
          updatedAt: parseDate(t.updatedAt) || new Date(),
        },
      });
    }
    console.log(" -> Testimonials imported.");
  }

  // 5. Import EmailLogs
  if (tables.emailLogs && tables.emailLogs.length > 0) {
    console.log(`Importing ${tables.emailLogs.length} emailLog record(s)...`);
    for (const log of tables.emailLogs) {
      await prisma.emailLog.upsert({
        where: { id: log.id },
        update: {
          toEmail: log.toEmail,
          subject: log.subject,
          template: log.template,
          status: log.status,
          sentAt: parseDate(log.sentAt) || new Date(),
        },
        create: {
          id: log.id,
          toEmail: log.toEmail,
          subject: log.subject,
          template: log.template,
          status: log.status,
          sentAt: parseDate(log.sentAt) || new Date(),
        },
      });
    }
    console.log(" -> EmailLogs imported.");
  }

  // 6. Import Products
  if (tables.products && tables.products.length > 0) {
    console.log(`Importing ${tables.products.length} product record(s)...`);
    for (const p of tables.products) {
      const priceVal = parseDecimal(p.price);
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
          stock: p.stock,
          status: p.status,
          updatedAt: parseDate(p.updatedAt) || new Date(),
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
          stock: p.stock,
          status: p.status,
          createdAt: parseDate(p.createdAt) || new Date(),
          updatedAt: parseDate(p.updatedAt) || new Date(),
        },
      });
    }
    console.log(" -> Products imported.");
  }

  // 7. Import Customers (if any)
  if (tables.customers && tables.customers.length > 0) {
    console.log(`Importing ${tables.customers.length} customer record(s)...`);
    for (const c of tables.customers) {
      await prisma.customer.upsert({
        where: { phone: c.phone },
        update: {
          name: c.name,
          email: c.email || null,
          address: c.address,
          city: c.city,
        },
        create: {
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || null,
          address: c.address,
          city: c.city,
          createdAt: parseDate(c.createdAt) || new Date(),
        },
      });
    }
    console.log(" -> Customers imported.");
  }

  // 8. Import Orders (if any)
  if (tables.orders && tables.orders.length > 0) {
    console.log(`Importing ${tables.orders.length} order record(s)...`);
    for (const o of tables.orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          customerPhone: o.customerPhone,
          items: o.items,
          subtotal: parseDecimal(o.subtotal),
          total: parseDecimal(o.total),
          status: o.status,
          notes: o.notes || null,
          updatedAt: parseDate(o.updatedAt) || new Date(),
        },
        create: {
          id: o.id,
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          customerPhone: o.customerPhone,
          items: o.items,
          subtotal: parseDecimal(o.subtotal),
          total: parseDecimal(o.total),
          status: o.status,
          notes: o.notes || null,
          createdAt: parseDate(o.createdAt) || new Date(),
          updatedAt: parseDate(o.updatedAt) || new Date(),
        },
      });
    }
    console.log(" -> Orders imported.");
  }

  console.log("\n=== FINAL VERIFICATION OF DATABASE RECORD COUNTS ===");
  const finalCounts = {
    customer: await prisma.customer.count(),
    product: await prisma.product.count(),
    order: await prisma.order.count(),
    testimonial: await prisma.testimonial.count(),
    siteSettings: await prisma.siteSettings.count(),
    emailLog: await prisma.emailLog.count(),
    adminUser: await prisma.adminUser.count(),
    sequence: await prisma.sequence.count(),
  };
  console.log(JSON.stringify(finalCounts, null, 2));

  console.log("\n=== IMPORT COMPLETED SUCCESSFULLY! ===");
}

importBackup()
  .catch((err) => {
    console.error("IMPORT ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
