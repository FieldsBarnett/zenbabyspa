# Zen Baby Studio

A scheduling and landing website for a baby spa business, built with React, TypeScript, Tailwind CSS, Convex, Better Auth (magic link), and Resend.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend:** Convex with `@convex-dev/better-auth` and `@convex-dev/resend`
- **Auth:** Magic link only (no passwords)
- **Hosting:** Cloudflare Pages (static `dist/`)

## Local development

```bash
npm install
npx convex dev
```

In a separate terminal (or use the combined script):

```bash
npm run dev
```

The template runs Convex + Vite together via `convex dev --start 'vite --open'`.

### Environment variables

**`.env.local`** (frontend):

```bash
VITE_CONVEX_URL=https://<deployment>.convex.cloud
VITE_CONVEX_SITE_URL=https://<deployment>.convex.site
VITE_SITE_URL=http://localhost:5173
```

**Convex deployment** (`npx convex env set`):

```bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:5173
npx convex env set RESEND_API_KEY re_xxxx
npx convex env set RESEND_WEBHOOK_SECRET whsec_xxxx   # optional
npx convex env set EMAIL_FROM "Zen Baby Studio <noreply@yourdomain.com>"
npx convex env set RESEND_TEST_MODE true              # set false in production
```

### Seed data

After signing up once with your admin email:

```bash
npx convex run seed:seed '{"adminEmail":"you@example.com"}'
```

This creates sample services, availability rules, email templates, and promotes your account to `admin`.

## Cloudflare Pages deployment

| Setting | Value |
|---------|-------|
| Build command | `npx convex deploy --cmd 'npm run build'` |
| Build output | `dist` |
| Node compatibility | `nodejs_compat_v2` |

**Cloudflare secret:** `CONVEX_DEPLOY_KEY` (Production and Preview)

Do **not** manually set `VITE_CONVEX_URL` in Cloudflare — `convex deploy` injects it during build.

Set auth and email secrets on each **Convex** deployment (prod + preview), not in Cloudflare:

- `BETTER_AUTH_SECRET`
- `SITE_URL` (your production URL)
- `RESEND_API_KEY`

## Admin panel

Routes under `/admin` (requires `userProfiles.role = "admin"`):

- Schedule — weekly hours + blocked dates
- Appointments — view/cancel bookings
- Services — CRUD spa services
- Customers — CRM for all signed-up users
- Emails — edit transactional templates

## Design

Run `/impeccable polish` on pages for visual refinement. Product context lives in [`PRODUCT.md`](PRODUCT.md).
