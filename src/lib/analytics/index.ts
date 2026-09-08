/**
 * Analytics adapter — design.md §15.
 *
 * No provider is connected. Events are logged in development so the call sites
 * can be reviewed, and are dropped otherwise. Never attach an email address or
 * any other form value to an event payload.
 */
export type AnalyticsEvent =
  | "ticket_click"
  | "listen_click"
  | "video_play"
  | "newsletter_submit"
  | "newsletter_success"
  | "shop_click";

export type AnalyticsPayload = {
  /** Stable content id, e.g. an event or release id. */
  contentId?: string;
  /** Where on the page the control lives, e.g. "home-live-preview". */
  placement?: string;
  page?: string;
};

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics:not-connected] ${event}`, payload);
  }
}
