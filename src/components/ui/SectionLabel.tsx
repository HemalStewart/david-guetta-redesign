/** Orientation cue such as `01 / MUSIC`. Decorative numbering stays out of headings. */
export function SectionLabel({ index, label, tone = "dark" }: { index: string; label: string; tone?: "dark" | "light" }) {
  const color = tone === "dark" ? "text-muted-dark" : "text-muted-light";
  // Signal is only 2.77:1 on paper, so the index uses the darkened variant there.
  const indexColor = tone === "dark" ? "text-signal" : "text-signal-ink";
  return (
    <p className={`type-meta ${color}`}>
      <span className={indexColor}>{index}</span>
      <span aria-hidden="true"> / </span>
      {label}
    </p>
  );
}
