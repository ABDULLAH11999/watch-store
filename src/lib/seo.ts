import { getSetting } from "@/lib/settings";

export type SeoSettings = {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  canonicalUrl: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  headerScripts: string;
  footerScripts: string;
  robotsTxt: string;
};

const defaultSeoSettings: SeoSettings = {
  siteTitle: "Anmol Gadgets",
  titleTemplate: "%s | Anmol Gadgets",
  metaDescription: "Luxury watch store in Pakistan for premium Swiss timepieces.",
  canonicalUrl: "",
  metaKeywords: "",
  ogTitle: "Anmol Gadgets",
  ogDescription: "Luxury watch store in Pakistan for premium Swiss timepieces.",
  ogImage: "",
  headerScripts: "",
  footerScripts: "",
  robotsTxt: ""
};

export function getSiteUrl(seo?: Partial<SeoSettings>) {
  const configured = seo?.canonicalUrl?.trim();
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = configured || envUrl || "https://anmolgadgets.com";
  try {
    const normalized = new URL(fallback);
    return normalized.origin;
  } catch {
    return "https://anmolgadgets.com";
  }
}

export async function getSeoSettings() {
  const seo = await getSetting<SeoSettings>("seoSettings", defaultSeoSettings);
  return { ...defaultSeoSettings, ...seo };
}
