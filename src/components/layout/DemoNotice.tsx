import { Container } from "@/components/ui/Container";

/**
 * Site-wide honesty strip. It stays visible for as long as fixtures or
 * unconnected services are in use, and is removed by setting
 * siteSettings.demoMode to false once real content and providers are wired up.
 */
export function DemoNotice() {
  return (
    <div className="border-b border-rule-dark bg-ink-raised">
      <Container className="flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 py-1.5">
        <span className="type-meta rounded-[2px] bg-signal px-1.5 py-0.5 text-ink">Concept preview</span>
        <p className="text-xs text-muted-dark">
          Demo content and original placeholder artwork. Shows, releases, videos, ticket links and sign-up are not
          connected to live services.
        </p>
      </Container>
    </div>
  );
}
