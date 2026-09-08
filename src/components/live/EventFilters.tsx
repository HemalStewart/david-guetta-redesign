"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Region } from "@/lib/content/types";

/**
 * Live filters (design.md §9).
 *
 * Selections live in the URL, so refresh, back and sharing all work. The text
 * input keeps its own state and writes to the URL on a short debounce, which
 * keeps typing smooth and keeps keyboard focus where it was.
 */
export function EventFilters({
  regions,
  resultCount,
  totalCount,
}: {
  regions: Region[];
  resultCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchId = useId();
  const regionId = useId();

  const urlQuery = searchParams.get("q") ?? "";
  const urlRegion = searchParams.get("region") ?? "";
  const view = searchParams.get("view") ?? "upcoming";

  const [query, setQuery] = useState(urlQuery);
  const isTyping = useRef(false);

  // Adopt external URL changes (back button, Clear) without fighting the user.
  useEffect(() => {
    if (!isTyping.current) setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (query === urlQuery) return undefined;
    const timer = window.setTimeout(() => {
      isTyping.current = false;
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, urlQuery, pathname, router, searchParams]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filtered = Boolean(urlQuery || urlRegion);

  return (
    <div className="border-y border-rule-dark py-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-8">
        <div className="md:w-80">
          <label htmlFor={searchId} className="type-meta block text-muted-dark">
            Search city, country or venue
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => {
              isTyping.current = true;
              setQuery(event.target.value);
            }}
            placeholder="e.g. Paris"
            className="mt-2 h-12 w-full rounded-[2px] border border-control-dark bg-transparent px-4 text-base text-paper outline-none placeholder:text-muted-dark focus-visible:border-paper"
          />
        </div>

        <div className="md:w-56">
          <label htmlFor={regionId} className="type-meta block text-muted-dark">
            Region
          </label>
          <select
            id={regionId}
            value={urlRegion}
            onChange={(event) => setParam("region", event.target.value)}
            className="mt-2 h-12 w-full rounded-[2px] border border-control-dark bg-ink px-4 text-base text-paper outline-none focus-visible:border-paper"
          >
            <option value="">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:ml-auto md:pb-1">
          <p aria-live="polite" className="type-meta text-muted-dark">
            <span className="tabular">{resultCount}</span> of <span className="tabular">{totalCount}</span>{" "}
            {view === "past" ? "past" : "upcoming"} shows
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={() => {
                isTyping.current = false;
                setQuery("");
                const params = new URLSearchParams(searchParams.toString());
                params.delete("q");
                params.delete("region");
                router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
              }}
              className="type-meta inline-flex min-h-11 items-center rounded-[2px] border border-control-dark px-4 text-paper hover:border-paper"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
