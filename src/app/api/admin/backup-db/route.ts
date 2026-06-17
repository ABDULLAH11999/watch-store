import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

function serializeDates(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeDates);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, current]) => [key, serializeDates(current)])
    );
  }
  return value;
}

type PublicBackupFile = {
  path: string;
  size: number;
  mimeType: string;
  encoding: "base64";
  content: string;
};

async function collectPublicFiles(baseDir: string, currentDir = baseDir): Promise<PublicBackupFile[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const results: PublicBackupFile[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectPublicFiles(baseDir, fullPath)));
      continue;
    }
    if (!entry.isFile()) continue;

    const fileStats = await stat(fullPath);
    const content = await readFile(fullPath);
    const relativePath = path.relative(baseDir, fullPath).split(path.sep).join("/");
    const ext = path.extname(entry.name).toLowerCase();
    const mimeType =
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".webp" ? "image/webp" :
      ext === ".gif" ? "image/gif" :
      ext === ".svg" ? "image/svg+xml" :
      ext === ".mp4" ? "video/mp4" :
      ext === ".webm" ? "video/webm" :
      ext === ".json" ? "application/json" :
      ext === ".txt" ? "text/plain" :
      "application/octet-stream";

    results.push({
      path: relativePath,
      size: fileStats.size,
      mimeType,
      encoding: "base64",
      content: content.toString("base64")
    });
  }

  return results;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [customers, products, orders, testimonials, siteSettings, emailLogs, adminUsers, sequences] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "asc" }, include: { orders: true } }),
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "asc" }, include: { customer: true } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.findMany({ orderBy: { key: "asc" } }),
    prisma.emailLog.findMany({ orderBy: { sentAt: "asc" } }),
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.sequence.findMany({ orderBy: { id: "asc" } })
  ]);

  const publicDir = path.join(process.cwd(), "public");
  const publicFiles = await collectPublicFiles(publicDir);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    tables: {
      customers: serializeDates(customers),
      products: serializeDates(products),
      orders: serializeDates(orders),
      testimonials: serializeDates(testimonials),
      siteSettings: serializeDates(siteSettings),
      emailLogs: serializeDates(emailLogs),
      adminUsers: serializeDates(adminUsers),
      sequences: serializeDates(sequences)
    },
    publicAssets: {
      baseDir: "public",
      files: publicFiles
    }
  };

  const filename = `anmol-gadgets-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const json = JSON.stringify(backup, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
