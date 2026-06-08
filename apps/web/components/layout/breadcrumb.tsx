"use client";

import Link from "next/link";
import { Asterisk } from "lucide-react";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /** Ordered list of segments. The last segment is rendered as plain text (current page). */
  segments?: BreadcrumbSegment[];
}

const defaultSegments: BreadcrumbSegment[] = [
  { label: "My workspace", href: "/dashboard" },
];

/**
 * Shared breadcrumb bar rendered at the top of every protected page.
 * Each segment is a clickable link except the last one (the current page).
 */
export function Breadcrumb({ segments = defaultSegments }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 px-8 py-3 text-xs md:text-sm select-none border-b border-gray-100/40 bg-white/50 backdrop-blur-xs"
    >
      <Asterisk className="h-3.5 w-3.5 text-gray-500" strokeWidth={2.5} />

      {segments.map((segment, idx) => {
        const isLast = idx === segments.length - 1;

        return (
          <span key={idx} className="flex items-center gap-1.5">
            <span className="text-gray-300 font-light">/</span>

            {isLast || !segment.href ? (
              <span className="text-gray-600 font-medium">{segment.label}</span>
            ) : (
              <Link
                href={segment.href}
                className="text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                {segment.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
