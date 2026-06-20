# Mili Arbibe RSVP Site — Design Spec

**Date:** 2026-06-19  
**Event:** הולדת מילי ארביב | West Garden, ויצמן 273 רעננה | יום שישי 3.7.26  
**Domain:** rsvp.arbibe.dev  

---

## Overview

Single-purpose RSVP site for ~70 guests. Each guest gets a unique UUID link. SMS OTP verifies identity. Guest confirms attendance and headcount. Admin manages guest list and views responses.

---

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | Free on Vercel, React ecosystem, Hebrew RTL support |
| Hosting | Vercel (free) | Zero config, custom domain support |
| Database | Supabase PostgreSQL (free) | 500MB free, built-in auth, RLS |
| SMS / OTP | Twilio (trial ~$15) | Covers 70 OTP sends, Israel +972 support |
| Admin auth | NextAuth + Google OAuth | Whitelist single email, simple setup |

---

## Data Model

### `guests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | The invite token — used in URL |
| `name` | text NOT NULL | Guest name, entered by admin |
| `phone` | text | Optional at creation, captured at RSVP |
| `rsvp_status` | enum | `pending` \| `confirmed` \| `declined` |
| `guest_count` | integer | null until responded |
| `responded_at` | timestamptz | null until responded |
| `created_at` | timestamptz | auto |

### `otp_codes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | auto |
| `guest_id` | uuid FK → guests.id | |
| `phone` | text | Number OTP was sent to |
| `code` | text | 6-digit numeric |
| `expires_at` | timestamptz | now + 10 minutes |
| `used` | boolean | false until consumed |
| `created_at` | timestamptz | auto |

---

## Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/rsvp/[uuid]` | Public | Guest RSVP flow |
| `/admin` | Google auth (whitelist) | Dashboard |
| `/admin/guests` | Google auth | Guest management |
| `/api/otp/send` | Public (rate-limited) | Send OTP via Twilio |
| `/api/otp/verify` | Public | Verify OTP code |
| `/api/rsvp` | Public (OTP-gated) | Submit RSVP |

---

## RSVP Page Flow (`/rsvp/[uuid]`)

**State 1 — Landing**
```
אנו שמחים להזמינכם לחגוג איתנו את הולדת בתנו
מילי ארביב ✨
יום שישי | 3.7.26
West Garden | ויצמן 273, רעננה
חניון מרטין דרוקר (בוויז)
משפחת ארביב

[אשר הגעה]
```

**State 2 — Phone Entry**
- Israeli phone input (+972 prefix auto-added)
- Sends OTP via Twilio

**State 3 — OTP Verification**
- 6-digit input, `autocomplete="one-time-code"`
- 60-second resend timer
- Max 3 attempts → lockout

**State 4 — RSVP Form**
- מגיע/ה? → Yes | No
- If Yes: stepper 1–10 for guest count (includes self)
- Submit

**State 5 — Thank You**
- Confirmation in Hebrew

**Error states:**
- Invalid/unknown UUID → error page in Hebrew
- Already responded → show submitted response (read-only)
- OTP expired → prompt resend
- OTP wrong → attempt counter shown

---

## Admin Dashboard (`/admin`)

**Auth:** Google OAuth via NextAuth, whitelist: `benjamin.arbibe@silverfort.com`

**Summary bar:** `XX/70 הוזמנו · YY מגיעים · ZZ אורחים סה"כ`

**Guest table columns:**
- Name | Phone | Status | Guest Count | Responded At | Link (copy button)

**Add guest form:**
- Name (required)
- Phone (optional)
- → Generates UUID, shows copyable link immediately

**No bulk delete.** Status field only.

---

## OTP SMS Format

Triggers auto-fill on both iOS and Android:

```
קוד האימות לאתר ארביב: 123456

@rsvp.arbibe.dev #123456
```

---

## Security

- UUID v4 — unguessable (122 bits entropy)
- OTP expires 10 minutes after send
- Rate limit: max 3 OTP sends per phone per hour
- OTP: max 3 verification attempts then lockout
- Admin protected by Google OAuth + email whitelist
- Supabase RLS — guests can only read/update their own row via API

---

## Environment Variables

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ADMIN_EMAIL

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## Design

- **Language:** Hebrew, RTL layout throughout
- **Palette:** Soft cream / blush / sage — elegant, baby-celebration feel
- **Typography:** Elegant serif for headings, clean sans for body
- **Mobile-first:** All guests open on phone
- **No page reloads:** Single-page state machine for RSVP flow
