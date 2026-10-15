@AGENTS.md

# SonicPrints — project guide

Marketing site for **SonicPrints**, a Coimbatore (Gandhipuram) custom-printing / branding company. They print on any product (cards, mugs, tees, boxes, banners, totes, notebooks, stickers…) and sell it as **12 kits**. It is NOT sound-wave art. Tagline: "We don't just print. We build brands."

Read this file instead of re-scanning the repo. Update it when structure changes.

## Stack
- **Next.js 16.4** (App Router, Turbopack), **React 19.3**, **TypeScript**, **Tailwind v4**, **three 0.186**.
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`, `experimental.agentFeedback`.
  - With cacheComponents, reading `searchParams`/runtime data must sit inside `<Suspense>` (see `/contact`).
  - Next 16 differs from training data — check `node_modules/next/dist/docs/` before using new APIs.
- Scripts: `npm run dev | build | start | lint`. Type-check: `npx tsc --noEmit -p .`.
- No git repo. Windows; Python is NOT installed — use `node` for scripts.
- Lint baseline: 1 pre-existing warning in `CurvedLoop` (ignore).

## Brand / design rules (must follow)
- Colours (tokens in `app/globals.css`, used as Tailwind `ink` / `accent` / `cream`):
  - `--brand-ink: #001408` — all text and dark surfaces
  - `--brand-accent: #bd5501` — accent
  - `--brand-cream: #f7f4ee`
  - Three.js uses the same via `BRAND` in `components/three/stage.ts`.
- Fonts live in `app/public/fonts/` and load with `next/font/local`:
  - **Roboto** = site font (`app/layout.tsx`, variable `--font-roboto`, family name fixed to "Roboto" so canvas code can use it; `FONT` in `components/three/textures.ts`). `font-sans/serif/mono` all map to Roboto.
  - **Poppins** = hero only (loaded in `components/sections/hero/Hero.tsx`).
  - Tuffy folder exists but is unused — do not use it.
- Logo: `app/public/images/nav/soniclogo-trimmed.png`.
- Keyframes (nav-drop, rail-tick, fab-rise, quote-draw, kit-in, hero-rise, hero-line, hero-word…) are in `globals.css`.

## Routes (`app/`)
| Route | File | Renders |
|---|---|---|
| `/` | `page.tsx` | Hero → About → Marquee → Reviews (no kits on home) |
| `/kits` | `kits/page.tsx` | `sections/kits/Kits.tsx` — KitRingScene hero + panel, `#catalogue` uses `StackedCards` ("All twelve, at a glance"), WhatsApp prompt, CtaBand |
| `/how-it-works` | `how-it-works/page.tsx` | `HowItWorks.tsx` — pinned PipelineScene (7 stages), promises, `<Crew />` (`#crew`), FAQ link, CtaBand |
| `/faq` | `faq/page.tsx` (FAQPage JSON-LD) | `faq/Faq.tsx` + `faqs.ts` — GlyphMorphScene hero ("?"→"✓"→"!"), search, tabs, accordion |
| `/contact` | `contact/page.tsx` | `quote/Quote.tsx` — QuoteScene + `QuoteForm` (via `KitAwareForm` in Suspense, `?kit=` pre-fills) + `ContactSection` ("Rather talk it through?") |

Layout (`app/layout.tsx`): `<Navbar />` + children + `<Footer />`.

## Data (`lib/`)
- `lib/site.ts`: `CONTACT` (phone +91 73387 53815, WhatsApp 917338753815, info@sonicprints.in, Gandhipuram address, `mapsQuery`), `TAGLINE`, `POSITIONING`, `QUOTE_SLA` ("2 working hours"), `KITS` (titles), `CREW` (+ `stages`), helpers `whatsappLink`, `mailtoLink`, `mapsLink`, `mapsEmbed`.
- `lib/kits.ts`: `KIT_LIST` (12 kits: slug, number, title, description, includes, background/color rotating ink/cream/accent), `kitBySlug`. Single source for kits — StackedCards and site.ts derive from it.

## Components (`components/`)
- `nav/Navbar.tsx` — owns `NAV_LINKS` (Home `/#home`, About `/#about`, Kits `/kits`, How It Works, FAQ) + CTA "Get a Quote" → `/contact`. Active state: `usePathname` + section scroll-spy on `/`.
- `footer/Footer.tsx` (+ `ScrollToTop`) — columns Explore / Help / Contact. Known TODO: footer links don't exactly match navbar; user hasn't decided between aligning links vs redesign.
- `sections/*` — one folder per section, each with `index.ts`: about, crew, faq, hero (`Hero.tsx` + `HeroCopy.tsx` cycling word), how-it-works, kits, marquee (uses CurvedLoop), quote (`Quote`, `QuoteForm` — sends via WhatsApp/mailto, `ContactSection` — channel rows + dark-filtered cropped map), reviews.
- `ui/` — `Reveal` (scroll reveal via `hooks/useReveal`), `CtaBand`.
- `animations/` — `StackedCards` (kits), `CurvedLoop` (marquee), `InfiniteScroll`, `BreakAnimate` (unused, deletable).

## Three.js (`components/three/`)
All scenes are `"use client"` components that call `mountStage(host, setup, opts)` from `stage.ts` (handles renderer, resize, pointer easing, reduced-motion, RAF, disposal via `disposeTree`). `setup` returns `{ resize, update(t, dt), dispose }`.
- Shared: `stage.ts` (`mountStage`, `disposeTree`, `BRAND`), `textures.ts` (`labelTexture`, `wrapText`, `FONT`), `card.ts` (`roundedShape`, `faceGeometry`, `roundedCard`), `painters.ts` (`PAINT`: cardFront, cardBack, mug, box, tote, banner, sticker, tshirt, notebook — canvas painters for product artwork), `morphPoints.ts` (`createMorphPoints`, `sampleSphere/Geometry/Canvas/Helix`).
- Scenes (exported from `index.ts`):
  - `PrintOrbitScene` — home hero. 8 products orbit (business cards, mug, T-shirt, box, roll-up banner, tote, notebook, sticker) using an `onBeforeCompile` "printable" material that prints as a world-x beam passes (`uState` 0/1/2); print beam (emitter at foot), sparks, dust. Centre = calm particle **sphere only** (`hold: Infinity`, no morphing) + orange halo sprite that flares with print `activity`. Uses `setViewOffset` to frame off-centre.
  - `QuoteScene` (contact), `PipelineScene` (how-it-works), `CrewScene` (crew fan cards, respects reduced motion; exports `CrewControls`), `KitRingScene` (kits hero), `GlyphMorphScene` (FAQ, own inline shader).

## User preferences (from past sessions)
- Wants high-end, animated Three.js visuals related to printing; dislikes minimal/abstract centre objects. Centre of hero should not morph/transform.
- Content source: the SonicPrints master-plan document (see memory).
- Keep nav and footer options consistent.

## Verification workflow
- `npx tsc --noEmit -p .` and `npx eslint <files>`; full `npm run build` for route/prerender issues.
- Visual checks: `next start -p 3123` + headless Chrome CDP screenshot script (was in session scratchpad as `shots.mjs`, desktop 1440×900, phone 390×844). Stop the server afterwards.
- For multi-line code edits from the shell, write a `.cjs` script in scratchpad rather than inline `node -e` (quoting breaks in bash).
