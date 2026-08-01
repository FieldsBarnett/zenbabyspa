---
name: Zen Baby Studio
description: Nursery apothecary shelf — greige plaster, linen ritual, amber arch light
colors:
  plaster-ground: "#E8E6E1"
  ink-charcoal: "#2C2A28"
  amber-primary: "#B8956A"
  linen-on-amber: "#F7F6F4"
  linen-surface: "#F7F6F4"
  wood-secondary: "#A89078"
  mist-muted: "#D9D5CE"
  mist-muted-text: "#5C5752"
  shelf-border: "#C9C3B8"
  alert-destructive: "#B33A3A"
typography:
  display:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "clamp(2.75rem, 7vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.16em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  arch: "50% / 28%"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "72px"
  section-hero: "0px"
components:
  button-primary:
    backgroundColor: "{colors.amber-primary}"
    textColor: "{colors.linen-on-amber}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.wood-secondary}"
    textColor: "{colors.linen-on-amber}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  button-outline-hover:
    backgroundColor: "{colors.mist-muted}"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  input-default:
    backgroundColor: "{colors.linen-surface}"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
---

# Design System: Zen Baby Studio

## Overview

**Creative North Star: "Nursery Apothecary Shelf"**

The digital presence is a prepared infant-care shelf: pale greige plaster, matte linen, soft wood edges, and a single warm amber register borrowed from a backlit studio arch. The page should feel like walking up to a station that has already been laid out for you — ritual precision without clinical chill, quiet luxury without cream-spa cliché.

Typography pairs Gloock (engraved display with a soft modern cut) with Schibsted Grotesk (clear booking UI). Layout favors arched apertures for imagery, shelf-row rhythm for modalities, and generous plaster fields over card grids. Amber is reserved for primary actions so it stays precious.

**Key Characteristics:**
- Cool greige plaster ground (not warm cream)
- Amber as the only saturated action color (≤10% of any screen)
- Arch-framed imagery as the signature container
- Shelf / station rhythm instead of marketing card stacks
- Light mode only for marketing — the studio is daylight plaster

## Colors

### Primary
- **Arch Amber** (`#B8956A`): Book CTAs, active nav, focus rings. The warm register from a backlit arch — used sparingly.

### Neutrals
- **Plaster** (`#E8E6E1`): Default page ground.
- **Linen** (`#F7F6F4`): Elevated surfaces, header, inputs.
- **Ink** (`#2C2A28`): Primary text.
- **Mist text** (`#5C5752`): Supporting copy.
- **Shelf border** (`#C9C3B8`): Hairline edges, dividers.
- **Wood** (`#A89078`): Secondary hover / warm support, never large fills.

### Named Rules
**The Amber Sparingly Rule.** Amber appears on primary actions and small active states only. Greige and linen own the field.

**The No Sage / No Cream Rule.** Do not revive the previous misted-sage primary or warm limewash cream ground. This world is cooler plaster with one warm light.

## Typography

**Display Font:** Gloock  
**Body Font:** Schibsted Grotesk  
**Label Font:** Schibsted Grotesk (uppercase, tracked)

### Hierarchy
- **Display:** Hero brand and one headline per major viewport.
- **Headline:** Section titles.
- **Title:** Subheads, wordmark in chrome.
- **Body:** Default UI and prose (65–75ch).
- **Label:** Shelf labels, eyebrows (one per section max), button text.

### Named Rules
**The Serif Threshold Rule.** Gloock for brand moments and headings only — never form labels, errors, or admin tables.

## Layout

Marketing pages: full-bleed hero first; then container (`max-width` via Tailwind container) with airy section rhythm (`py-16`–`py-20`). Booking and admin stay denser and left-aligned.

**Hero budget:** Brand, one headline, one supporting sentence, one CTA group, one dominant arched image plane. No stats, schedules, or promo chips in the first viewport.

## Elevation & Depth

Tonal layering of plaster → linen → mist. Minimal shadows; prefer edge light and border whisper. Hero imagery may carry a soft warm glow along an arch edge (CSS mask / gradient), never neon.

## Shapes

- Soft UI radii: 6 / 10 / 14px.
- **Arch aperture:** Image frames use a tall arch clip (`border-radius` or SVG mask) as the signature shape.
- Avoid pill CTAs; badges may be full-round.

## Components

- **Primary button:** Amber fill, linen text, tracked label case.
- **Outline button:** Transparent on plaster, shelf-border stroke, ink text; mist fill on hover.
- **Cards:** Prefer open shelf rows. Cards only when interaction truly needs a container (booking picks, admin).
- **Header:** Linen / plaster frosted bar; wordmark in Literata.
- **FAQ:** Divided shelf notes — no bordered card stacks.

## Do's and Don'ts

### Do:
- **Do** keep marketing light, greige, and arch-led.
- **Do** reserve amber for Book and active states.
- **Do** author infant-station imagery; never use the private BubbleBliss photo on the live site.
- **Do** stage modalities as shelf labels / ritual steps, not three equal icon cards.

### Don't:
- **Don't** use Cormorant Garamond, Literata, Figtree, DM Sans, sage green, or warm cream as brand materials.
- **Don't** invent testimonials, prices, or a street address.
- **Don't** put cards, badges, or promo stickers on the hero image.
- **Don't** use urgency theater or clinical hospital blue.
