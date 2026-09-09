"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Campaign } from "@/lib/content/types";

/**
 * The optional atmospheric loop, layered over the hero still.
 *
 * Every rule here is from design.md §7B, and each is a decision not to let the
 * enhancement damage the page:
 *
 *  - The still underneath is server-rendered and never removed, so a loop that
 *    is blocked, throttled or broken leaves a composed hero rather than a black
 *    rectangle.
 *  - The video is requested only AFTER the load event. It never competes with
 *    the content a visitor came for.
 *  - Skipped entirely under reduced motion, under Save-Data, and on phones.
 *  - No audio track exists in the file, and it is muted regardless.
 *  - A real, labelled pause control — not a hidden gesture.
 *  - Playback stops when the hero scrolls out of view, and does not resume if
 *    the visitor paused it deliberately.
 */
export function HeroVideoLayer({ campaign }: { campaign: Campaign }) {
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pausedByUser, setPausedByUser] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const video = campaign.video;
  const hasVideo = Boolean(video && video.sources.length > 0);

  useEffect(() => {
    if (!hasVideo) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 64rem)");
    // Non-standard but widely supported; absence simply means "no preference".
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

    const decide = () => setAllowed(desktop.matches && !reduced.matches && !connection?.saveData);
    const start = () => window.setTimeout(decide, 200);

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    reduced.addEventListener("change", decide);
    desktop.addEventListener("change", decide);
    return () => {
      reduced.removeEventListener("change", decide);
      desktop.removeEventListener("change", decide);
    };
  }, [hasVideo]);

  useEffect(() => {
    const frame = frameRef.current;
    const element = videoRef.current;
    if (!allowed || !frame || !element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) element.pause();
        else if (!pausedByUser) void element.play().catch(() => undefined);
      },
      { threshold: 0.15 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [allowed, pausedByUser]);

  const toggle = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      setPausedByUser(false);
      void element.play().catch(() => undefined);
    } else {
      element.pause();
      setPausedByUser(true);
    }
  }, []);

  if (!hasVideo) return null;

  return (
    <div ref={frameRef} className="absolute inset-0">
      {allowed ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-700 lg:block ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          // No poster attribute on purpose: the art-directed still is already
          // painted underneath, and the video only fades in once it can play.
          // Setting one here just downloads the same frame a second time
          // (measured at 40 KB) for something no one ever sees.
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
          onError={() => {
            setAllowed(false);
            setReady(false);
          }}
        >
          {video!.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      ) : null}

      {allowed && ready ? (
        <button
          type="button"
          onClick={toggle}
          // Bottom-left, with the media caption: these are both notes about the
          // footage, and the right side belongs to the title and the CTAs.
          className="type-meta absolute bottom-8 left-16 z-20 hidden min-h-11 items-center gap-2 rounded-[2px] border border-control-dark bg-ink/70 px-4 text-paper backdrop-blur-sm hover:border-paper lg:inline-flex"
        >
          <span aria-hidden="true">{pausedByUser ? "▶" : "❚❚"}</span>
          {pausedByUser ? "Play background" : "Pause background"}
        </button>
      ) : null}
    </div>
  );
}
