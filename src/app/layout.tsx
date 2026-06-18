import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { getSeoSettings, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const siteUrl = getSiteUrl(seo);
  const ogImage = seo.ogImage?.trim();
  const defaultLogoUrl = `${siteUrl}/ui-image/Logo.png`;
  const resolvedOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${siteUrl}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`
    : defaultLogoUrl;

  return {
    metadataBase: new URL(siteUrl),
    icons: {
      icon: "/ui-image/Logo.png",
      apple: "/ui-image/Logo.png"
    },
    title: {
      default: seo.siteTitle || "Anmol Gadgets",
      template: seo.titleTemplate || "%s | Anmol Gadgets"
    },
    description: seo.metaDescription,
    keywords: seo.metaKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    alternates: {
      canonical: siteUrl
    },
    openGraph: {
      title: seo.ogTitle || seo.siteTitle || "Anmol Gadgets",
      description: seo.ogDescription || seo.metaDescription,
      url: siteUrl,
      siteName: seo.siteTitle || "Anmol Gadgets",
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle || seo.siteTitle || "Anmol Gadgets"
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || seo.siteTitle || "Anmol Gadgets",
      description: seo.ogDescription || seo.metaDescription,
      images: [resolvedOgImage]
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
