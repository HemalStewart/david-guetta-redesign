import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy placeholder. Approved copy required before launch.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy">
      <p>
        The approved policy needs to cover, at minimum: what the newsletter sign-up collects, which provider processes
        it, how long addresses are retained, how someone unsubscribes, and any analytics or embedded media that set
        cookies.
      </p>
    </PolicyPage>
  );
}
