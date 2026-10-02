# Photography Studio Admin

Admin dashboard (React + Vite + TypeScript + Tailwind) for the studio website.
V1 scope: login, dashboard layout, hero image management.

## Setup

```bash
npm install
cp .env.example .env     # then edit if your API is elsewhere
npm run dev              # http://localhost:5173
npm run build            # type-checks, then outputs to dist/
```

`.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

This is the only configuration the app uses. Never put database credentials, R2 secrets or JWT secrets in this project.

## Deploy to Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable (Settings -> Environment variables): `VITE_API_BASE_URL` = your production API URL, e.g. `https://api.example.com/api/v1`. It is baked in at build time, so redeploy after changing it.
- SPA routing: `wrangler.jsonc` sets `not_found_handling: single-page-application`, so direct links such as `/dashboard/hero-images` work. Do not add a `_redirects` file with `/* /index.html 200`: Cloudflare rejects it as an infinite loop. (Classic Pages serves `index.html` for unknown paths without any config.)

## CORS

The backend `ALLOWED_ORIGINS` must include the admin origin (for example `http://localhost:5173` in development and the Cloudflare Pages URL / custom domain in production).

## Structure

- `src/api` - API client (`client.ts`, Bearer token + 401 handling), `auth.ts`, `heroImages.ts`
- `src/hooks` - TanStack Query hooks (pages never call the API directly)
- `src/contexts` - `AuthContext`, `ToastContext`
- `src/components/{layout,ui,hero}` - UI building blocks. Add sidebar entries for future modules in `components/layout/navConfig.ts`.
- `src/utils/tokenStorage.ts` - swappable token storage (localStorage by default)
# chanthans-admin
