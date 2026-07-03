import { v2 as cloudinary } from "cloudinary";
import { createReadStream, createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function normalizeFolder(folder = "anmol-gadgets") {
  const clean = folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (clean.includes("testimonial")) return "testimonials";
  if (clean.includes("product") || clean.includes("watch")) return "watches";
  return clean.split("/").filter(Boolean).pop() || "assets";
}

type UploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: string;
};

async function saveLocallyFromPath(
  sourcePath: string,
  originalName = "",
  folder = "anmol-gadgets"
): Promise<UploadResult> {
  const extension = path.extname(originalName || sourcePath).toLowerCase() || ".bin";
  const safeFolder = normalizeFolder(folder);
  const storedName = `${Date.now()}-${randomUUID()}${extension}`;
  const publicDir = path.join(process.cwd(), "public", safeFolder);
  await mkdir(publicDir, { recursive: true });

  const outputPath = path.join(publicDir, storedName);
  await pipeline(createReadStream(sourcePath), createWriteStream(outputPath));

  const publicPath = `/${safeFolder}/${storedName}`;
  return {
    secure_url: publicPath,
    public_id: `local/${safeFolder}/${storedName}`,
    resource_type: "image" as const
  };
}

async function uploadFilePathToCloudinary(
  sourcePath: string,
  originalName = "",
  folder = "anmol-gadgets"
): Promise<UploadResult> {
  return await new Promise<UploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto", filename_override: originalName || undefined },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type
        });
      }
    );

    const input = createReadStream(sourcePath);
    input.on("error", reject);
    stream.on("error", reject);
    input.pipe(stream);
  });
}

export async function uploadToCloudinary(
  sourcePath: string,
  folder = "anmol-gadgets",
  originalName = ""
) {
  if (!hasCloudinaryConfig()) {
    if (isProduction()) {
      throw new Error("Cloudinary is required in production. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
    }
    return saveLocallyFromPath(sourcePath, originalName, folder);
  }

  try {
    return await uploadFilePathToCloudinary(sourcePath, originalName, folder);
  } catch (error) {
    if (isProduction()) {
      throw error instanceof Error ? error : new Error("Cloudinary upload failed in production. Check Cloudinary credentials and connectivity.");
    }
    return saveLocallyFromPath(sourcePath, originalName, folder);
  }
}
