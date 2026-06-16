import { prisma } from "@/lib/prisma";
import { getSeoSettings, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(url: string, lastmod: string) {
  return [
    "<url>",
    `  <loc>${escapeXml(url)}</loc>`,
    `  <lastmod>${lastmod}</lastmod>`,
    "</url>"
  ].join("\n");
}

export async function GET() {
  const seo = await getSeoSettings();
  const siteUrl = getSiteUrl(seo);

  const [products] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true
      },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const routes = [
    { url: `${siteUrl}/`, lastmod: new Date().toISOString() },
    { url: `${siteUrl}/collections`, lastmod: new Date().toISOString() },
    { url: `${siteUrl}/about`, lastmod: new Date().toISOString() },
    { url: `${siteUrl}/contact`, lastmod: new Date().toISOString() },
    { url: `${siteUrl}/privacy-policy`, lastmod: new Date().toISOString() },
    { url: `${siteUrl}/return-policy`, lastmod: new Date().toISOString() },
    { url: `${siteUrl}/terms-conditions`, lastmod: new Date().toISOString() },
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastmod: (product.updatedAt || product.createdAt).toISOString()
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    routes.map((route) => urlEntry(route.url, route.lastmod)).join("\n") +
    `\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600"
    }
  });
}
