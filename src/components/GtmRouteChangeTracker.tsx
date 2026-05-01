"use client";

import { gtmPush } from "@/lib/gtm";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function GtmRouteChangeTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    const qs = searchParams?.toString();
    const pagePath = qs ? `${pathname}?${qs}` : pathname;

    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    gtmPush({
      event: "page_view",
      page_path: pagePath,
      page_location: typeof window !== "undefined" ? window.location.href : pagePath,
      ...(typeof document !== "undefined" && document.title
        ? { page_title: document.title }
        : {}),
    });
  }, [pathname, searchParams]);

  return null;
}

/** Sends virtual page_view on client-side navigations (initial load is covered by GTM). */
export function GtmRouteChangeTracker() {
  return (
    <Suspense fallback={null}>
      <GtmRouteChangeTrackerInner />
    </Suspense>
  );
}
