import { prisma } from "@/lib/prisma";
import { SettingsManager } from "@/components/admin/settings-manager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const initial = await (async () => {
    try {
      const settings = await prisma.siteSettings.findMany();
      return settings.reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    } catch {
      return {};
    }
  })();
  return <SettingsManager initialSettings={initial} />;
}
