import type { ReactNode } from "react";

/**
 * Content max-width 1440 px with the specified gutters:
 * 20 px phone (16 px at 360 px), 32 px tablet, 64 px desktop — design.md §6.
 */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[90rem] px-4 xs:px-5 md:px-8 lg:px-16 ${className}`}>{children}</div>;
}
