import { Container } from "@/components/ui/Container";

/**
 * Site-wide honesty strip. It stays visible for as long as uncleared content
 * or unconnected services are in use, and is removed by setting
 * siteSettings.demoMode to false once everything is approved and wired up.
 *
 * The wording must keep matching reality: imagery, releases and videos are now
 * real material taken from official sources but NOT rights-cleared, while show
 * dates remain invented fixtures. Those are different problems and the notice
 * says so rather than lumping them together.
 */
export function DemoNotice() {
  return (
    <div className="border-b border-rule-dark bg-ink-raised">
      <Container className="flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 py-1.5">
        <span className="type-meta rounded-[2px] bg-signal px-1.5 py-0.5 text-ink">Concept preview</span>
        <p className="text-xs text-muted-dark">
          Official wordmark, photography, artwork and videos —{" "}
          <strong className="font-medium text-paper">not rights-cleared</strong>. Show dates are demo. Ticket links and
          sign-up are not connected.
        </p>
      </Container>
    </div>
  );
}
