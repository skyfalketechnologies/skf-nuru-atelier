"use client";

import { fbqPageView } from "@/lib/fbq";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function FacebookPixelRouteTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    fbqPageView();
  }, [pathname, searchParams]);

  return null;
}

/** Fires Meta `PageView` on client-side navigations (initial load is handled by the base snippet). */
export function FacebookPixelRouteTracker() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelRouteTrackerInner />
    </Suspense>
  );
}
