import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ProductTeaser } from "@/lib/content/types";

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

/**
 * Store feature (design.md §7G) — conditional on a confirmed official store.
 *
 * Prices and stock come from the store's own live product feed, which is the
 * only basis on which the brief allows showing them. There is no checkout
 * here: every action leaves for the store, which owns the transaction. No
 * countdown, scarcity claim or invented demand.
 */
function formatPrice(product: ProductTeaser): string | null {
  if (!product.price || !product.currency) return null;
  const symbol = CURRENCY_SYMBOLS[product.currency] ?? "";
  const amount = product.price.replace(/\.00$/, "");
  return symbol ? `${symbol}${amount}` : `${amount} ${product.currency}`;
}

export function MerchFeature({ products, storeUrl }: { products: ProductTeaser[]; storeUrl: string | null }) {
  if (!storeUrl || products.length === 0) return null;

  return (
    <section aria-labelledby="store-heading" className="on-paper bg-paper text-ink">
      <Container className="py-16 md:py-24 lg:py-32">
        <div className="scroll-in flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index="04" label="Store" tone="light" />
            <h2 id="store-heading" className="type-display mt-4 text-5xl leading-[0.92] md:text-6xl lg:text-7xl">
              Wear it out.
            </h2>
          </div>
          <ButtonLink href={storeUrl} variant="quiet-light">
            Visit official store
          </ButtonLink>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const price = formatPrice(product);
            const soldOut = product.availability === "out-of-stock";
            return (
              <li key={product.id}>
                <article>
                  <a
                    href={product.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                    aria-label={`${product.title} on the official store`}
                  >
                    <div className="bg-paper-raised">
                      <ResponsiveMedia
                        image={product.image}
                        placeholder={product.placeholder}
                        seed={product.id}
                        aspect="aspect-square"
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="bg-paper-raised transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <h3 className="type-display mt-4 text-xl leading-[1.05] group-hover:text-signal-ink md:text-2xl">
                      {product.title}
                    </h3>
                  </a>
                  <p className="type-meta tabular mt-2 text-muted-light">
                    {price ?? "Price on the store"}
                    {soldOut ? <span> · Sold out</span> : null}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-sm text-muted-light">
          Prices and availability were read from the official store on 9 September 2026 and may have changed since.
          Purchases are completed on the store, not here.
        </p>
      </Container>
    </section>
  );
}
