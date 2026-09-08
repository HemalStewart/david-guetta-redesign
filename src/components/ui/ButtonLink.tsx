import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "outline-dark" | "outline-light" | "quiet-dark" | "quiet-light";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[2px] text-center font-medium transition-colors duration-150";

const SIZED = "min-h-12 px-5 py-3 text-sm md:text-base tracking-wide uppercase";

const VARIANTS: Record<ButtonVariant, string> = {
  // Ink text on signal — the specified pairing. Never paper on signal.
  primary: "on-signal bg-signal text-ink hover:bg-signal-hover",
  "outline-dark": "border border-control-dark text-paper hover:border-paper hover:bg-paper/5",
  "outline-light": "on-paper border border-control-light text-ink hover:border-ink hover:bg-ink/5",
  "quiet-dark": "min-h-11 px-0 py-2 text-paper underline underline-offset-8 decoration-rule-dark hover:decoration-signal",
  "quiet-light":
    "on-paper min-h-11 px-0 py-2 text-ink underline underline-offset-8 decoration-rule-light hover:decoration-signal",
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  /** Overrides the visible text for screen readers when context is needed. */
  ariaLabel?: string;
};

type Props = CommonProps & {
  href: string;
  onClick?: () => void;
};

/**
 * The one link control. External destinations get the ↗ affordance plus
 * `rel="noopener noreferrer"`; internal routes use next/link.
 *
 * There is no `href="#"` escape hatch on purpose — a control with nowhere to
 * go must render <UnavailableAction> instead, which states why.
 */
export function ButtonLink({ href, children, variant = "primary", className = "", ariaLabel, onClick }: Props) {
  const isExternal = href.startsWith("http");
  const quiet = variant.startsWith("quiet");
  const classes = `${BASE} ${quiet ? "" : SIZED} ${VARIANTS[variant]} ${className}`;

  const content = (
    <>
      {children}
      {isExternal ? <span aria-hidden="true">↗</span> : null}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel} onClick={onClick}>
      {content}
    </Link>
  );
}

/**
 * A control that would exist if the client had supplied a destination.
 * It is rendered as inert text with the reason stated, never as a dead link.
 */
export function UnavailableAction({
  children,
  reason,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  reason: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const palette =
    tone === "dark" ? "border-control-dark text-muted-dark" : "on-paper border-control-light text-muted-light";
  return (
    <span
      className={`inline-flex min-h-12 items-center justify-center rounded-[2px] border border-dashed px-5 py-3 text-sm uppercase tracking-wide ${palette} ${className}`}
    >
      <span className="sr-only">Unavailable: </span>
      {children}
      <span className="sr-only">. {reason}</span>
    </span>
  );
}
