# Product Design Contract

Keep this document specific, short, and durable. It is the visual and interaction source of truth shared by design, implementation, browser QA, and review. Replace template prompts with accepted decisions; do not preserve a menu of unused options.

> Status: **bootstrap inventory** of the implemented (de-facto accepted) direction. No formal design review has been recorded; this document records what exists so changes are deliberate. A `/design` pass may replace it — that is a product decision, not a bootstrap one.

## Experience brief

- Product / surface: corporate website for ISBATAB (ایمن صنعت باتاب), a Persian HSE consulting company (oil/gas/petrochemical/mining/construction).
- Primary audience: industrial B2B decision-makers (fa-IR, RTL) evaluating an HSE services vendor.
- Single job of this surface: prove credibility (licenses, certificates, projects, standards) and get the visitor to call or WhatsApp.
- Desired user feeling before → after: skeptical of a small unknown vendor → confident this company is licensed, experienced, and reachable.
- Success signal: contact-path interaction (tel/WhatsApp/email click or WhatsApp compose).

## Brand character

Describe useful tensions rather than vague adjectives.

- Industrial credibility, not generic corporate polish.
- Calm authority, not marketing noise.
- Practical and concrete (licenses, projects, standards), not aspirational filler.

## Reference calibration

| Reference       | Adopt | Avoid | Why it fits this product                                                                                                               |
| --------------- | ----- | ----- | -------------------------------------------------------------------------------------------------------------------------------------- |
| (none recorded) | —     | —     | No accepted references exist in the repository; the current design is original. Do not claim a reference without an accepted decision. |

References calibrate principles; they are not permission to clone another product.

## Direction

- Visual thesis (as implemented): restrained "industrial trust" — deep navy primary, teal accent, cool light-gray canvas, generous white cards, soft shadows, RTL Persian typography on Vazirmatn.
- Signature element: the deep-navy header with the teal action accent (`#111d31` / `#0f4f46`) and rounded-full pill CTAs; subtle radial-gradient "motion-bg" on the home hero band.
- One justified aesthetic risk: restrained two-color system with limited imagery — real photography is committed for services, certificates, and the company (see Media below); three vector placeholders remain (`hero-pattern.svg`, `og-cover.svg`, `service-safety.svg` fallback) (LICENSE/ownership of photography: UNKNOWN — sourced by the company; placeholders are project-made SVGs).
- What must feel familiar: RTL Persian layout, `tel:`/WhatsApp CTAs, certificate/project lists as proof.
- What must never look generic: the teal/navy palette and Vazirmatn type are the differentiation; do not drift toward purple/blue SaaS gradients or generic stock-style cards.

## Semantic tokens

### Color

Defined in `src/styles/global.css` (`:root`) and mapped in `tailwind.config.ts` as `brand.*`. Use the Tailwind tokens, never raw hex in components.

| Role                       | Value                                                                   | Foreground/background use         | Contrast proof                              |
| -------------------------- | ----------------------------------------------------------------------- | --------------------------------- | ------------------------------------------- |
| canvas                     | `#f5f7f8`                                                               | page background                   | —                                           |
| surface                    | `#ffffff`                                                               | cards, header, table              | —                                           |
| text                       | `#1f2937`                                                               | body text                         | not measured (UNVERIFIED)                   |
| muted text                 | `#626a78`                                                               | captions, meta                    | not measured (UNVERIFIED)                   |
| primary                    | `#111d31`                                                               | headings, header, primary buttons | white on primary: not measured (UNVERIFIED) |
| accent                     | `#0f4f46`                                                               | CTAs, links, focus ring           | white on accent: not measured (UNVERIFIED)  |
| border                     | `#d6dde5`                                                               | card/table borders                | —                                           |
| danger / success / warning | none defined as tokens; amber used inline for WhatsApp placeholder note | —                                 | —                                           |

No color-contrast measurements are committed; a11y checks must verify before release claims.

### Typography

| Role           | Family / fallback                                                                                         | Scale / weight / leading                                                                                             | Purpose                                       |
| -------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| all text       | Vazirmatn → Vazir → Tahoma → sans-serif (`fontFamily.sans`)                                               | weights loaded: **400, 500, 700** (600 synthesizes from 500); body `text-sm`/`text-base`, headings `font-bold` | Single-family system; Persian + Latin subsets |
| utility / data | same family; `.num-text` / `.latin-text` classes set `direction: ltr; unicode-bidi: isolate` for LTR runs | `letter-spacing: 0.01em`                                                                                             | phone numbers, dates, IDs, Latin terms        |

Font source and license: **Vazirmatn, OFL-1.1**, via `@fontsource/vazirmatn`; woff2 committed under `public/fonts/` (arabic + latin subsets, weights 400/500/700 all declared in `global.css`). Fallback preserves hierarchy adequately; metric mismatch with Tahoma is acceptable.

### Geometry and depth

- Spacing/rhythm: Tailwind scale; section rhythm `py-12 sm:py-16 lg:py-20` (`.section-block`); container `.container-wrap` = `max-w-6xl` + `px-4 sm:px-6 lg:px-8`.
- Grid/content measure: max content width 72rem (6xl); card grids `md:grid-cols-2/3`, `lg:grid-cols-2`.
- Radius logic: cards `rounded-2xl`; pills/CTAs `rounded-full`; inputs `rounded-xl`.
- Border/shadow logic: `border-brand-border` on cards; shadow token `shadow-soft` (`0 10px 30px -18px rgba(12,23,40,0.42)`); hover lift `translateY(-6px)` + deeper shadow.
- Icon/media treatment: inline SVG (stroke `currentColor`) for menu icons; real photography for service/certificate/company media (`public/images/services/*`, `certificates/*`, `company/*`); brand logo `public/images/brand/isbatab-logo.png` (owned by the company — license UNKNOWN, treat as company asset).

### Media and art direction

- Photography / illustration / data-visualization language: real photography (service cards, certificates, company/about images) over the navy/teal canvas; three project-made SVG placeholders remain for decorative/fallback use (`hero-pattern.svg`, `og-cover.svg`, `service-safety.svg`).
- Icon family and stroke/fill rules: hand-written inline SVGs, `stroke="currentColor"`, 1.8 stroke, 24×24 viewBox.
- Asset source, ownership/license, and attribution: project-made SVGs; logo and certificate JPGs (`public/images/certificates/iso-45001-certificate.jpg`, `training-license.jpg`) are company documents — no license records (UNKNOWN).
- Responsive art direction and meaningful alt-text rules: images get `width`/`height`, `loading="lazy"` (hero-adjacent eager), `alt=""` for decorative, descriptive Persian alt for meaningful images.
- Fallback when the preferred asset cannot load: `alt` text + width/height boxes; no JS image fallbacks.

## Composition and responsiveness

- Desktop composition: sticky navy header (logo + horizontal nav + phone pill + WhatsApp pill), hero band, section blocks with 2–3 column card grids, footer with contact columns.
- Mobile recomposition: header collapses to logo + hamburger (md breakpoint `768px`); slide-down panel with nav links and tel/WhatsApp buttons; card grids stack to one column; contact grid single-column. This is real recomposition, not shrinkage.
- Dense/long-content behavior: services grouped by category headers over card grids; projects as a responsive card grid.
- Supported viewport/device baseline: 320 px minimum tested target; breakpoints `sm 640 / md 768 / lg 1024` (Tailwind defaults). No device matrix evidence committed (UNVERIFIED beyond code inspection).
- RTL/localization behavior: fa-IR RTL only; no LTR locale; LTR runs isolated via `.num-text`/`.latin-text`.

## Components and states

| Component / pattern | Variants                                                                | Required states                                                                        | Reuse or change |
| ------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------- |
| Header (sticky)     | desktop nav / mobile drawer                                             | default / hover (text→accent) / focus-visible / open (aria-expanded) / closed          | keep            |
| Mobile menu         | drawer + overlay + body lock                                            | open/close, Escape, link-click closes                                                  | keep            |
| Hero                | home variant with dual CTAs                                             | default                                                                                | keep            |
| SectionTitle        | title + optional subtitle                                               | default                                                                                | keep            |
| Card                | service / project / highlight / contact                                 | default / hover-lift                                                                   | keep            |
| ServiceCard        | grid grouped by category (`/services`) / featured grid (home)       | default / hover-lift / empty details list                                      | keep            |
| ProjectCard        | card grid (`/projects`, home)                                       | default / hover-lift                                                             | keep            |
| WhatsAppForm        | `status: active` / `status: placeholder` (disabled button + amber note) | default / required-field validation (native) / submit→wa.me open / placeholder message | keep            |
| 404 page            | centered card + home/contact links                                      | noindex page                                                                           | keep            |
| Footer              | contact columns + quick links                                           | default                                                                                | keep            |

Required journey states:

- loading: static site — none beyond font swap (`font-display: swap`).
- empty: blog with no published posts (drafts excluded) renders an empty list; projects/services always have data (content JSON).
- error/retry: 404 page; no dynamic errors exist.
- success: WhatsApp compose opens `wa.me` with prefilled text ("در حال انتقال به واتساپ..." status text).
- permission/offline where relevant: none — links degrade to native dialers/WhatsApp app.

## Motion and feedback

- Orchestrated moment (or explicit none): gentle home-hero fade-up stagger (`animate-fade-up`, 90 ms delays) and soft float on decorative elements (`animate-float-soft` 6s); hover-lift on cards.
- State-transition motion: 0.35s ease transitions on card hover; 0.2s color transitions on links.
- Duration/easing tokens: hardcoded in `global.css` (no motion token scale yet).
- Reduced-motion alternative: `prefers-reduced-motion: reduce` disables hover-lift transitions, float, and fade-up (elements become visible statically). Must be preserved for any new motion.
- Sound/haptics: none.

## Content voice

- Vocabulary and tone: formal Persian business prose; factual, standard-referencing (ISO 45001/14001, ministry licensing); short labels, imperative CTAs ("تماس فوری", "ارسال در واتساپ").
- Action-label rules: verbs for actions; labels are concrete, not decorative.
- Error and empty-state rules: 404 uses calm, concrete guidance ("صفحه مورد نظر پیدا نشد" + two CTAs); placeholder WhatsApp state explains the fallback action.
- Realistic content fixtures: `src/content/*.json` holds real company content (extracted from the company DOCX); blog has one sample post.

## Quality budgets

- Accessibility target: WCAG 2.2 AA unless the product accepts another target (no stricter target accepted).
- Text/non-text contrast target: 4.5:1 / 3:1; unmeasured — verify before release claims.
- Keyboard/focus/touch target: `:focus-visible` outline (2px accent); touch targets ≥ 40 px on nav buttons (h-10 w-10 hamburger); full keyboard path exists (links, form, native controls).
- Performance target: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75 unless stricter product budgets are accepted (default; unmeasured).
- Pre-release lab budget and production RUM/rollout proof: none accepted/committed (UNKNOWN).
- Image/font/JS budget: fonts 400/500/700 (600 synthesizes from 500), `font-display: swap`, preload of arabic 400; inline stylesheets; images lazy + width/height. No numeric budget accepted.
- Supported browsers and input modes: modern evergreen browsers; mouse/touch/keyboard; no browser matrix committed.

## Screen acceptance

| Flow / screen | Critical states                        | Viewports/locales         | Visual proof                |
| ------------- | -------------------------------------- | ------------------------- | --------------------------- |
| Home          | default, mobile menu open, hover       | 320 / 768 / 1280+, fa-RTL | none committed (UNVERIFIED) |
| Services      | grouped card grids (category headers)           | desktop/mobile, fa-RTL    | none committed (UNVERIFIED) |
| Projects      | card grid                                    | desktop/mobile, fa-RTL    | none committed (UNVERIFIED) |
| Contact       | WhatsApp active/placeholder, map embed | desktop/mobile, fa-RTL    | none committed (UNVERIFIED) |
| 404           | default                                | all, fa-RTL               | none committed (UNVERIFIED) |

No visual-regression evidence is committed. The e2e lane (`tests/e2e/home.spec.mjs`) provides DOM/state coverage; screenshot artifacts go to `.artifacts/playwright/` and are for human review or an image-capable model only.

## Decisions intentionally deferred

- Formal acceptance of this direction via `/design` (the inventory above is the baseline).
- Photography/real media sourcing and licenses.
- Motion token scale.
- Contrast-proof automation (axe/CI a11y checks).

## Decision log

| Date      | Decision                                                     | Evidence / rationale                                              | Revisit when                     |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------- |
| bootstrap | Inventory the implemented direction as the accepted baseline | Code inspection of `global.css`, `tailwind.config.ts`, components | A `/design` decision replaces it |
