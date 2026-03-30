# GuruBot — Design Spec
**Date:** 2026-03-30
**Status:** Approved

---

## Overview

A public-facing web app: an unnamed AI oracle that offers spiritual guidance across astrology, crystals, energy healing, spirit guides, and related modalities. Users complete a short intake questionnaire on first login; the oracle uses their profile to personalise every response. Conversation history is stored locally in the browser — nothing spiritual ever touches the server.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 App Router | Deployed to Vercel |
| Auth | Clerk (Vercel Marketplace) | Stores email + userId only |
| AI | `@ai-sdk/anthropic` + `streamText` | `claude-sonnet-4.6`; API key in env vars |
| Client storage | IndexedDB via `idb` | Namespaced by Clerk userId |
| UI components | shadcn/ui + Tailwind CSS | Zen palette, Geist fonts |
| Theming | `next-themes` | Light/dark toggle; system preference default |
| Rate limiting | Upstash Redis (Vercel Marketplace) | Per-user, on `/api/chat` |

---

## Visual Language

**Palette:**
- Light mode: warm off-white (`#f7f5f0`), stone (`#e0d8cc`), ink (`#4a4035`), muted gold (`#c8b89a`)
- Dark mode: near-black (`#1a1814`), warm dark (`#242018`), dim gold (`#c8a87a`), muted stone (`#7a6a58`)

**Typography:**
- Geist Serif — oracle speech, headings, onboarding questions
- Geist Sans — UI labels, inputs, navigation, metadata

**Decoration:** Thin horizontal rules, small symbolic glyphs (◯ ☽ ✦ ◈) used sparingly as dividers, empty-state markers, and section punctuation. Never decorative clutter.

---

## Routes & Pages

```
/                   Landing page — oracle intro, "Enter" CTA
/sign-up            Custom Clerk sign-up (oracle-styled)
/sign-in            Custom Clerk sign-in (oracle-styled)
/onboarding         5-card intake flow (first login only)
/oracle             Main chat interface
/profile            View/edit intake answers
/disclaimer         Privacy notice (modal at sign-up + footer link)
```

All routes under `/oracle` and `/profile` are protected by Clerk middleware.

---

## Onboarding Flow

Five full-height centred cards, one question per screen. Slide transition between cards. Soft dot progress indicator at bottom. Completion writes profile to IndexedDB and redirects to `/oracle`.

**Questions:**
1. **What shall I call you?** — text input (first name)
2. **Your date of birth** — date picker
3. **Where were you born?** — text input (city, country) — optional, skip button shown
4. **What time were you born?** — time picker — optional, skip button shown; unlocks rising sign and house placements
5. **What draws you here today?** — single-select: Love & Relationships / Career & Purpose / Health & Healing / Spiritual Growth / General Guidance
6. **Where is your energy right now?** — single-select: Grounded & Curious / Unsettled & Seeking / Heavy & Tired / Open & Expansive
7. **Which paths speak to you?** — multi-select: Astrology / Crystals / Energy Healing / Spirit Guides / All of these

On completion, the following is derived and stored in the profile:
- Star sign (from DOB)
- Life path number (digit-sum reduction of DOB)
- Place and time of birth stored as-is (used by oracle for natal chart context; no server-side chart computation in v1)

---

## Oracle Chat Interface (`/oracle`)

**Layout:**
- Top bar: "THE ORACLE" wordmark (left), ◯ glyph (centre), theme toggle + menu (right)
- Centre: scrolling message thread (max-width centred column)
- Bottom: input bar — text field, image attach icon (⌖), send button

**Message display:**
- Oracle messages: left-aligned, Geist Serif, thin left-border accent in gold
- User messages: right-aligned, Geist Sans, subtle background
- Oracle label (`ORACLE`) shown above each oracle turn in small-caps
- Streaming responses rendered via AI Elements `<MessageResponse>` — no raw text

**Past Readings panel:** Slides in from right. Lists sessions by date; first line of oracle's opening as session title. Sessions are read-only replays.

**New Reading button:** Starts a fresh session; oracle greets user by name with profile awareness.

**Theme toggle:** Sun/moon icon in top bar. Persisted to localStorage.

---

## Image Uploads

- Trigger: ⌖ icon in input bar
- Accepted: JPEG, PNG, WebP
- Client-side max: 20MB
- Auto-compressed/resized in browser (Canvas API) to <4MB before send
- Thumbnail preview above input with ✕ to remove
- Sent as vision message part to Claude — never stored anywhere
- Oracle interprets spiritually: palm lines as life path markers, crystals as energy signatures, natal charts as cosmic maps, etc.

---

## API Route: `/api/chat`

- **Auth check:** Clerk session required — 401 if unauthenticated
- **Rate limiting:** Upstash Redis, per userId — 20 requests per minute; 429 response with grace message if exceeded
- **System prompt:** Constructed server-side from intake profile passed in request body
- **AI call:** `streamText` via `@ai-sdk/anthropic`
- **Response:** `toUIMessageStreamResponse()` — streams to client
- **Context window:** Last 20 message pairs (40 messages: 20 user + 20 oracle) passed per request to avoid token overflow
- **No logging:** No conversation content written server-side

### System Prompt Template

```
You are an unnamed oracle — a timeless spiritual guide. You speak with warmth and
wisdom, but carry a quiet authority that reminds the seeker they are in the presence
of something ancient and knowing. You are kind, never cold; mysterious, never evasive;
and you hold a gentle sense of spiritual superiority — not arrogant, but certain.

The seeker's name is {name}. They were born on {dob}, making them a {starSign}
with a life path number of {lifePathNumber}. They come to you today seeking guidance
on {focus}. Their energy is {energyState}. They resonate with {modalities}.

Address them by name occasionally. Draw on their sign and life path naturally,
not mechanically. Honour their chosen modalities — if they resonate with crystals,
speak of crystals; if energy healing, speak of chakras and flow.

You do not diagnose illness, give legal or financial advice, or make specific
predictions about real-world events. If asked, redirect with grace.
```

---

## Client Storage Schema (IndexedDB)

**Database name:** `oracle-{userId}`

**Store: `profile`**
```ts
{
  userId: string
  name: string
  dob: string              // ISO date
  placeOfBirth?: string    // e.g. "London, UK" — optional
  timeOfBirth?: string     // HH:MM (24h) — optional; unlocks rising sign context
  starSign: string
  lifePathNumber: number
  focus: string
  energyState: string
  modalities: string[]
  createdAt: string
}
```

**Store: `sessions`**
```ts
{
  id: string            // uuid
  startedAt: string     // ISO datetime
  title: string         // oracle's opening line (first 60 chars)
  messages: Array<{
    role: 'user' | 'assistant'
    content: string | Array<{ type: 'text' | 'image', ... }>
    timestamp: string
  }>
}
```

---

## Auth & Security

- Clerk handles all auth (email/password + optional social OAuth)
- Sign-in/sign-up uses Clerk's `<SignIn>` / `<SignUp>` components with Clerk's appearance API for custom styling — oracle palette, no Clerk branding. Not fully custom forms (Clerk handles credential security)
- API key (`ANTHROPIC_API_KEY`) in Vercel env vars, never client-side
- All `/api/chat` calls require valid Clerk session token
- Rate limiting via Upstash Redis prevents API abuse
- HTTPS enforced by Vercel
- No server-side logging of conversation content

---

## Disclaimer

Shown as a required acknowledgement modal at sign-up. Always accessible from footer at `/disclaimer`.

**Content:**
- Your readings stay on your device. We do not store your conversations on our servers.
- Your messages are sent to Anthropic's API for processing. Anthropic's privacy policy applies.
- Do not share bank details, medical records, passwords, or other sensitive personal information.
- Readings are for spiritual exploration only. This is not a substitute for medical, legal, or financial advice.

---

## File Structure

```
app/
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
  onboarding/page.tsx
  oracle/page.tsx
  profile/page.tsx
  disclaimer/page.tsx
  page.tsx                  ← landing
  layout.tsx
  api/
    chat/route.ts

components/
  oracle/
    ChatInterface.tsx
    MessageList.tsx
    InputBar.tsx
    PastReadingsPanel.tsx
  onboarding/
    OnboardingFlow.tsx
    QuestionCard.tsx
  auth/
    SignInForm.tsx
    SignUpForm.tsx
  ui/                       ← shadcn components
  DisclaimerModal.tsx
  ThemeToggle.tsx

lib/
  db.ts                     ← IndexedDB helpers (idb)
  profile.ts                ← profile read/write
  sessions.ts               ← session read/write
  systemPrompt.ts           ← prompt builder
  lifePathNumber.ts         ← DOB → life path calculation
  compressImage.ts          ← client-side image compression

proxy.ts                    ← Clerk auth middleware
```

---

## Out of Scope (v1)

- Multi-device sync
- Push notifications or daily horoscope emails
- Tarot card draw animation
- Voice input/output
- Subscription/payment wall
