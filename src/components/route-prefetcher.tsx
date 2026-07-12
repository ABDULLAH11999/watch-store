"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RoutePrefetcher({ routes }: { routes: string[] }) {
  const router = useRouter();

  useEffect(() => {
    if (!routes.length) return;

    const prefetch = () => {
      routes.forEach((route) => router.prefetch(route));
    };

    if ("requestIdleCallback" in window) {
      const requestIdle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
      const cancelIdle = window.cancelIdleCallback as typeof window.cancelIdleCallback | undefined;

      if (requestIdle && cancelIdle) {
        const id = requestIdle(prefetch, { timeout: 2000 });
        return () => cancelIdle(id);
      }
    }

    const timer: ReturnType<typeof setTimeout> = setTimeout(prefetch, 800);
    return () => clearTimeout(timer);
  }, [router, routes]);

  return null;
}
