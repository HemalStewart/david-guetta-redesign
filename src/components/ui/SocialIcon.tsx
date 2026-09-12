/**
 * Social glyphs, drawn as simple geometry rather than copied brand assets.
 *
 * They read correctly at 20–24 px, which is all a footer link needs. If the
 * client would rather use each platform's official mark, those come from the
 * platforms' own brand pages and are drop-in replacements here.
 */
const PATHS: Record<string, React.ReactNode> = {
  Instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  YouTube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" />
    </>
  ),
  Facebook: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M13.6 22v-7.4h2.3l.4-2.8h-2.7v-1.8c0-.8.3-1.3 1.4-1.3h1.4V6.2c-.6-.1-1.4-.2-2.2-.2-2.2 0-3.6 1.3-3.6 3.6v2.2H8.3v2.8h2.3V22z" fill="currentColor" stroke="none" />
    </>
  ),
  X: <path d="M4 4l7 8.6L4.4 20h1.9l5.6-6.2 5 6.2H21l-7.3-9 6.2-7h-1.9l-5.2 5.8L8.2 4z" fill="currentColor" stroke="none" />,
};

export function SocialIcon({ label, className = "" }: { label: string; className?: string }) {
  const glyph = PATHS[label];
  if (!glyph) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
