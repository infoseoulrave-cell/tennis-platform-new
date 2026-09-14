"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ProductInteraction } from "@/events/product-interactions";
import { trackProductInteraction } from "@/lib/product-interaction-tracking";

export function ProductInteractionLink({
  href,
  className,
  children,
  interaction,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  interaction: ProductInteraction | null;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (!event.defaultPrevented && event.button === 0) {
          trackProductInteraction(interaction);
        }
      }}
      onAuxClick={(event) => {
        if (!event.defaultPrevented && event.button === 1) {
          trackProductInteraction(interaction);
        }
      }}
    >
      {children}
    </Link>
  );
}
