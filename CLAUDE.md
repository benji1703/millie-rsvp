# mili-rsvp — CLAUDE.md

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS v3
- Supabase (postgres + service role client in `lib/supabase.ts`)
- NextAuth (Google provider) for admin auth
- Deployed on Vercel at `https://rsvp.arbibe.dev`

## Design system
Colors: `cream` `parchment` `gold` `charcoal` `sage` — defined in `tailwind.config.ts`.
Font: NotoSerifHebrew (`font-serif`). Sans: system (`font-sans`).
All UI is RTL Hebrew. Use `dir="rtl"` on root elements when needed.
Shadow: `shadow-paper`. Rounded: `rounded-2xl` for cards, `rounded-xl` for inputs/buttons.

## Key files
```
app/
  admin/              — admin dashboard (NextAuth-protected)
  rsvp/[code]/        — guest RSVP page (server component + RsvpFlow client)
  api/
    rsvp/route.ts     — guest RSVP submit/update + audit log
    rsvp/view/        — POST: log view event from client
    admin/guests/[id] — PATCH (name/phone/count/rsvp_status) + DELETE
    admin/audit/      — GET audit log for a guest

components/
  rsvp/               — LandingStep, RsvpFormStep, ThankYouStep, RsvpFlow
  admin/              — GuestTable, AdminClient, AddGuestForm

lib/
  supabase.ts         — supabaseAdmin (service role)
  auth.ts             — NextAuth config
  rateLimit.ts        — in-memory rate limiter

public/
  og-image.png        — static OG image for WhatsApp previews (1200×630)
```

## Database (Supabase)
Tables: `guests`, `rsvp_audit_log`

`guests` key columns: `id`, `name`, `phone`, `rsvp_status` (pending/confirmed/declined), `guest_count`, `children_allowed`, `children_count`, `short_code` (12-char hex), `last_activity_at`, `responded_at`

`rsvp_audit_log` columns: `id`, `guest_id`, `action`, `ip_address`, `user_agent`, `previous_status`, `new_status`, `previous_count`, `new_count`, `metadata` (jsonb), `created_at`

Audit actions: `view` | `rsvp_submit` | `rsvp_update` | `admin_status_update` | `admin_edit`

## Rules — DO NOT touch without asking
- `components/rsvp/LandingStep.tsx` — text content is final, do not edit copy
- `public/og-image.png` — static PNG, do not regenerate unless asked
- Ceremony: **בריתה** (not הולדת). Date: **3.7.2026**. Venue: **West Garden, ויצמן 273, רעננה**

## Patterns
- Audit log: always `await` inserts — never fire-and-forget (`void`) on Vercel serverless (function exits before promise completes)
- View event: fired client-side from `RsvpFlow` useEffect → `POST /api/rsvp/view` (captures real IP from headers)
- Admin auth: every API route checks `getServerSession(authOptions)` first
- OG image: static `/og-image.png`, referenced in `generateMetadata()` in `page.tsx` — do NOT use dynamic `opengraph-image.tsx` (font loading unreliable on Vercel Node.js runtime)
- PATCH guests: validates `rsvp_status` against `['pending','confirmed','declined']`; logs `admin_status_update` on status change, `admin_edit` on field changes (stores `metadata.fields` array)
- Rate limiting: `rateLimit(ip, 10, 60_000)` on public RSVP endpoint
- Admin GuestTable edit: `editData` state holds `name`, `phone`, `guestCount`, `childrenAllowed`, `childrenCount`, `rsvpStatus` — status dropdown renders in both desktop cell and mobile form
- Audit UI: desktop = inline expanded row (`expandedAudit` state); mobile = bottom-sheet modal (`auditModal` state); both share `fetchAudit(guestId)` + `auditData` cache
- Timestamps: always `Intl.DateTimeFormat` with `timeZone: 'Asia/Jerusalem'`

## Env vars (Vercel + local .env.local)
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
