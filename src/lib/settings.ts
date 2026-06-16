import { prisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";

export type SettingValue = string | number | boolean | Record<string, unknown> | unknown[];

export async function getSetting<T extends SettingValue = SettingValue>(key: string, fallback: T) {
  try {
    const record = await prisma.siteSettings.findUnique({ where: { key } });
    if (!record) return fallback;
    const parsed = safeJsonParse<T>(record.value, record.value as unknown as T);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getSettingsMap() {
  try {
    const rows = await prisma.siteSettings.findMany();
    return rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export async function upsertSettings(values: Record<string, string>) {
  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value }
      })
    )
  );
}
