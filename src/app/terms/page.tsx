import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms placeholder. Approved copy required before launch.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms">
      <p>
        The approved terms need to identify the legal entity operating the site, the position on third-party ticketing
        and streaming destinations, and the ownership of imagery and recordings shown here.
      </p>
    </PolicyPage>
  );
}
