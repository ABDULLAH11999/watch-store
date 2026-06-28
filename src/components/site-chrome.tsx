"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SocialProofToast } from "@/components/social-proof-toast";

export function SiteChrome({
  children,
  latestProductTitles
}: {
  children: React.ReactNode;
  latestProductTitles: string[];
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <SocialProofToast productTitles={latestProductTitles} />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
