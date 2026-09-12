"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Spotify's official embed.
 *
 * Like the hero video, this is a third-party frame, so it is treated the same
 * way: nothing is requested until the player is close to the viewport, and the
 * space it will occupy is reserved up front so nothing below it moves when it
 * arrives. It plays only on an explicit press — Spotify's embed never
 * autoplays — and it is the sanctioned way to put their catalogue on a page.
 *
 * `uri` is a Spotify URI path such as "playlist/<id>" or "album/<id>".
 */
export function SpotifyEmbed({ uri, title, height = 420 }: { uri: string; title: string; height?: number }) {
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} style={{ height }} className="w-full overflow-hidden rounded-[2px] bg-ink-raised">
      {inView ? (
        <iframe
          title={title}
          src={`https://open.spotify.com/embed/${uri}?theme=0`}
          width="100%"
          height={height}
          loading="lazy"
          allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          // Spotify's embed does not autoplay, so no extra guard is needed.
          className="block h-full w-full border-0"
        />
      ) : null}
    </div>
  );
}
