"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { normalizeMediaUrl } from "@/lib/media";

type MediaImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function MediaImage({ src, fallbackSrc = "/ui-image/ui.webp", alt, ...props }: MediaImageProps) {
  const normalized = useMemo(() => normalizeMediaUrl(src), [src]);
  const isLocalAsset = normalized.startsWith("/");
  const [currentSrc, setCurrentSrc] = useState(normalized || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(normalized || fallbackSrc);
  }, [normalized, fallbackSrc]);

  return (
    <Image
      {...props}
      src={currentSrc || fallbackSrc}
      alt={alt}
      unoptimized={isLocalAsset}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
}
