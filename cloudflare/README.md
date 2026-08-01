# Cloudflare Pages (Git-connected)

Project: **zenbabystudio** → `FieldsBarnett/zenbabyspa` on GitHub

| Setting | Value |
|---------|-------|
| Build command | `npx convex deploy --cmd 'npm run build'` |
| Output directory | `dist` |
| Production branch | `main` |
| Compatibility | `nodejs_compat_v2` |

## Secrets (set in Cloudflare dashboard / via API)

| Variable | Source |
|----------|--------|
| `CONVEX_DEPLOY_KEY` | `npm run cloudflare:convex-key` → `cloudflare/.env.deploy` |

## Plain text env

| Variable | Value |
|----------|-------|
| `VITE_SITE_URL` | `https://zenbabystudio.com` |
| `NODE_VERSION` | `22` |

## Convex production

Deployment: `upbeat-falcon-625` → https://upbeat-falcon-625.convex.cloud

Regenerate deploy key:

```bash
npm run cloudflare:convex-key
```

Then update the secret in Cloudflare Pages (Production + Preview).

## DNS (Porkbun)

| Host | Type | Target |
|------|------|--------|
| `@` | ALIAS | `zenbabystudio.pages.dev` |
| `*` | CNAME | `zenbabystudio.pages.dev` |

Resend records on `send` and `resend._domainkey` subdomains are managed separately.

## Custom domains

- https://zenbabystudio.com
- https://www.zenbabystudio.com
- Preview: https://zenbabystudio.pages.dev
