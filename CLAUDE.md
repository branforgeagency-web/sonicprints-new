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
| `/` | `page.tsx` | Hero → About → Marquee → Products (FEATURED products — items with `featured: true` in catalogue.json — with AddToCart, pinned sideways scroll; last tile + View more → /catalogue#catalogue) → Audiences (B2B/B2C) → Reviews |
| `/catalogue` (old `/kits` redirects, in next.config.ts) | `catalogue/page.tsx` | `sections/kits/Kits.tsx` — KitRingScene hero (10 catalogue categories as ring cards, label "CATEGORY"; panel CTA → /categories/<slug>) + panel, `#catalogue` uses `StackedCards` ("Browse by category" — the 10 catalogue categories; each card links to /categories/<slug>), WhatsApp prompt, CtaBand |
| `/how-it-works` | `how-it-works/page.tsx` | `HowItWorks.tsx` — pinned PipelineScene (7 stages), promises, `<Crew />` (`#crew`), FAQ link, CtaBand |
| `/faq` | `faq/page.tsx` (FAQPage JSON-LD) | `faq/Faq.tsx` + `faqs.ts` — GlyphMorphScene hero ("?"→"✓"→"!"), search, tabs, accordion |
| `/categories/[slug]` | `categories/[slug]/page.tsx` (generateStaticParams, slug in Suspense) | `sections/category/CategoryProducts.tsx` — category intro, product grid with AddToCart, other categories |
| `/products/[slug]` | `products/[slug]/page.tsx` (generateStaticParams, slug read inside Suspense) | `sections/product/ProductDetail.tsx` — Amazon-style: `ProductGallery` (photo with hover zoom), `BuyBox` (options/qty → WhatsApp quote), about, specs, print methods, steps, FAQ, related |
| `/checkout` | `checkout/page.tsx` | `sections/checkout/Checkout.tsx` — cart summary + customer form (B2B/B2C, pickup/delivery) → `placeOrder`, opens WhatsApp, clears cart, goes to /track?id=…&new=1 |
| `/track` | `track/page.tsx` (Track in Suspense, reads ?id) | `sections/track/Track.tsx` — lookup by order ID, 7-step timeline, orders on this device |
| `/dashboard` | `dashboard/page.tsx` (noindex) | `app/dashboard/dashboard-area/Dashboard.tsx` — staff dashboard, full-screen fixed layer (z-80) over the site navbar/footer; needs a session from Staff Login |
| `/contact` | `contact/page.tsx` | `quote/Quote.tsx` — QuoteScene + `QuoteForm` (via `KitAwareForm` in Suspense, `?kit=` pre-fills) + `ContactSection` ("Rather talk it through?") |

Layout (`app/layout.tsx`): `<Navbar />` + children + `<Footer />`.

## Data (`lib/`)
- `lib/site.ts`: `CONTACT` (phone +91 73387 53815, WhatsApp 917338753815, info@sonicprints.in, Gandhipuram address, `mapsQuery`), `TAGLINE`, `POSITIONING`, `QUOTE_SLA` ("2 working hours"), `KITS` (titles), `CREW` (+ `stages`), helpers `whatsappLink`, `mailtoLink`, `mapsLink`, `mapsEmbed`.
- Catalogue: ALL content in `data/catalogue.json` — the official SonicPrints catalogue: 10 categories (shared details: tagline, description, highlights, options, specs, faqs, kit) with 124 items; an item may have `details` overrides and `featured: true`. Generated once from the official list; edit the JSON directly. `lib/products.ts` exports `CATEGORIES`, `PRODUCTS` (flattened, category details merged), `productBySlug`, `categoryBySlug`; photos are matched BY FILE NAME: `app/public/images/products/<category-slug>/<product-slug>.(webp|jpg|png|avif)` (+ optional `cover.*`); `scripts/sync-product-images.mjs` (`npm run images`, also `prebuild`) generates `lib/product-images.ts` (do not edit) and a README.md checklist in each folder. Items without a photo use `components/ui/ProductMedia` placeholder. Home slider shows FEATURED products; Kits page stacked cards show categories → `/categories/<slug>` (items + AddToCart) → `/products/<slug>`.
- `lib/kits.ts`: `KIT_LIST` (12 kits: slug, number, title, description, includes, background/color rotating ink/cream/accent), `kitBySlug`. Single source for kits — StackedCards and site.ts derive from it.

## Components (`components/`)
- Orders (FRONT-END ONLY demo, user chose this): `lib/orders.ts` — `ORDER_STEPS` (7 stages + crew owner), `placeOrder`, `useOrders`, `orderMessage`; saved in localStorage, `step` never advances (no backend). Upgrade path: replace this module with API/DB + admin.
- `cart/` — quote cart (no prices): store in `lib/cart.ts` (useSyncExternalStore + localStorage, `cart.add/setQty/remove/clear/open/close`, `useCart`), `CartButton` (navbar, count badge), `CartDrawer` (in layout; edit qty, remove, send all on WhatsApp), `QtyStepper` (optional `onRemove` at 1), `AddToCart` (button → becomes − qty + bound to the cart line once added; used on home cards and product `BuyBox`).
- `auth/` — staff login UI only (no backend): `LoginButton` (navbar icon on desktop, "Staff Login" row in mobile menu) opens `LoginModal` (portal card: Admin/Employee role tiles, Admin → email + password, Employee → username + password; submit saves a demo session (`auth/session.ts`: `saveSession/clearSession/useSession`, localStorage `sp-session`), routes to /dashboard with a loader overlay on the card until `usePathname()` is /dashboard, then closes — simulated, no auth). Animations in `auth/login.css` (plain CSS, classes prefixed `login-` — CSS modules do NOT work here because the `*.css` Turbopack rule in next.config.ts overrides them).
- `app/dashboard/dashboard-area/` (colocated with the route, no page.tsx inside so not a route) — staff dashboard UI (demo data in `data.ts`): `Dashboard` shell, `Sidebar` (logo, 4 views: Dashboard / Orders / Customers / Employees, Log Out; collapses on desktop, drawer on mobile), `Topbar` (menu, dark/light toggle via `useDashTheme` → localStorage `sp-dash-theme`, avatar menu), `dashboard-analytics/DashboardAnalytics.tsx` (centre content of the Dashboard tab: money cards, order counts, SVG weekly bar chart + best-seller donut), `app/dashboard/side-panel/SidePanel.tsx` (reusable right panel: open/onClose/title/eyebrow/contentKey/footer + optional width/onWidthChange; `usePanelWidth()` = remembered width (localStorage `sp-panel-width`, default 480, min 380, max min(900, innerWidth-700)); on xl it sits below the topbar, left-edge handle drags to resize (double-click resets, arrow keys work), page sets `--panel-w` + `xl:pr-[var(--panel-w)]` to make room; drawer + backdrop below xl; Escape closes), `app/dashboard/table/DataTable.tsx` (generic `DataTable<T>` with `Column<T>` defs + pagination: page-size select, prev/next, numbered pages with ellipsis), `views/` (OrdersView: filters + search → DataTable; CustomersView: B2B/B2C filter, sort, search + "business card" wall (ink stock = B2B, cream = B2C, crop marks, spend rank, ink-level bar); clicking a card opens `CustomerDetails` in `SidePanel`, clicking another swaps it; EmployeesView: DataTable with name, status switch (local state), username, email, phone, department, branch, area, location, address, state, country + All/Active/Inactive filter and search; data `EMPLOYEES` in data.ts). Theme tokens `--d-*` in `dashboard.css` (scoped to `.dash`, `[data-theme=light]`).
- `nav/Navbar.tsx` — owns `NAV_LINKS` (Home `/#home`, About `/#about`, Catalogue `/catalogue`, How It Works, FAQ) + CTA "Get a Quote" → `/contact`. Active state: `usePathname` + section scroll-spy on `/`.
- `footer/Footer.tsx` (+ `ScrollToTop`) — columns Explore / Help / Contact. Known TODO: footer links don't exactly match navbar; user hasn't decided between aligning links vs redesign.
- `sections/*` — one folder per section, each with `index.ts`: about, crew, faq, hero (`Hero.tsx` + `HeroCopy.tsx` cycling word), how-it-works, kits, marquee (uses CurvedLoop), quote (`Quote`, `QuoteForm` — sends via WhatsApp/mailto, `ContactSection` — channel rows + dark-filtered cropped map), reviews.
- `ui/` — `Reveal` (scroll reveal via `hooks/useReveal`), `CtaBand`, `Loader` (brand spinner: `size` sm/md/lg, optional `label`, `overlay` covers its relative parent, `show` fades it; used by LoginModal).
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
