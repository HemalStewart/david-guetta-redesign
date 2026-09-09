"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import type { SiteSettings } from "@/lib/content/types";

function isCurrent(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Wordmark. Uses the supplied light-on-dark artwork when there is one and
 * falls back to set type when there is not, so the header never breaks while
 * brand assets are outstanding.
 */
function Wordmark({ settings, onClick }: { settings: SiteSettings; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="inline-flex items-center"
      aria-label={`${settings.artistName} — home`}
    >
      {settings.wordmark.light ? (
        <Image
          src={settings.wordmark.light}
          alt={settings.artistName}
          width={2000}
          height={256}
          priority
          className="h-4 w-auto md:h-5"
        />
      ) : (
        <span className="type-display text-2xl leading-none tracking-tight md:text-[1.75rem]">
          {settings.artistName}
        </span>
      )}
    </Link>
  );
}

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Focus returns to the control that opened the menu.
    triggerRef.current?.focus();
  }, []);

  // The header keeps a scrim over the hero and turns solid afterwards.
  // Opacity only — the header never changes height on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes; focus is trapped while open; background scrolling is locked.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    const firstLink = menuRef.current?.querySelector<HTMLElement>("a[href], button");
    firstLink?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    // The menu dialog is a sibling of <header>, not a child: the header's
    // backdrop-filter creates a containing block, which would anchor a fixed
    // child to the header's own box and clip the bottom of the menu.
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
          scrolled ? "border-rule-dark bg-ink" : "border-transparent bg-ink/80 backdrop-blur-sm"
        }`}
      >
        <Container className="flex h-16 items-center justify-between md:h-20">
          <Wordmark settings={settings} />

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {settings.nav.map((item) => {
                const current = isCurrent(pathname, item.href);
                const className = `type-meta inline-flex min-h-11 items-center border-b-2 pt-0.5 transition-colors ${
                  current ? "border-signal text-paper" : "border-transparent text-muted-dark hover:text-paper"
                }`;
                return (
                  <li key={item.href}>
                    {item.external ? (
                      // A link off-site is a real anchor, not a client-side route.
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                        {item.label} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <Link href={item.href} aria-current={current ? "page" : undefined} className={className}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="type-meta -mr-2 inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-paper md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </Container>
      </header>

      {menuOpen ? (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 top-0 z-50 flex h-[100dvh] flex-col bg-ink md:hidden"
        >
          <Container className="flex h-16 items-center justify-between">
            <Wordmark settings={settings} onClick={closeMenu} />
            <button
              type="button"
              onClick={closeMenu}
              className="type-meta -mr-2 inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-paper"
            >
              Close
            </button>
          </Container>

          <Container className="flex flex-1 flex-col justify-between overflow-y-auto pb-10 pt-6">
            <nav aria-label="Site">
              <ul className="border-t border-rule-dark">
                {settings.nav.map((item) => {
                  const current = isCurrent(pathname, item.href);
                  return (
                    <li key={item.href} className="border-b border-rule-dark">
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={closeMenu}
                          className="type-display flex items-center justify-between py-5 text-5xl"
                        >
                          {item.label}
                          <span aria-hidden="true" className="text-signal">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          aria-current={current ? "page" : undefined}
                          className="type-display flex items-center justify-between py-5 text-5xl"
                        >
                          {item.label}
                          {current ? <span className="type-meta text-signal">Current</span> : null}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {settings.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-meta inline-flex min-h-11 items-center text-muted-dark hover:text-paper"
                  >
                    {social.label} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      ) : null}
    </>
  );
}
