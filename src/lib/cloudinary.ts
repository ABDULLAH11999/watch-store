import { v2 as cloudinary } from "cloudinary";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function normalizeFolder(folder = "anmol-gadgets") {
  const clean = folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (clean.includes("testimonial")) return "testimonials";
  if (clean.includes("product") || clean.includes("watch")) return "watches";
  return clean.split("/").filter(Boolean).pop() || "assets";
}

async function saveLocally(file: File, folder = "anmol-gadgets") {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name || "").toLowerCase() || ".bin";
  const safeFolder = normalizeFolder(folder);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const publicDir = path.join(process.cwd(), "public", safeFolder);
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, fileName), buffer);
  const publicPath = `/${safeFolder}/${fileName}`;
  return {
    secure_url: publicPath,
    public_id: `local/${safeFolder}/${fileName}`,
    resource_type: "image" as const
  };
}

export async function uploadToCloudinary(file: File, folder = "anmol-gadgets") {
  if (!hasCloudinaryConfig()) {
    return saveLocally(file, folder);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    return await new Promise<{ secure_url: string; public_id: string; resource_type: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type
          });
        }
      );
      stream.end(buffer);
    });
  } catch {
    return saveLocally(file, folder);
  }
}
