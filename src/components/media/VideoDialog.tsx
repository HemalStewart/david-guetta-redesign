"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import { track } from "@/lib/analytics";
import type { Video } from "@/lib/content/types";

/**
 * Explicit-play video (design.md §7F, §9).
 *
 * No player is created by scrolling past: the iframe is only mounted while the
 * dialog is open, so exactly one video can ever be playing and closing stops
 * it. If the video has no verified provider id, the dialog stays useful — it
 * keeps the still and offers the official channel instead of a black rectangle.
 */
type Props = {
  video: Video;
  /** Official destination used when an embed is unavailable or fails. */
  fallbackUrl: string | null;
  size?: "feature" | "card";
  placement?: string;
};

export function VideoLauncher({ video, fallbackUrl, size = "card", placement = "watch" }: Props) {
  const [open, setOpen] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const canEmbed = video.provider === "youtube" && Boolean(video.embedId) && !embedFailed;
  const outboundUrl = video.providerUrl ?? fallbackUrl;
  const isFeature = size === "feature";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="group block w-full text-left"
        // Explicit name: the still's placeholder tag would otherwise land in
        // the computed accessible name between "Play video" and the title.
        aria-label={`Play video: ${video.title}`}
        onClick={() => {
          setOpen(true);
          track("video_play", { contentId: video.id, placement });
        }}
      >
        <ResponsiveMedia
          image={video.still}
          placeholder={video.placeholder}
          seed={video.id}
          aspect="aspect-[16/9]"
          sizes={isFeature ? "(min-width: 1024px) 80vw, 100vw" : "(min-width: 1024px) 32vw, 92vw"}
          className="transition-opacity duration-200 group-hover:opacity-90"
        />
        <span className="mt-4 flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-signal text-ink transition-colors group-hover:bg-signal-hover"
          >
            ▶
          </span>
          <span className={`type-display leading-[0.98] group-hover:text-signal ${isFeature ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"}`}>
            {video.title}
          </span>
        </span>
        <span className="type-meta mt-2 block text-muted-dark">
          {video.category}
          {video.duration ? <span className="tabular"> · {video.duration}</span> : null}
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 md:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Video: ${video.title}`}
            className="w-full max-w-5xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4">
              <h2 className="type-display text-2xl leading-[0.98] md:text-3xl">{video.title}</h2>
              <button
                type="button"
                onClick={close}
                className="type-meta -mr-2 inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-paper hover:text-signal"
              >
                Close
              </button>
            </div>

            {canEmbed ? (
              <div className="aspect-[16/9] w-full bg-ink-raised">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.embedId}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  onError={() => setEmbedFailed(true)}
                />
              </div>
            ) : (
              // The still is kept, so a failed or absent embed is never a black box.
              <div className="relative">
                <ResponsiveMedia
                  image={video.still}
                  placeholder={video.placeholder}
                  seed={video.id}
                  aspect="aspect-[16/9]"
                  sizes="100vw"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/70 p-6 text-center">
                  <p className="max-w-md text-sm text-paper md:text-base">
                    {embedFailed
                      ? "The player could not load here."
                      : "No verified video link has been supplied for this item in the concept preview."}
                  </p>
                  {outboundUrl ? (
                    <a
                      href={outboundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center rounded-[2px] bg-signal px-5 py-3 text-sm uppercase tracking-wide text-ink hover:bg-signal-hover"
                    >
                      Watch on YouTube <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              </div>
            )}

            {outboundUrl && canEmbed ? (
              <a
                href={outboundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="type-meta mt-4 inline-flex min-h-11 items-center text-muted-dark hover:text-paper"
              >
                Watch on YouTube <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
