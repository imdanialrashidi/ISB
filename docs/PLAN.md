# Product Roadmap

Use this file for the product-level path from idea to production. Put task-level, multi-session execution state in `docs/exec-plans/active/`. Delete inapplicable stages and stale commitments.

## Outcome and boundaries

- Product outcome: a credible, fast, RTL Persian corporate website for ISBATAB that documents licenses/certificates/services/projects and converts industrial B2B visitors to phone/WhatsApp contact.
- Measurable success: contact-path interactions (tel/WhatsApp/email) from site visitors. NOT YET MEASURED — no analytics installed; an instrumentation decision is required before this can be tracked.
- Explicit non-goals: payments, booking, accounts, CMS, multi-language, e-commerce, server-side lead capture.
- Deadline / capital / compliance constraints: none recorded (UNKNOWN).
- Current stage: **Vertical MVP (stage 3)** — real content, all core journeys implemented and statically built; blog is a sample; deployment to Cloudflare Workers is wired (`npm run deploy`) but not verifiable from the repository.

## Evidence ledger

| Claim or assumption                                     | Status     | Evidence                                                                                          | Next test / decision                                         |
| ------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| All pages render from committed content JSON            | confirmed  | `npm run build` → 8 pages; content files typed in `src/lib/types.ts`                              | keep the affected content lane green                         |
| RTL fa-IR with Persian digits throughout                | confirmed  | `BaseLayout` `lang="fa" dir="rtl"`; `toPersianDigits` used in components                          | e2e smoke asserts `lang`/`dir`                               |
| Critical journey (contact via tel/WhatsApp) implemented | confirmed  | `Hero`, `Header`, `ContactCTA`, `WhatsAppForm` compose `tel:`/`wa.me` hrefs                       | committed `tests/e2e/home.spec.mjs` covers it                |
| Certificates/licenses content is accurate and current   | assumed    | content extracted from the company DOCX (`scripts/extract-docx.mjs`); no independent verification | product owner review of `certifications.json`                |
| Site is deployed and reachable at isbatab.ir            | unmeasured | only README deploy instructions exist; no deploy workflow in `.github/`                           | confirm live deployment and add a deploy workflow if desired |
| Contact-path conversion actually happens                | unmeasured | no analytics                                                                                      | decide analytics tooling first                               |
| Performance meets CWV `good`                            | unmeasured | README-listed optimizations only; no Lighthouse/RUM evidence                                      | run a lab budget once, then RUM                              |
| Blog adds SEO value                                     | assumed    | one sample post; page copy says content comes "in the next version"                               | decide blog content roadmap                                  |

## Stage gates

### 0. Discovery proof

- Scope: target user, painful job, current alternative, riskiest assumption.
- Exit evidence: user/problem signal and a measurable product thesis in `docs/PRODUCT.md`.
- Next smallest experiment: **done** — repository contains the implemented product; discovery evidence was not recorded before implementation (historical gap; see `docs/PRODUCT.md` open decisions).

### 1. Experience direction

- Scope: critical journey, information architecture, content, brand character, visual thesis, prototype.
- Exit evidence: accepted `docs/DESIGN.md`; critical states and desktop/mobile proof plan defined.
- Decision owner: product owner.
- Status: the implemented visual direction (navy/teal industrial trust, Vazirmatn) is inventoried in `docs/DESIGN.md`; it is the de-facto accepted direction unless the owner decides otherwise.

### 2. Walking skeleton

- Scope: one deployable end-to-end path through real boundaries with observability.
- Exit evidence: canonical install/start/test path works; architecture and rollback assumptions are proven.
- Verification: `npm install` → `npm run dev`/`build`/`preview` → `bash scripts/verify.sh`; proven locally at bootstrap. Deployment and rollback (Cloudflare Workers) remain unexercised — **next action**.

### 3. Vertical MVP

- Scope: smallest useful end-to-end behavior that tests the riskiest product assumption.
- Exit evidence: must-have journeys function with real data/state, negative paths, analytics, and accepted visual quality.
- Non-goals: blog depth, multi-language, CMS.
- Status: journeys and negative paths (404, WhatsApp placeholder state) implemented; **analytics not installed** — required for the measurable-outcome claim.

### 4. Internal alpha

- Scope: team use with seeded/realistic data and controlled failure testing.
- Exit evidence: no release-blocking correctness/security/accessibility issues; support and recovery path exercised.
- Feedback sample / owner: none recorded (UNKNOWN).
- Status: not started; content owner review of JSON content is the first step.

### 5. External beta

- Scope: bounded cohort, feature flags or reversible rollout, support channel.
- Exit evidence: activation and guardrail metrics meet targets; field performance and reliability are measured; top UX failures resolved.
- Rollback trigger: none defined (UNKNOWN).
- Status: not started; blocked on deployment confirmation + analytics.

### 6. Release candidate

- Scope: frozen release boundary; compatibility, data, security, visual, performance, operational hardening.
- Exit evidence: `/ship` is `READY`; no unresolved BLOCKER/MAJOR; recovery/rollback and runbook proven.
- Sign-off owners: none recorded (UNKNOWN).
- Status: not started.

### 7. Staged production

- Scope: progressive exposure with telemetry and explicit stop conditions.
- Exit evidence: health window passes at each stage; incident/support ownership is active.
- Stages and stop conditions: none defined (UNKNOWN).
- Status: not started.

### 8. Learning loop

- Scope: product outcomes, failures, support signals, agent/harness evals.
- Exit evidence: validated learning changes `docs/PRODUCT.md`, roadmap priorities, regression tests, or workflow eval cases.
- Review cadence: none recorded (UNKNOWN).
- Status: not started.

## Critical path and risks

| Risk / dependency                                 | Control or experiment                                             | Owner         | Decision date / trigger       |
| ------------------------------------------------- | ----------------------------------------------------------------- | ------------- | ----------------------------- |
| Deployment unverified                             | Confirm Cloudflare Workers deployment (`npm run deploy`); exercise rollback from Git   | product owner | before claiming release-ready |
| No conversion measurement                         | Choose analytics/privacy tooling; instrument contact paths        | product owner | before stage 4                |
| Content accuracy (certificates/projects/contacts) | Product owner review of `src/content/*.json`                      | product owner | before stage 4                |
| WhatsApp number is a live business channel        | Confirm `contacts.json.whatsapp.status`/number with the office    | product owner | before launch                 |
| Performance unmeasured                            | Run a lab budget (Lighthouse on `npm run preview`); add RUM later | engineering   | before stage 5                |
| Blog is a sample only                             | Decide content roadmap or remove the section                      | product owner | before stage 5                |

## Next bounded slice

- Goal: confirm live deployment (Cloudflare Workers) and capture a first lab performance budget; decide analytics tooling.
- Acceptance proof: site reachable at the configured `site` URL with correct `_headers`; Lighthouse lab run recorded in the evidence ledger; analytics decision recorded in `docs/PRODUCT.md`.
- Recovery / rollback: static content — redeploy any previous commit; no state to migrate.

## Deferred decisions

- Analytics/privacy tooling and consent handling.
- Blog content roadmap.
- Whether the Google Maps embed should be replaced with a link-only pattern (CSP currently allows `https://www.google.com` frames).
- Acceptance of a formal visual direction refresh (current direction is the implemented de-facto one).
