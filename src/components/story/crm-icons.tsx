import type { SVGProps } from "react";

/**
 * A tiny inline icon set for the product surfaces — the showcase has no icon
 * dependency, so these keep the glyph detail (1.5px stroke, currentColor)
 * without pulling one in. All 16×16, sized via className.
 */
function Svg({ children, className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className ?? "size-4"}
      {...props}
    >
      {children}
    </svg>
  );
}

export const Sparkle = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M8 1.5 9.3 5.4 13.2 6.7 9.3 8 8 11.9 6.7 8 2.8 6.7 6.7 5.4 8 1.5Z" />
    <path d="M12.5 11.5 13 13 14.5 13.5 13 14 12.5 15.5 12 14 10.5 13.5 12 13Z" />
  </Svg>
);

export const Mail = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
    <path d="m2.5 4.5 5.5 4 5.5-4" />
  </Svg>
);

export const Check = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m3 8.5 3 3 7-7.5" />
  </Svg>
);

export const X = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Svg>
);

export const Pencil = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M11 2.5 13.5 5 5.5 13H3v-2.5L11 2.5Z" />
    <path d="M9.5 4 12 6.5" />
  </Svg>
);

export const Search = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="7" cy="7" r="4.25" />
    <path d="m10.5 10.5 3 3" />
  </Svg>
);

export const Plus = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M8 3v10M3 8h10" />
  </Svg>
);

export const Sliders = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M3 5h6M11 5h2M3 11h2M7 11h6" />
    <circle cx="10" cy="5" r="1.4" />
    <circle cx="6" cy="11" r="1.4" />
  </Svg>
);

export const MoreH = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="3.5" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="8" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const ChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m4 6 4 4 4-4" />
  </Svg>
);

export const Bell = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M4 6.5a4 4 0 0 1 8 0c0 3 1 4 1.5 4.5h-11C3 10.5 4 9.5 4 6.5Z" />
    <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
  </Svg>
);

export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M5 11 11 5M6 5h5v5" />
  </Svg>
);

export const Rows = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M3 4.5h10M3 8h10M3 11.5h10" />
    <circle cx="2" cy="4.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="2" cy="8" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="2" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
  </Svg>
);

export const Columns = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <rect x="2.5" y="3" width="3" height="10" rx="0.75" />
    <rect x="6.75" y="3" width="3" height="10" rx="0.75" />
    <rect x="11" y="3" width="2.5" height="10" rx="0.75" />
  </Svg>
);

export const Building = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <rect x="3" y="2.5" width="7" height="11" rx="0.75" />
    <path d="M10 6h3v7.5H3M5 5h1M5 7.5h1M5 10h1M7.5 5h.5M7.5 7.5h.5" />
  </Svg>
);
