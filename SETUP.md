# Setup Guide — Millie RSVP

## How It Works

1. Admin adds guests (manually or via CSV import) — each guest gets a unique UUID link
2. Admin clicks the WhatsApp 📲 button → opens WhatsApp Web with a pre-filled Hebrew invitation including the guest's personal link
3. Guest opens their link → sees their name → confirms how many people are attending
4. Admin monitors RSVPs live in the dashboard

No OTP, no phone verification. The UUID link is the invitation and the authorization.

---

## Services You Need

- **Supabase** — free PostgreSQL database
- **Google Cloud** — OAuth for admin login
- **Vercel** — hosting

---

## 1. Supabase

1. Create a project at https://supabase.com (free tier)
2. Go to **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`
3. Copy from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (under Service role, keep this secret)

## 2. Google OAuth (Admin Login)

1. Go to https://console.cloud.google.com → create a new project
2. **APIs & Services → Credentials → Create OAuth 2.0 Client ID** (type: Web application)
3. Add **Authorized redirect URIs**:
   - `https://rsvp.arbibe.dev/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (local dev)
4. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

Only `ADMIN_EMAIL` can sign in — all other Google accounts are rejected.

## 3. NextAuth Secret

```bash
openssl rand -base64 32
```

Use the output as `NEXTAUTH_SECRET`.

---

## 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service role) |
| `NEXTAUTH_URL` | Your public URL (e.g. `https://rsvp.arbibe.dev`) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `ADMIN_EMAIL` | Your email — only this account can access `/admin` |

---

## 5. Local Development

```bash
npm install
npm run dev
```

- Guest RSVP: `http://localhost:3000/rsvp/<uuid>`
- Admin dashboard: `http://localhost:3000/admin`

---

## 6. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

In Vercel project settings → **Environment Variables**: add all vars from `.env.local.example`.

**DNS (Cloudflare):** Add a CNAME record for `rsvp` pointing to your Vercel deployment URL. Set to **DNS only** (grey cloud) so Vercel can issue its SSL certificate.

---

## 7. CSV Import Format

The admin dashboard has a CSV upload button. Expected columns (header row optional):

```
Name,Pax,Phone
משפחת כהן,4,0501234567
דני לוי,2,0521234567
```

- **Name** — guest name shown on their RSVP page
- **Pax** — default headcount pre-filled on the RSVP form
- **Phone** — Israeli mobile number (used for WhatsApp button, optional)

Phone formats accepted: `0501234567`, `+972501234567`, `972501234567`

---

## 8. Admin Workflow

1. Sign in at `/admin` with your Google account
2. **Add guests** — one by one via the form, or bulk via CSV upload
3. **Send invites** — click 📲 next to any guest to open WhatsApp Web with a pre-filled Hebrew message containing their personal link
4. **Track RSVPs** — the dashboard updates in real time showing confirmed / declined / pending counts
