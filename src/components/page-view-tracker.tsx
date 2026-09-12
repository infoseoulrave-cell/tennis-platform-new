"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track-event";

export function PageViewTracker() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;
    trackEvent("page_view");
  }, [pathname]);
  return null;
}
