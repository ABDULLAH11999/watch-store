"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SocialProofToast } from "@/components/social-proof-toast";
import { RoutePrefetcher } from "@/components/route-prefetcher";

export function SiteChrome({
  children,
  latestProductTitles,
  prefetchRoutes
}: {
  children: React.ReactNode;
  latestProductTitles: string[];
  prefetchRoutes?: string[];
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {prefetchRoutes?.length ? <RoutePrefetcher routes={prefetchRoutes} /> : null}
      <SiteHeader />
      <SocialProofToast productTitles={latestProductTitles} />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
