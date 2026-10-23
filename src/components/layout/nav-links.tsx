"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  items: NavItem[];
  isTransparent?: boolean;
}

/**
 * Renders desktop navigation links with active-state highlighting.
 * Isolated in its own client component so the parent Navbar can be
 * wrapped in <Suspense>, satisfying Next.js's prerender requirements
 * when usePathname() is used.
 */
export function NavLinks({ items, isTransparent = false }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium tracking-wide transition-colors py-2 relative",
              isTransparent
                ? isActive
                  ? "text-white font-semibold"
                  : "text-white/80 hover:text-white"
                : isActive
                ? "text-primary font-semibold"
                : "text-secondary hover:text-main"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
            {isActive && (
              <span
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
                  isTransparent ? "bg-white" : "bg-primary"
                )}
              />
            )}
          </Link>
        );
      })}
    </>
  );
}
