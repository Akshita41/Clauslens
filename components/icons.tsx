import type { SVGProps } from "react";

/**
 * Hand-rolled icon set — thin 1.5px strokes and round caps, chosen to sit
 * with the serif display face. Avoids pulling in an icon library.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={20}
      height={20}
      {...props}
    >
      {children}
    </svg>
  );
}

/** ClauseLens mark: a document with a lens reading one line of it. */
export function Logo(props: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      width={32}
      height={32}
      {...props}
    >
      <path
        d="M8 4h9l6 6v9"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 24v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 4v6h6" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
      <path d="M12 13h5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" opacity={0.45} />
      <circle cx="16.5" cy="19.5" r="5" stroke="currentColor" strokeWidth={1.7} />
      <path d="M20.4 23.4 24 27" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
    </svg>
  );
}

export const Upload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 15V3m0 0L8 7m4-4 4 4" />
    <path d="M4 14v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4" />
  </Base>
);

export const FileText = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Base>
);

export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m16.5 16.5 3.5 3.5" />
  </Base>
);

export const Sparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 13.7 9l5.3 1.8L13.7 12.6 12 18l-1.7-5.4L5 10.8 10.3 9z" />
    <path d="M18.5 3.5v3M20 5h-3" />
  </Base>
);

export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
);

export const X = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 5 7 7-7 7" />
  </Base>
);

export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 9 7 7 7-7" />
  </Base>
);

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h15m0 0-6-6m6 6-6 6" />
  </Base>
);

export const AlertTriangle = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-12.7a2 2 0 0 0-3.4 0Z" />
    <path d="M12 10v4M12 17.5v.01" />
  </Base>
);

export const ShieldCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 5 6v6c0 4.4 2.9 7.9 7 9 4.1-1.1 7-4.6 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const Info = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.01" />
  </Base>
);

export const Quote = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 7H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1c0 2-1 3-3 3M20 7h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1c0 2-1 3-3 3" />
  </Base>
);

export const Chart = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h16M7 20v-6M12 20V6M17 20v-9" />
  </Base>
);

export const Layers = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
    <path d="m4 12.5 8 4.5 8-4.5" />
  </Base>
);

export const LogOut = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8 6 12l4 4M6 12h9" />
  </Base>
);

export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const Spinner = (p: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    width={20}
    height={20}
    {...p}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.8} opacity={0.2} />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const Send = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 11.5 20 5l-6.5 15.5-2-7-7-2Z" />
  </Base>
);

export const Scissors = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <path d="M8 7.5 20 18M20 6 8 16.5" />
  </Base>
);

export const Lock = (p: IconProps) => (
  <Base {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
    <path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3" />
  </Base>
);
