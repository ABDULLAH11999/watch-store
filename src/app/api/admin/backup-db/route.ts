import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReadStream } from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
      encoding: "base64"
    });
  }

  return results;
}

async function* streamFileBase64(filePath: string): AsyncGenerator<string> {
  const input = createReadStream(filePath);
  let carry = Buffer.alloc(0);

  try {
    for await (const chunk of input) {
      const buffer = Buffer.concat([carry, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
      const remainder = buffer.length % 3;
      const end = buffer.length - remainder;
      if (end > 0) {
        yield buffer.subarray(0, end).toString("base64");
      }
      carry = remainder > 0 ? buffer.subarray(end) : Buffer.alloc(0);
    }

    if (carry.length > 0) {
      yield carry.toString("base64");
    }
  } finally {
    input.destroy();
  }
}

async function* streamJsonBackup(payload: {
  exportedAt: string;
  version: string;
  tables: Record<string, unknown>;
  publicFiles: PublicBackupFile[];
  publicDir: string;
}) {
  yield "{";
  yield `"exportedAt":${JSON.stringify(payload.exportedAt)},`;
  yield `"version":${JSON.stringify(payload.version)},`;
  yield `"tables":{`;

  const tableEntries = Object.entries(payload.tables);
  for (let index = 0; index < tableEntries.length; index++) {
    const [key, value] = tableEntries[index];
    if (index > 0) yield ",";
    yield `${JSON.stringify(key)}:${JSON.stringify(value)}`;
  }

  yield "},";
  yield `"publicAssets":{`;
  yield `"baseDir":"public",`;
  yield `"files":[`;

  for (let index = 0; index < payload.publicFiles.length; index++) {
    const file = payload.publicFiles[index];
    if (index > 0) yield ",";
    yield "{";
    yield `"path":${JSON.stringify(file.path)},`;
    yield `"size":${JSON.stringify(file.size)},`;
    yield `"mimeType":${JSON.stringify(file.mimeType)},`;
    yield `"encoding":"base64",`;
    yield `"content":"`;

    const absolutePath = path.join(payload.publicDir, file.path.split("/").join(path.sep));
    for await (const chunk of streamFileBase64(absolutePath)) {
      yield chunk;
    }

    yield `"}`;
  }

  yield "]";
  yield "}";
  yield "}";
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
    publicFiles,
    publicDir
  };

  const filename = `anmol-gadgets-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const stream = Readable.from(streamJsonBackup(backup));

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
