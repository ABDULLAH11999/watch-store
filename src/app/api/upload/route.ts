import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createWriteStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { Readable } from "stream";

const Busboy = require("busboy");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
    }

    const body = request.body;
    if (!body) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), "watch-store-uploads");
    await mkdir(tempDir, { recursive: true });

    let folder = "anmol-gadgets";
    let originalName = "";
    let tempFilePath = "";
    const writeTasks: Promise<void>[] = [];

    const busboy = Busboy({
      headers: Object.fromEntries(request.headers)
    });

    const parsePromise = new Promise<void>((resolve, reject) => {
      busboy.on("field", (fieldName: string, value: string) => {
        if (fieldName === "folder" && value) {
          folder = value;
        }
      });

      busboy.on("file", (fieldName: string, file: NodeJS.ReadableStream, filename: string) => {
        if (fieldName !== "file") {
          file.resume();
          return;
        }

        originalName = filename || "upload.bin";
        const extension = path.extname(originalName).toLowerCase() || ".bin";
        tempFilePath = path.join(tempDir, `${Date.now()}-${randomUUID()}${extension}`);
        const output = createWriteStream(tempFilePath);

        const writePromise = new Promise<void>((resolveWrite, rejectWrite) => {
          output.on("finish", resolveWrite);
          output.on("error", rejectWrite);
          file.on("error", rejectWrite);
        });

        writeTasks.push(writePromise);
        file.pipe(output);
      });

      busboy.on("error", reject);
      busboy.on("finish", resolve);
    });

    const source = Readable.fromWeb(body as any);
    source.on("error", () => busboy.destroy(new Error("Request stream failed")));
    source.pipe(busboy);

    await parsePromise;
    await Promise.all(writeTasks);

    if (!tempFilePath) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    try {
      const result = await uploadToCloudinary(tempFilePath, folder, originalName);
      return NextResponse.json({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
    } finally {
      await unlink(tempFilePath).catch(() => {});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
