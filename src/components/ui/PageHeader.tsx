import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Shared opening block for secondary pages. One H1 each. */
export function PageHeader({
  index,
  label,
  title,
  intro,
  children,
}: {
  index: string;
  label: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <Container className="pb-10 pt-12 md:pb-14 md:pt-20">
      <SectionLabel index={index} label={label} />
      <h1 className="type-display mt-4 text-[clamp(3.25rem,11vw,8rem)] leading-[0.88]">{title}</h1>
      {intro ? <p className="mt-6 max-w-prose text-base text-muted-dark md:text-lg">{intro}</p> : null}
      {children}
    </Container>
  );
}
