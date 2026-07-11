/* eslint-disable react-refresh/only-export-components -- glyph registry: the COMPANY_GLYPHS map of mark components is the module's purpose. */
import type { ReactElement, SVGProps } from "react";

/**
 * Distinct geometric brand marks for the (fictional) enterprise accounts —
 * a designed glyph reads as a real product logo where letter initials read as
 * "demo". Each is a single-color mark that inherits the account tint via
 * `currentColor`; depth comes from opacity, not extra hues.
 */
function G({ children, ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...p}>
      {children}
    </svg>
  );
}

export const COMPANY_GLYPHS: Record<string, (p: SVGProps<SVGSVGElement>) => ReactElement> = {
  // Northwind Logistics — compass star
  northwind: (p) => (
    <G {...p}>
      <path d="M12 2 13.9 9.6 21.5 12 13.9 14.4 12 22 10.1 14.4 2.5 12 10.1 9.6Z" fill="currentColor" />
    </G>
  ),
  // Vertex Financial — ascending peak
  vertex: (p) => (
    <G {...p}>
      <path d="M12 3.5 21 20h-6.2L12 14.3 9.2 20H3L12 3.5Z" fill="currentColor" />
    </G>
  ),
  // Meridian Health — rounded cross
  meridian: (p) => (
    <G {...p}>
      <path d="M9.6 3h4.8v6.6H21v4.8h-6.6V21H9.6v-6.6H3V9.6h6.6V3Z" fill="currentColor" />
    </G>
  ),
  // Atlas Manufacturing — hexagon with an inner ring
  atlas: (p) => (
    <G {...p}>
      <path d="M12 2.4 20.6 7v10L12 21.6 3.4 17V7L12 2.4Z" fill="currentColor" />
      <path d="M12 7.6 16.1 10v4l-4.1 2.4L7.9 14v-4L12 7.6Z" fill="currentColor" opacity="0.35" />
    </G>
  ),
  // Contoso Freight — isometric cube
  contoso: (p) => (
    <G {...p}>
      <path d="M12 2.5 20.5 7 12 11.5 3.5 7 12 2.5Z" fill="currentColor" />
      <path d="M3.5 7 12 11.5V21L3.5 16.5V7Z" fill="currentColor" opacity="0.55" />
      <path d="M20.5 7 12 11.5V21l8.5-4.5V7Z" fill="currentColor" opacity="0.8" />
    </G>
  ),
  // Halcyon Retail — calm waves
  halcyon: (p) => (
    <G {...p}>
      <path d="M3.5 14.5c2.3 0 2.3-3 4.6-3s2.3 3 4.6 3 2.3-3 4.6-3" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M3.5 8.5c2.3 0 2.3-3 4.6-3s2.3 3 4.6 3" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="17.7" cy="8.5" r="1.4" fill="currentColor" />
    </G>
  ),
};
