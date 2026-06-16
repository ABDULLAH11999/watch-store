import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anmolgadgets.com";
  return [
    { url: `${siteUrl}/`, lastModified: new Date() },
    { url: `${siteUrl}/collections`, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    { url: `${siteUrl}/privacy-policy`, lastModified: new Date() },
    { url: `${siteUrl}/terms-conditions`, lastModified: new Date() }
  ];
}
