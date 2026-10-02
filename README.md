# Photography Studio Admin

Admin dashboard (React + Vite + TypeScript + Tailwind) for the studio website.
Scope: login, dashboard home (greeting + studio stats), bookings (list, create, edit, detail with status workflow), Google Calendar integration, hero image management.

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
VITE_CURRENCY=CAD                    # optional, default CAD
VITE_APP_TIMEZONE=America/Toronto    # optional, default America/Toronto
```

`VITE_CURRENCY` controls money formatting (Intl, en-CA). `VITE_APP_TIMEZONE` is the studio's IANA timezone, used for the dashboard greeting; booking dates/times are studio-local and shown as stored. These are the only settings the app uses. Never put database credentials, R2 secrets or JWT secrets in this project.

## Routes

- `/dashboard` - home (greeting, stats, upcoming schedule)
- `/dashboard/bookings` - list (filters and page are kept in the URL)
- `/dashboard/bookings/new`, `/dashboard/bookings/:id`, `/dashboard/bookings/:id/edit`
- `/dashboard/integrations` - Google Calendar (handles `?google=connected|error&reason=` on return from Google)
- `/dashboard/hero-images`

## Deploy to Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable (Settings -> Environment variables): `VITE_API_BASE_URL` = your production API URL, e.g. `https://api.example.com/api/v1` (optionally also `VITE_CURRENCY`, `VITE_APP_TIMEZONE`). They are baked in at build time, so redeploy after changing it.
- SPA routing: `wrangler.jsonc` sets `not_found_handling: single-page-application`, so direct links such as `/dashboard/hero-images` work. Do not add a `_redirects` file with `/* /index.html 200`: Cloudflare rejects it as an infinite loop. (Classic Pages serves `index.html` for unknown paths without any config.)

## CORS

The backend `ALLOWED_ORIGINS` must include the admin origin (for example `http://localhost:5173` in development and the Cloudflare Pages URL / custom domain in production).

## Structure

- `src/api` - API client (`client.ts`, Bearer token + 401 handling), `auth.ts`, `heroImages.ts`, `bookings.ts`, `dashboard.ts`, `integrations.ts`
- `src/hooks` - TanStack Query hooks (pages never call the API directly)
- `src/contexts` - `AuthContext`, `ToastContext`
- `src/components/{layout,ui,hero,bookings,dashboard}` - UI building blocks. Add sidebar entries for future modules in `components/layout/navConfig.ts`.
- `src/utils/format.ts` - date/time/money/greeting helpers; `bookingStatus.ts` - status labels, icons, timeline
- `src/utils/tokenStorage.ts` - swappable token storage (localStorage by default)
# chanthans-admin
