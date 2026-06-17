"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function useMediaUploader(folder = "anmol-gadgets") {
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return [];
    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          toast.error(data.error || "Upload failed");
          continue;
        }
        if (data.url) urls.push(data.url);
      }
      if (urls.length) {
        toast.success("Upload complete");
      }
      return urls;
    } finally {
      setUploading(false);
    }
  }

  return { uploadFiles, uploading };
}
