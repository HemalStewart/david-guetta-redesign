import type { EventStatus as Status } from "@/lib/content/types";

/**
 * Status is never carried by colour alone — every state has its own words,
 * and the shapes differ (filled / outlined / struck).
 */
const LABELS: Record<Status, string> = {
  "on-sale": "On sale",
  "on-sale-soon": "On sale soon",
  "sold-out": "Sold out",
  cancelled: "Cancelled",
  postponed: "Postponed",
  "tickets-unavailable": "Tickets unavailable",
};

const STYLES: Record<Status, string> = {
  "on-sale": "border-signal text-signal",
  "on-sale-soon": "border-control-dark text-paper",
  "sold-out": "border-transparent bg-rule-dark text-paper",
  cancelled: "border-transparent bg-signal text-ink",
  postponed: "border-signal text-paper",
  "tickets-unavailable": "border-control-dark text-muted-dark",
};

export function statusLabel(status: Status): string {
  return LABELS[status];
}

export function EventStatusTag({ status }: { status: Status }) {
  return (
    <span className={`type-meta inline-flex items-center rounded-[2px] border px-2 py-1 ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
