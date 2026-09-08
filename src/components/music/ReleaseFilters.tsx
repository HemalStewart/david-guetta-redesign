import Link from "next/link";
import type { ReleaseType } from "@/lib/content/types";

/**
 * Release filters as plain links, so they work without JavaScript, keep state
 * in the URL, and are shareable. Filters are hidden when the catalogue is too
 * small to need them.
 */
const TYPES: { value: ReleaseType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "album", label: "Albums" },
  { value: "ep", label: "EPs" },
  { value: "single", label: "Singles" },
  { value: "remix", label: "Remixes" },
  { value: "compilation", label: "Compilations" },
];

function chip(active: boolean) {
  return `type-meta inline-flex min-h-11 items-center rounded-[2px] border px-4 ${
    active ? "border-signal text-paper" : "border-control-dark text-muted-dark hover:text-paper"
  }`;
}

function href(type: string, year: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (year) params.set("year", year);
  const query = params.toString();
  return query ? `/music?${query}` : "/music";
}

export function ReleaseFilters({
  availableTypes,
  years,
  activeType,
  activeYear,
}: {
  availableTypes: ReleaseType[];
  years: number[];
  activeType: string;
  activeYear: string;
}) {
  const types = TYPES.filter((entry) => entry.value === "" || availableTypes.includes(entry.value as ReleaseType));
  const showTypes = types.length > 2;
  const showYears = years.length > 1;
  if (!showTypes && !showYears) return null;

  return (
    <div className="border-y border-rule-dark py-6">
      {showTypes ? (
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="type-meta w-full text-muted-dark sm:w-auto sm:pr-2">Release type</h2>
          {types.map((entry) => (
            <Link
              key={entry.value || "all"}
              href={href(entry.value, activeYear)}
              aria-current={activeType === entry.value ? "true" : undefined}
              className={chip(activeType === entry.value)}
            >
              {entry.label}
            </Link>
          ))}
        </div>
      ) : null}

      {showYears ? (
        <div className={`flex flex-wrap items-center gap-3 ${showTypes ? "mt-4" : ""}`}>
          <h2 className="type-meta w-full text-muted-dark sm:w-auto sm:pr-2">Year</h2>
          <Link href={href(activeType, "")} aria-current={!activeYear ? "true" : undefined} className={chip(!activeYear)}>
            All
          </Link>
          {years.map((year) => (
            <Link
              key={year}
              href={href(activeType, String(year))}
              aria-current={activeYear === String(year) ? "true" : undefined}
              className={`${chip(activeYear === String(year))} tabular`}
            >
              {year}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
