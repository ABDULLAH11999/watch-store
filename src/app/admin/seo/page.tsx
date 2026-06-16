import { SeoManager } from "@/components/admin/seo-manager";
import { getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  let initial: Record<string, string> = {};
  try {
    const settings = await getSettingsMap();
    initial = Object.fromEntries(
      Object.entries(settings).filter(([key]) =>
        ["siteTitle", "titleTemplate", "metaDescription", "canonicalUrl", "metaKeywords", "ogTitle", "ogDescription", "ogImage", "headerScripts", "footerScripts", "robotsTxt"].includes(key)
      )
    );
  } catch {
    initial = {};
  }

  return <SeoManager initialSettings={initial} />;
}
