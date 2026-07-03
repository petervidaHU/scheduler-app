# UX / UI Principles

**Status:** Adopted — this is the starting point and the reference for every UI refactor and new feature.
**Scope:** The React Router v7 app (`app/`). The old Next.js app is out of scope (Phase 7 removes it).

This document records *decisions*, not options. When a new screen or component raises a question this
file doesn't answer, extend this file first, then build.

---

## 1. Product context (why these principles)

The app manages the **schedule-making process for schools**: an inherently complex, multi-step domain
where most tasks depend on other tasks (a schedule entry needs a frame, a timeslot, a teacher, a
subject, a classroom, a class — and each of those was created earlier by someone). Users are **adults,
mostly teachers and school administrators**, working primarily on **desktop/laptop** during planning
sessions, with occasional tablet/phone lookups.

Four consequences drive everything below:

1. **Orientation over decoration.** At any moment the user must be able to answer: *Where am I?
   What am I doing? What did my last action change? Which entities are involved?* Every layout,
   color, and feedback decision serves one of these four questions.
2. **Dependencies must be visible.** Because tasks build on each other, the UI must show
   prerequisites and connections explicitly (empty states that say what to create first, entity
   badges that say what a lesson is made of) instead of failing silently or with a cryptic error.
3. **Calm, dense, professional.** This is a work tool used for hours. Minimal chrome, generous
   whitespace *between* groups, compact density *inside* data views. Color is information, never
   ornament — but the app should still feel warm and crafted, not gray.
4. **Loosely coupled UI.** Features will keep being added and the backend may be extracted later.
   UI components must not know about routes, sessions, or Prisma types — they receive plain props
   and emit events/form submissions.

---

## 2. Decisions at a glance

| Topic | Decision |
|---|---|
| Navigation | Persistent collapsible **left sidebar** (Mantine `AppShell`) + slim top bar |
| Color usage | **Entity-coded colors** (stable hue per entity type) + separate functional colors |
| Styling system | **Mantine-first; Tailwind is removed.** Theme tokens + CSS Modules for custom UI |
| Color modes | Light, dark, and auto — all first-class, driven by Mantine CSS variables only |
| Accessibility | **WCAG 2.2 AA baseline** everywhere + in-app user toggles (contrast, font scale, motion) |
| Device priority | Desktop-first; responsive down to tablet; phone gets read-mostly experiences |
| Language | Every user-visible string goes through i18n (`en`, `hu`). No hardcoded copy. |
| Create/edit forms | **Primary** entity forms get a dedicated URL + full page. Drawers are for secondary/contextual actions only. |

---

## 3. Information architecture & navigation

### 3.1 Shell

One global shell (Mantine `AppShell`) wraps every authenticated screen:

```
┌────────┬──────────────────────────────────────────────┐
│  LOGO  │  [School: Kossuth ▾]        ⌕  hu ▾  ◐  👤  │  ← top bar (56px)
├────────┼──────────────────────────────────────────────┤
│ Dash-  │  Schedules › 2026 Spring › Edit              │  ← breadcrumbs
│ board  │  ┌────────────────────────────────────────┐  │
│ Sched- │  │ Page header: title + primary action    │  │
│ ules   │  ├────────────────────────────────────────┤  │
│ Time-  │  │                                        │  │
│ slots  │  │ content                                │  │
│ Sylla- │  │                                        │  │
│ bus    │  └────────────────────────────────────────┘  │
│ ─────  │                                              │
│ Resou- │                                              │
│ rces   │                                              │
└────────┴──────────────────────────────────────────────┘
```

- **Sidebar** (collapsible to icons): Dashboard, Schedules, Timeslots, Syllabus, then a separated
  **Resources** group (Teachers, Subjects, Classes, Classrooms, Specialties, Frames — today's
  "Admin" tabs become real destinations). Exactly one item is visually **active** at all times
  (filled background in the section color, not just link color).
- **Top bar**: tenancy (school) switcher on the left side of the content area — tenancy is *context*,
  so switching it must be one click away and its current value always visible. Right side: locale
  switcher, color-scheme toggle, user menu (profile, accessibility settings, logout as a proper
  menu item — never a bare `<button>`).
- **Public pages** (login, signup, pricing, docs) use a separate minimal centered shell, no sidebar.

### 3.1a Drawer vs. dedicated page

Two containers exist for "add/edit something" and they are not interchangeable:

- **Dedicated page** (`/entity/new`, `/entity/:id/edit`) — use when the form *is* the reason the
  user navigated here: creating/editing a primary Resources entity (teacher, subject, classroom,
  class, specialty, frame), a schedule, etc. Full width, its own breadcrumb entry, its own
  `PageHeader`. A form squeezed into a narrow side panel undersells the most important thing on
  the screen — don't do that.
- **Drawer** — use only for secondary/contextual actions layered on top of a list or view the
  user is already looking at: viewing an existing planner lesson's detail, a quick syllabus entry
  next to its table, the timeslot template forms. The user stays anchored to the page behind it.

If unsure which one a new flow needs, ask: would the user ever navigate here *only* to do this
one thing? If yes, it's a page.

### 3.2 Where am I? — the three orientation layers

Every authenticated page renders all three, always, in this order:

1. **Active sidebar item** — which section.
2. **Breadcrumbs** — the path within the section (`Schedules › 2026 Spring › Edit`). Breadcrumb
   items are links; the last item is plain text. Generated from route data, never hand-written
   per page.
3. **Page header** — one `h1`-level `Title` per page (exactly one), an optional one-line dimmed
   description, and the page's **single primary action** on the right (e.g. "New schedule").
   Secondary actions go into a `Menu` behind an ellipsis, not a button row.

Rules:
- Never two competing titles (current bug: `tenancy-layout` and `my-tenancy-layout` both render
  "My tenancy dashboard"). One shell, one breadcrumb trail, one page title.
- **No internal identifiers in the UI.** Users see the school *name*, never `tenancyId: cmg7…`;
  never "guarded by Phase 3 service-layer guard", never "overview source". Debug info goes to logs.

### 3.3 What are the entities involved? — connection visibility

- Any composite record (a planner lesson, a syllabus item) always displays its constituent
  entities as **entity chips** (see §5.3) — subject, class, teacher, room — in a fixed order.
- Every entity chip is (eventually) clickable → navigates to or previews that entity.
- **Empty states teach the dependency chain.** If a list is empty because a prerequisite is
  missing, the empty state says so and links to the fix:
  > *"No timeslots yet. Timeslots are built from **Frames** — create a frame first."* → [Go to Frames]
- Deleting an entity that others depend on must state the consequence in the confirmation dialog
  ("This teacher is used in 12 lessons across 2 schedules"), not fail afterwards.

---

## 4. Layout system

- **Content widths** (via `AppShell` main area, replacing the fixed 960px cap):
  - *Reading/forms pages* (dashboard, settings, auth): `max-width: 760px`, centered.
  - *Data pages* (tables, lists): `max-width: 1200px`.
  - *Canvas pages* (schedule planner): **full width**, the grid owns the viewport; page chrome
    stays minimal. Never force the planner into a reading column.
- **Spacing** uses Mantine scale only (`xs…xl`); the rhythm is: `xl` between page sections,
  `md` between cards in a group, `xs`/`sm` inside a card. No raw pixel margins in components.
- **Cards** (`Paper`/`Card` with theme defaults) are the grouping unit; do not nest cards inside
  cards more than one level.
- **Density:** tables and the planner use compact sizing (`size="sm"`, tight vertical padding);
  forms and marketing-ish pages breathe. Density is a property of the *content type*, not of the
  page author's mood.
- **Responsive behavior:** sidebar collapses to icons < `lg`, becomes a drawer < `sm`. The planner
  grid scrolls horizontally on small screens (it already does) — never reflow it into a stack.

---

## 5. Color system

### 5.1 Palettes (already in `app/theme.ts`)

| Palette | Hue | Role |
|---|---|---|
| `cambridge` | green | **Primary** — actions, links, active nav, focus |
| `tiffany` | mint | Entity accent + success family |
| `khaki` | gold | Entity accent + warning family |
| `taupe` | brown | Entity accent + neutral surfaces family |
| `poppy` | red | **Danger only** — destructive actions, errors, conflicts |

`poppy` is reserved: it never identifies an entity, so red always means "problem".

### 5.2 Functional colors (state, not identity)

| Meaning | Token |
|---|---|
| Primary action / active / selected | `cambridge` (shade 6 light / 8 dark — already set as `primaryShade`) |
| Success / saved / valid | `tiffany.7` light / `tiffany.4` dark |
| Warning / incomplete / attention | `khaki.7` light / `khaki.3` dark |
| Error / conflict / destructive | `poppy.7` light / `poppy.3` dark |
| Dimmed / secondary text | Mantine `dimmed` only — never hand-picked grays |

### 5.3 Entity-coded colors (identity)

Each entity type has **one stable hue used everywhere it appears** — badge in a table, chip on a
planner card, icon tint in a form, filter pill. Users learn the mapping once and it holds app-wide.

| Entity | Palette | Icon (Tabler) |
|---|---|---|
| Subject | `cambridge` | `IconBook2` |
| Teacher | `khaki` | `IconUser` |
| Class (student group) | `tiffany` | `IconUsersGroup` |
| Classroom | `taupe` | `IconDoor` |
| Frame / Timeslot | neutral gray | `IconLayoutGrid` / `IconClock` |
| Specialty | `cambridge` (light variant, always with icon) | `IconCertificate` |

Rules:
- The mapping lives in **one module**: `app/ui/entityMeta.ts` — `{ key, colorKey, icon, i18nKey }`
  per entity. Components import it; nobody re-declares an entity color inline. Adding an entity
  type = one entry in this file.
- Color **never carries meaning alone** (AA requirement): every entity chip pairs color with its
  icon and/or label. In the planner, the lesson card shows a colored *subject* bar plus labeled
  chips — a color-blind user loses nothing.
- Entity colors are always used as **light variants** (tinted background, dark text via Mantine
  `variant="light"` + `autoContrast`), never as saturated fills, so screens stay calm.

### 5.4 Hard rules

- **No default-Mantine color names in feature code.** `color="blue"`, `red`, `teal`,
  `--mantine-color-gray-3` etc. are forbidden; use theme palettes and semantic tokens. (This is
  the current biggest source of drift — planner and admin components ignore the theme.)
- **No raw hex/rgba in components.** Colors come from `var(--mantine-color-*)` or theme props.
  One-off values live in `theme.ts` (`other:` or a palette) or a CSS Module using theme variables.
- Every color pair used for text must pass **4.5:1** (3:1 for large text / UI borders) in **both**
  light and dark schemes. When picking shades, check both before committing.

---

## 6. Dark / light / accessible modes

- Modes are implemented **only** through Mantine CSS variables + `light-dark()` /
  `[data-mantine-color-scheme]` selectors. If a component needs different values per scheme and
  can't get them from a variable, that's a smell — fix the token, not the component.
- The body-level background gradients in `app.css` stay subtle and must be re-derived from palette
  variables (currently hardcoded rgba) so they follow scheme changes.
- The current `ColorModeSwitcher` (4 subtle buttons) is replaced by a single icon toggle in the
  top bar (☀/☾/auto cycle or small menu).
- **Accessibility settings** (user menu → "Display & accessibility"), persisted alongside the
  color scheme (cookie/localStorage, later user profile):
  - **High contrast**: switches primary/entity shades to darker light-mode / lighter dark-mode
    steps and strengthens borders (target ≥ 7:1 for body text).
  - **Font scale**: 100% / 112.5% / 125%, implemented via `fontSizes` scaling on the root — which
    works because *everything is in `rem`* (keep it that way; `rem()` from Mantine, no `px` font sizes).
  - **Reduce motion**: forces the same behavior as `prefers-reduced-motion` (theme already sets
    `respectReducedMotion: true`; the toggle overrides for users who can't change OS settings).

### Baseline AA checklist (applies to every component, both schemes)

- Full keyboard operability; visible `:focus-visible` ring (2px `cambridge` outline, offset 2px) —
  defined once globally, never removed.
- All icon-only buttons have `aria-label` (translated, human: "Delete teacher Kovács", not
  "Delete teacher cmg81xd…").
- Hit targets ≥ 24×24px (AA 2.2); planner cards and table action icons included.
- Tooltips are supplements, never the only place information lives (planner `LessonCard` currently
  hides details in a tooltip for short lessons — an inspect-on-click popover/drawer must expose
  the same data).
- Semantics: one `h1` per page, real `<nav>`/`<main>`, tables are real tables, forms label every input.

---

## 7. Feedback: "what is the result of my action?"

Every mutation gives feedback through exactly one of these, chosen by weight:

| Situation | Pattern |
|---|---|
| Field-level validation error | Inline error under the input (Mantine form `error`), focus moves to first invalid field |
| Action succeeded, user stays on page | **Toast notification** (`@mantine/notifications`, add it) — short, verb-first: "Teacher added" |
| Action succeeded, user moves on | Redirect + toast on the destination page |
| Action failed (server/domain error) | `Alert` in place (form) or error toast (background action), with a human message and, when possible, the *reason and remedy* |
| Destructive action requested | **Confirmation modal, always** — names the object and states consequences/dependencies. No instant deletes (current admin tables delete on a single icon click — must change) |
| Long-running action | Button `loading` state + disabled form; optimistic UI only where rollback is trivial (planner remove already dims the card — good pattern, keep it) |
| Conflict detected (planner) | Inline, visual, at the location of the conflict: `poppy` outline + icon on the affected card(s) + a message listing *which entities* collide ("Kovács T. already teaches 9.B at 8:00") |

Rules:
- **Never silent.** Every `action` result reaches the user through one of the patterns above.
- Toasts auto-dismiss (4s), are announced via `aria-live=polite`, and never contain the only copy
  of important information (errors that need reading stay as inline `Alert`s).
- Loading: route transitions show a slim top progress bar (`nprogress`-style via Mantine);
  in-page fetchers show local skeletons/spinners — never a full-page blank.

---

## 8. Forms

- `@mantine/form` for state; server actions re-validate and return field-keyed errors that map
  back onto the form (single error contract shared across features:
  `{ ok: boolean; errors?: Record<string,string> }` — already emerging in the planner, standardize it).
- Field order mirrors the entity chip order (subject → class → teacher → room) so forms and
  read views tell the same story.
- Selects for entities render the entity chip style inside options (icon + color + name) — the
  form teaches the color language.
- Required vs optional marked consistently (Mantine `withAsterisk`); destructive submit buttons
  are `color="poppy"`; there is exactly one primary button per form.
- Multi-step flows (onboarding, schedule creation) use a visible `Stepper` — the user always
  knows step count and position.

---

## 9. Component architecture (scalable, loosely coupled)

### 9.1 Layers

```
app/ui/          ← NEW: design-system layer. Dumb, reusable, theme-aware.
                    entityMeta.ts, EntityChip, PageHeader, Breadcrumbs, EmptyState,
                    ConfirmModal, DataTable, StatCard, AppSidebar, TopBar …
app/components/  ← feature components (planner, admin forms). Compose app/ui pieces.
app/routes/      ← thin: loader/action + one page component wiring data → feature components.
```

- `app/ui/*` components know **nothing** about routes, sessions, i18n keys of features, or Prisma
  models. Props in, callbacks/`children` out. They may use `useTranslation` only for their own
  generic strings ("Cancel", "No results").
- Feature components receive **plain serializable props** (already true — `PlannerEntry` etc.);
  they never import from `app/lib/repositories` for types — shared view-model types move to
  `app/lib/types/` (or per-domain `types.ts`) so the UI doesn't depend on `.server.ts` modules.
- Route files stay thin. If a route component exceeds ~100 lines of JSX, extract a feature component.

### 9.2 Styling implementation rules

- **Tailwind is removed** (dependency, `@import`, `@theme` block, class names). One styling system.
- Preference order: 1) Mantine component + props, 2) theme `components.*` defaults for app-wide
  looks, 3) **CSS Module** next to the component for custom layout (planner grid), using only
  `var(--mantine-*)` tokens, 4) inline `style` only for truly dynamic values (computed `top`/`height`
  of a lesson card).
- Shared magic numbers (planner `PX_PER_MIN`, day range, sidebar width) live in a constants module
  or `theme.other`, imported — never re-declared.

### 9.3 i18n

- Every user-visible string uses `t()` — including nav labels, table headers, aria-labels, empty
  states, toasts, confirm dialogs. Current mixed hardcoded English (nav links, admin tabs,
  "No records found yet.", DAY_LABELS) must be migrated.
- Keys are namespaced by feature (`planner.addLesson`, `entities.teacher.one`), entity names use
  plural-aware keys. Dates/times formatted via `Intl` with the active locale.

---

## 10. The planner — flagship rules

The weekly planner is the app's core and hardest screen; it gets its own standards:

- Full-width canvas page (§4); sticky day header **and** sticky hour axis while scrolling.
- Lesson cards: subject-colored left bar (4px) + subject name; class/teacher/room as compact
  entity chips as height allows; **click opens a detail popover/drawer** with full info and
  actions (edit, remove) — hover tooltip becomes an enhancement, not the API.
- Click-to-add on an empty slot stays (good pattern); the drawer must show the *selected day +
  time* prominently and validate conflicts before submit, reporting them in entity terms.
- Conflicts render in place with `poppy` treatment (§7) — a schedule with conflicts is visibly
  "not done".
- Current hardcoded `blue-*` styling and `gray-3` borders migrate to theme tokens (they break in
  dark mode today).
- Target keyboard support (phase 2+): arrow keys move a slot cursor, `Enter` opens the add drawer.

---

## 11. Anti-patterns (never do)

- Bare `<button>`/`<a>` without Mantine styling (logout button today).
- Delete without confirmation.
- Showing database IDs, migration phase names, or debug fields to users.
- `color="blue"` (or any default palette name) in feature code.
- Information only in a tooltip or only in color.
- Two page titles / duplicated headers on one screen.
- Hardcoded English strings.
- New spacing/radius/shadow values outside the theme scale.
- UI components importing `.server.ts` modules or Prisma types.

---

## 12. Refactor roadmap (suggested order)

1. **Foundation** — remove Tailwind; add `@mantine/notifications`; create `app/ui/` with
   `entityMeta.ts`, `EntityChip`, `PageHeader`, `Breadcrumbs`, `EmptyState`, `ConfirmModal`;
   global focus ring; migrate remaining strings to i18n.
2. **Shell** — `AppShell` sidebar + top bar (tenancy switcher, locale, scheme toggle, user menu);
   collapse `tenancy-layout`/`my-tenancy-layout` duplication; kill debug output; breadcrumbs.
3. **Screens** — dashboard becomes a real overview (entity counts as colored `StatCard`s linking
   into sections, "next steps" empty-state guidance); admin tabs → Resources pages with confirm
   modals and toasts; timeslots & syllabus aligned to the same table/form patterns.
4. **Planner** — token migration, entity chips, detail popover, sticky axes, conflict styling.
5. **Accessibility settings** — high contrast, font scale, reduced motion toggles; AA audit pass
   (keyboard walk-through of every flow, contrast check of every pair in both schemes).

Each step is shippable on its own; none blocks feature work beyond the files it touches.
