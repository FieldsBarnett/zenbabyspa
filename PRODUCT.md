# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Parents of infants (0–18 months) in the Sandy Springs / Atlanta metro area who want expert-led wellness and bonding experiences for their baby at a local studio.

**Secondary:** Expecting parents researching services before birth; gift-givers booking sessions for friends or family.

**Situation:** Often booking between naps and errands, on mobile, with low tolerance for friction. They need reassurance that the studio is safe, calm, and professional before committing.

## Product Purpose

Zen Baby Studio is a boutique infant wellness spa launching in Sandy Springs, Atlanta GA. The website lets parents discover services, book in-person sessions, and manage appointments — while giving the studio owner a simple admin panel to run scheduling, customers, and transactional email.

**Success looks like:** Parents can book a first visit in under two minutes on mobile; the site communicates trust and calm before they arrive; staff can manage the week without leaving the admin panel.

## Positioning

A serene local sanctuary offering one expert-led 45-minute infant spa session — hydrotherapy, parent–baby bonding massage, and sound therapy combined — in-studio in Sandy Springs, designed to feel like a deep breath rather than a clinical appointment.

The product differentiator is not generic spa software: it is a purpose-built booking and presence layer for this studio's single signature session and Sandy Springs location.

## Operating Context

- **Physical studio:** In-person sessions at a local Sandy Springs location (Atlanta metro). Booking assumes clients travel to the studio.
- **Pre-launch:** Client has not launched yet. Product and marketing content may use clearly labeled placeholders until real assets arrive.
- **Staff workflow:** Owner/staff configure weekly hours, block dates, manage services and pricing, view/cancel appointments, maintain a lightweight CRM, and edit transactional email templates.
- **Parent workflow:** Discover on landing → learn about the session → sign in via magic link → book (date → time → confirm) → manage upcoming/past visits on account page.

## Capabilities and Constraints

**Confirmed functionality**

- Public marketing pages: landing, services catalog, booking flow, account management
- Magic-link authentication only (no passwords)
- Appointment booking against live availability
- Role-gated admin panel (`/admin`): schedule, appointments, services CRUD, customer CRM, email templates
- Transactional email via Resend (confirmation, reminders, etc.)

**Technical stack (factual)**

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Convex with Better Auth and Resend component
- Hosting: Cloudflare Pages (static build)

**Offering at launch (confirmed with client)**

One **45-minute spa session** that includes all modalities:
- Hydrotherapy
- Parent–baby bonding massage
- Sound therapy

**Product constraints**

- Mobile-first booking flow
- Accessible contrast and touch targets
- Admin access limited to owner/staff roles
- Do not present placeholder testimonials, pricing, or proof as real client content without labeling

**Open / undecided**

- Final studio address and hours
- Exact session pricing
- Official brand voice and copy from client
- Real photography, logo, and identity assets
- Launch date

## Brand Commitments

- **Name:** Zen Baby Studio (confirmed)
- **Market:** Sandy Springs, Atlanta GA — local, in-person studio
- **Personality direction (pending client sign-off):** Calm, soft, premium — never clinical or overly playful. Final voice and copy to come from the client.

## Evidence on Hand

| Asset | Status |
|-------|--------|
| Real studio photography | On hand for private art direction only — do not publish (third-party branding in frame); landing uses authored hero still-life instead |
| Logo / brand kit | Not yet |
| Client-written copy / story | Not yet |
| Real testimonials or reviews | Not yet — **sample/placeholder testimonials may be used for design and layout only; must not be presented as verified customer proof at launch** |
| Service offering | Confirmed: single 45-minute spa session including hydrotherapy, parent–baby bonding massage, and sound therapy |

**Note:** Seed data creates one service record for the combined session. Legacy multi-service records in an existing database should be deactivated in admin before launch.

## Product Principles

1. **Trust before conversion** — Parents are entrusting their infant; every screen should reduce anxiety, not create urgency theater.
2. **Mobile booking is the core job** — Optimize the book flow for thumbs, interruptions, and one-handed use.
3. **No fake proof** — Placeholders are fine for pre-launch design; launch requires real assets or clearly fictional staging.
4. **Staff time is scarce** — Admin tools should cover the weekly loop (schedule → appointments → customers → email) without feature sprawl.
5. **Local studio, local context** — Sandy Springs / Atlanta framing matters; generic "anywhere" copy undermines the in-person value.

## Accessibility & Inclusion

- Mobile-first with accessible contrast and touch targets (confirmed product requirement)
- No additional compliance standard (e.g. WCAG level) confirmed yet
