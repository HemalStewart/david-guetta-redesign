import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Professional contacts for management, press and booking.",
};

/**
 * Contacts are only ever the client's approved destinations. A missing contact
 * is shown as an outstanding content requirement — no address is invented.
 */
export default function ContactPage() {
  const settings = getSiteSettings();

  return (
    <>
      <PageHeader
        index="04"
        label="Contact"
        title="Contact"
        intro="Professional enquiries. Approved destinations are supplied by the artist's management."
      />

      <Container className="pb-24">
        <ul className="border-t border-rule-dark">
          {settings.contacts.map((contact) => (
            <li key={contact.role} className="border-b border-rule-dark py-8">
              <div className="grid gap-4 md:grid-cols-12 md:items-center">
                <h2 className="type-display text-3xl md:col-span-4 md:text-4xl">{contact.role}</h2>
                <div className="md:col-span-8">
                  {contact.href ? (
                    <ButtonLink href={contact.href} variant="outline-dark" ariaLabel={`Contact ${contact.role}`}>
                      {contact.role} enquiries
                    </ButtonLink>
                  ) : (
                    <p className="text-muted-dark">
                      Not yet supplied.{" "}
                      {contact.note ? <span className="text-muted-dark">{contact.note}</span> : null}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <section aria-labelledby="press-kit-heading" className="mt-14">
          <h2 id="press-kit-heading" className="type-display text-3xl md:text-4xl">
            Press kit
          </h2>
          {settings.pressKitUrl ? (
            <ButtonLink href={settings.pressKitUrl} variant="outline-dark" className="mt-6">
              Download press kit
            </ButtonLink>
          ) : (
            <p className="mt-4 max-w-prose text-muted-dark">
              No rights-cleared press kit has been supplied. It is tracked as an outstanding content requirement in
              ASSET-MANIFEST.md.
            </p>
          )}
        </section>
      </Container>
    </>
  );
}
