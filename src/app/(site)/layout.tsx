import { prisma } from "@/lib/prisma";
import { SiteChrome } from "@/components/site-chrome";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let latestProductTitles: string[] = [];

  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { name: true }
    });
    latestProductTitles = products.map((product) => product.name).filter(Boolean);
  } catch {
    latestProductTitles = [];
  }

  return <SiteChrome latestProductTitles={latestProductTitles}>{children}</SiteChrome>;
}
