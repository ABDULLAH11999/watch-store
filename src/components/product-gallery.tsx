"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { MediaImage } from "@/components/media-image";

export function ProductGallery({ images, videoUrl, name }: { images: string[]; videoUrl?: string | null; name: string }) {
  const [active, setActive] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const tabs = useMemo(() => (videoUrl ? ["Images", "Video"] : ["Images"]), [videoUrl]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
        {active === 0 ? (
          <div className="relative aspect-square overflow-hidden">
            <MediaImage
              src={images[activeImage] || images[0]}
              alt={name}
              fill
              className="object-cover transition duration-500 hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <video src={videoUrl || ""} controls autoPlay muted loop playsInline className="aspect-square w-full object-cover" />
        )}
      </div>
      <div className="flex gap-3">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActive(index)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${active === index ? "bg-ink text-white" : "border border-black/10 bg-white"}`}
          >
            {index === 1 && <Play className="mr-2 inline h-4 w-4" />}
            {tab}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button key={image} onClick={() => { setActive(0); setActiveImage(index); }} className="overflow-hidden rounded-2xl border border-black/10">
            <MediaImage src={image} alt={`${name} thumbnail ${index + 1}`} width={150} height={150} className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
