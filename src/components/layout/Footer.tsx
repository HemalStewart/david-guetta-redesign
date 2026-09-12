import Image from "next/image";
import { SocialIcon } from "@/components/ui/SocialIcon";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { SiteSettings } from "@/lib/content/types";

const SECONDARY_LINKS = [
  { label: "Live", href: "/live" },
  { label: "Music", href: "/music" },
  { label: "Watch", href: "/watch" },
  { label: "Contact", href: "/contact" },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule-dark bg-ink">
      <Container className="py-14 md:py-20">
        {/* Large but secondary identity — it must not compete with the hero. */}
        {settings.wordmark.light ? (
          <Image
            src={settings.wordmark.light}
            alt=""
            width={2000}
            height={256}
            className="h-auto w-full max-w-3xl opacity-15"
          />
        ) : (
          <p className="type-display text-[15vw] leading-[0.85] text-paper/15 md:text-[9rem] lg:text-[11rem]">
            {settings.artistName}
          </p>
        )}

        <div className="mt-10 grid gap-10 border-t border-rule-dark pt-10 md:grid-cols-3">
          <nav aria-label="Footer">
            <h2 className="type-meta text-muted-dark">Explore</h2>
            <ul className="mt-4 space-y-2">
              {SECONDARY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-signal">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                {settings.radioUrl ? (
                  <a
                    href={settings.radioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center hover:text-signal"
                  >
                    Radio Show <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center text-muted-dark">Radio Show — link pending</span>
                )}
              </li>
              {settings.storeUrl ? (
                <li>
                  <a
                    href={settings.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center hover:text-signal"
                  >
                    Shop <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <div>
            <h2 className="type-meta text-muted-dark">Follow</h2>
            <ul className="mt-4 space-y-2">
              {settings.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-11 items-center gap-3 hover:text-signal"
                  >
                    <SocialIcon label={social.label} className="h-5 w-5 shrink-0" />
                    {social.label}
                    <span aria-hidden="true" className="arrow-shift opacity-60">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="type-meta text-muted-dark">Legal</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-signal">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-signal">
                  Terms
                </Link>
              </li>
            </ul>
            <p className="mt-6 text-sm text-muted-dark">
              {settings.copyright ? (
                `© ${year} ${settings.copyright}`
              ) : (
                <>
                  © {year} — copyright holder to be confirmed by the client.
                  <span className="block">Not approved for publication.</span>
                </>
              )}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
