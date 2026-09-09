"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Campaign } from "@/lib/content/types";

/**
 * Optional hero motion, layered over the still.
 *
 * Every rule here is from design.md §7B, and each is a decision not to let the
 * enhancement damage the page:
 *
 *  - The still underneath is server-rendered and never removed, so media that
 *    is blocked, throttled, consent-refused or simply broken leaves a composed
 *    hero rather than a black rectangle.
 *  - Nothing is requested until AFTER the load event. The hero never competes
 *    with the content a visitor came for.
 *  - Skipped entirely under reduced motion, under Save-Data, and on phones.
 *  - Muted, always. The hosted loop has no audio track at all.
 *  - A real, labelled pause control — not a hidden gesture.
 *  - Playback stops when the hero scrolls out of view, and does not resume if
 *    the visitor paused it deliberately.
 *
 * The YouTube path additionally tears the iframe out of the DOM when paused,
 * which is the only reliable way to stop a third-party player without pulling
 * in their API script.
 */
export function HeroVideoLayer({ campaign }: { campaign: Campaign }) {
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const video = campaign.video;

  useEffect(() => {
    if (!video) return undefined;

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
  }, [video]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!allowed || !frame) return undefined;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [allowed]);

  // The hosted <video> is paused in place; the embed is unmounted below.
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    if (!onScreen || pausedByUser) element.pause();
    else void element.play().catch(() => undefined);
  }, [onScreen, pausedByUser]);

  const toggle = useCallback(() => setPausedByUser((paused) => !paused), []);

  if (!video) return null;

  const playing = allowed && !pausedByUser && onScreen;

  return (
    <div ref={frameRef} className="absolute inset-0">
      {video.kind === "file" && allowed ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-700 lg:block ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          // No poster attribute on purpose: the art-directed still is already
          // painted underneath, and the video only fades in once it can play.
          // Setting one here just downloads the same frame a second time.
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
          {video.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      ) : null}

      {video.kind === "youtube" && playing ? (
        // 16:9 scaled to cover the hero. Pointer events are off: this is
        // scenery, and every real control on the page belongs to us.
        <div
          className="pointer-events-none absolute inset-0 hidden overflow-hidden [container-type:size] lg:block"
          aria-hidden="true"
        >
          <iframe
            title=""
            aria-hidden="true"
            tabIndex={-1}
            onLoad={() => setReady(true)}
            // Cover, in container units rather than viewport units: the hero is
            // 82svh, so vw/vh maths pillarboxes the player. The extra scale
            // pushes YouTube's own furniture — captions along the bottom, the
            // logo in the corner — outside the visible crop.
            className={`absolute left-1/2 top-1/2 h-[56.25cqw] max-h-none w-[100cqw] min-w-[177.78cqh] -translate-x-1/2 -translate-y-1/2 scale-[1.28] transition-opacity duration-700 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            src={youtubeBackgroundUrl(video.ids)}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            frameBorder="0"
          />
        </div>
      ) : null}

      {allowed ? (
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

/**
 * Background-embed parameters.
 *
 * `youtube-nocookie.com` defers YouTube's tracking cookies until playback, and
 * `loop` needs an explicit `playlist` — with several ids that same parameter is
 * what turns the hero into a montage, played by YouTube rather than cut by us.
 */
function youtubeBackgroundUrl(ids: string[]): string {
  const [first, ...rest] = ids;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: (rest.length > 0 ? rest : [first]).join(","),
    playsinline: "1",
    rel: "0",
    disablekb: "1",
    modestbranding: "1",
    iv_load_policy: "3",
    cc_load_policy: "0",
    fs: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${first}?${params.toString()}`;
}
