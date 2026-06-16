import { getSeoSettings, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const seo = await getSeoSettings();
  const siteUrl = getSiteUrl(seo);
  const content = seo.robotsTxt?.trim();
  const defaultRobots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join("\n");

  let body = content || defaultRobots;
  if (!/Sitemap:/i.test(body)) {
    body = `${body.trim()}\nSitemap: ${siteUrl}/sitemap.xml`;
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600"
    }
  });
}
