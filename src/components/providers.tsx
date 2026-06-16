"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showToaster = !pathname?.startsWith("/admin");

  return (
    <SessionProvider>
      <CartProvider>
        {children}
        {showToaster ? <Toaster position="top-right" /> : null}
      </CartProvider>
    </SessionProvider>
  );
}
