/*
 * THESIS: A prepared infant station behind a glowing arch proves the Sandy Springs
 * sanctuary before anyone reads a claim — refusing the cream-card spa template.
 * OWN-WORLD: Cool greige plaster, linen, wood edges, amber-only CTAs; Gloock +
 * Schibsted Grotesk; arch apertures and shelf rows instead of marketing cards.
 * STORY: Parent sees the ritual laid out, trusts the calm, books the 45-minute session.
 * FIRST VIEWPORT: Full-bleed station photograph; brand at hero scale; one headline;
 * one sentence; Book + Learn more — no cards, chips, or stats on the image.
 * FORM: Nursery Apothecary Shelf · Arch Aperture staging · seed b5f9371e · index 5.
 */
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { ChevronDown } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

const SESSION_NAME = "45-Minute Spa Session";

const FALLBACK_SESSION = {
  name: SESSION_NAME,
  description:
    "One unhurried visit that weaves together every modality in our studio — expert-led, gentle, and designed for babies 0–18 months with their caregiver.",
  durationMinutes: 45,
  modalities: [
    {
      name: "Warm hydrotherapy",
      note: "Gentle water immersion guided for infant comfort",
    },
    {
      name: "Parent–baby bonding massage",
      note: "Hands-on connection you practice together",
    },
    {
      name: "Therapeutic sound therapy",
      note: "Soft frequency to settle the nervous system",
    },
  ],
};

const FAQ_ITEMS = [
  {
    question: "What ages do you serve?",
    answer:
      "Zen Baby Studio welcomes infants from birth through 18 months. Each session is tailored to your baby's developmental stage.",
  },
  {
    question: "What is included in the spa session?",
    answer:
      "Every 45-minute visit includes hydrotherapy, parent–baby bonding massage, and sound therapy — one continuous, expert-led experience rather than separate add-ons.",
  },
  {
    question: "Is hydrotherapy safe for my baby?",
    answer:
      "Every session is expert-led and fully supervised in our Sandy Springs studio. We maintain a calm, controlled environment designed specifically for infant wellness — never clinical, always gentle.",
  },
  {
    question: "What should I bring to our first visit?",
    answer:
      "Bring a fresh diaper, a comfort item your baby knows, and anything that helps them feel at ease. We provide everything needed for the session itself.",
  },
  {
    question: "Can I reschedule or cancel?",
    answer:
      "Yes — life with a little one is unpredictable. You can manage upcoming appointments from your account page. Our full cancellation policy will be shared before opening.",
  },
  {
    question: "What happens during a first visit?",
    answer:
      "We'll welcome you into the studio, talk through your baby's needs, and guide you through the full 45-minute session at an unhurried pace. There's no rush — the goal is comfort for both of you.",
  },
];

const BOOKING_STEPS = [
  {
    title: "Pick a date",
    body: "Choose a day that works between naps and errands — a few taps on your phone.",
  },
  {
    title: "Select a time",
    body: "See live availability for our 45-minute session, then enter your email to save the booking.",
  },
  {
    title: "Arrive & unwind",
    body: "We'll have a station ready. You settle in; we guide the full ritual.",
  },
];

function SessionSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4">
      <div className="mx-auto h-8 w-2/3 rounded bg-muted" />
      <div className="mx-auto h-4 w-1/4 rounded bg-muted" />
      <div className="space-y-2 pt-4">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}

function formatPrice(priceCents: number | undefined) {
  if (!priceCents || priceCents <= 0) return null;
  return `$${(priceCents / 100).toFixed(0)}`;
}

export function LandingPage() {
  const servicesQuery = useQuery(api.services.listPublic);

  const session =
    servicesQuery === undefined
      ? null
      : servicesQuery[0]
        ? {
            id: servicesQuery[0]._id,
            name: servicesQuery[0].name,
            description: servicesQuery[0].description,
            durationMinutes: servicesQuery[0].durationMinutes,
            priceCents: servicesQuery[0].priceCents,
          }
        : { ...FALLBACK_SESSION, id: undefined as Id<"services"> | undefined };

  const isLoading = servicesQuery === undefined;
  const bookHref = session?.id ? `/book?service=${session.id}` : "/book";
  const price = session ? formatPrice(session.priceCents) : null;

  return (
    <div className="bg-background">
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet="/images/hero-station-arch.png"
            />
            <img
              src="/images/hero-station-arch-mobile.png"
              alt="Prepared infant spa station beneath a softly backlit arched alcove"
              className="h-full w-full object-cover object-[center_40%] md:object-center"
              fetchPriority="high"
            />
          </picture>
          <div
            className="animate-arch-glow pointer-events-none absolute inset-x-[10%] top-[4%] h-[36%] rounded-[50%] bg-primary/10 blur-3xl"
            aria-hidden
          />
          {/* Stronger wash for type legibility — denser behind copy, easing off toward the station */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/10"
            aria-hidden
          />
        </div>

        <div className="relative flex min-h-[100svh] flex-col px-6 md:px-10">
          <div className="flex h-[66svh] flex-col items-center justify-center pt-16">
            <div className="mx-auto w-full max-w-3xl text-center">
              <h1 className="animate-hero-rise font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
                Zen Baby Studio
              </h1>
              <p className="animate-hero-rise-delay mx-auto mt-5 max-w-xl text-lg leading-relaxed text-foreground/75 md:text-xl">
                Help your baby relax with hydrotherapy, massage, and sound therapy
                in our baby spa.
              </p>
              <div className="animate-hero-rise-delay mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button
                  asChild
                  size="lg"
                  className="min-w-[10.5rem] uppercase tracking-[0.16em]"
                >
                  <Link to="/book">Book a session</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="min-w-[10.5rem] border-foreground/25 bg-background/40 uppercase tracking-[0.16em] backdrop-blur-[2px]"
                >
                  <Link to="/services">Learn more</Link>
                </Button>
              </div>
              <p className="animate-hero-rise-delay mt-6 text-xs uppercase tracking-[0.18em] text-foreground/60">
                Opening soon · Sandy Springs, Atlanta
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-b border-border/50 py-16 md:py-20"
        aria-labelledby="modalities-heading"
      >
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-primary">
              On the shelf
            </p>
            <h2
              id="modalities-heading"
              className="mt-3 font-serif text-3xl text-foreground md:text-4xl"
            >
              One visit, three modalities
            </h2>
            <p className="mt-3 text-muted-foreground">
              Not add-ons — a single continuous ritual prepared for your baby.
            </p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-4xl gap-0 border-y border-border/60 md:grid-cols-3">
            {FALLBACK_SESSION.modalities.map((modality, index) => (
              <li
                key={modality.name}
                className="animate-shelf-in border-border/60 px-6 py-8 text-center md:border-r md:px-8 md:last:border-r-0"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <p className="font-serif text-xl text-foreground">
                  {modality.name}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {modality.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="bg-card/40 py-16 md:py-20"
        aria-labelledby="session-heading"
      >
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="session-heading"
              className="font-serif text-3xl md:text-4xl"
            >
              The session
            </h2>
            <p className="mt-3 text-muted-foreground">
              One offering — every modality, one tranquil visit
            </p>
          </div>
          {isLoading ? (
            <div className="mt-12">
              <SessionSkeleton />
            </div>
          ) : (
            session && (
              <div className="mx-auto mt-12 max-w-2xl text-center">
                <p className="font-serif text-2xl text-foreground md:text-3xl">
                  {session.name}
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                  {session.durationMinutes} minutes
                </p>
                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                  {session.description}
                </p>
                {price && (
                  <p className="mt-6 text-lg font-medium text-foreground">
                    {price}
                  </p>
                )}
                <Button
                  asChild
                  size="lg"
                  className="mt-8 uppercase tracking-[0.16em]"
                >
                  <Link to={bookHref}>Book this session</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </section>

      <section className="py-16 md:py-20" aria-labelledby="steps-heading">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="steps-heading" className="font-serif text-3xl md:text-4xl">
              How booking works
            </h2>
            <p className="mt-3 text-muted-foreground">
              From your phone to our Sandy Springs studio
            </p>
          </div>
          <ol className="mx-auto mt-14 flex max-w-4xl flex-col gap-10 md:flex-row md:items-start md:gap-0">
            {BOOKING_STEPS.map((item, index) => (
              <li
                key={item.title}
                className="relative flex-1 text-center md:px-6"
              >
                {index < BOOKING_STEPS.length - 1 && (
                  <span
                    className="pointer-events-none absolute left-[calc(50%+4rem)] right-0 top-3 hidden h-px bg-border md:block"
                    aria-hidden
                  />
                )}
                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 font-serif text-xl text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="border-y border-border/50 bg-card/30 py-16 md:py-20"
        aria-labelledby="faq-heading"
      >
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <h2 id="faq-heading" className="font-serif text-3xl md:text-4xl">
                Questions parents ask
              </h2>
              <p className="mt-3 text-muted-foreground">
                Clear answers before your first visit
              </p>
            </div>
            <div className="divide-y divide-border/60">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 max-w-prose pr-8 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container max-w-2xl text-center">
          <div
            className="animate-arch-glow mx-auto mb-8 h-24 w-20 rounded-t-full border border-primary/35 bg-gradient-to-b from-primary/25 to-transparent"
            aria-hidden
          />
          <h2 className="font-serif text-3xl md:text-4xl">
            Ready for a calm first visit?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Book your 45-minute spa session at our Sandy Springs studio.
          </p>
          <Button
            asChild
            className="mt-8 uppercase tracking-[0.16em]"
            size="lg"
          >
            <Link to="/book">Book a session</Link>
          </Button>
        </div>
      </section>

      <section
        className="border-t border-border/50 bg-card/40 py-12 md:py-14"
        aria-labelledby="contact-heading"
      >
        <div className="container mx-auto max-w-2xl text-center">
          <h2 id="contact-heading" className="font-serif text-2xl">
            Visit us in Sandy Springs
          </h2>
          <dl className="mt-6 space-y-3 text-sm text-muted-foreground">
            <div>
              <dt className="sr-only">Location</dt>
              <dd>Sandy Springs, GA · Atlanta metro</dd>
            </div>
            <div>
              <dt className="sr-only">Address</dt>
              <dd>Studio address coming soon</dd>
            </div>
            <div>
              <dt className="sr-only">Hours</dt>
              <dd>Hours coming soon</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Placeholder details — final location and hours will be confirmed
            before opening.
          </p>
        </div>
      </section>
    </div>
  );
}
