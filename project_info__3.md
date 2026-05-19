# Trackify — Logo vs Initials on Dashboard (Recent Activity & Upcoming Deadlines) — Explore Findings

## Summary

The current Dashboard UI shows **company initials** (not logos) in two places:

- **Recent Activity** renders `item.initials` inside the avatar square.
- **Upcoming Deadlines** renders `item.companyInitial` inside the avatar square.

Backend `GET /api/jobs/upcoming-deadlines` does **not** return any logo URL (the DTO `UpcomingDeadlineItemResponse` contains only `id`, `companyName`, `position`, `deadline`). Meanwhile, the kanban cards that power Recent Activity already support `companyLogoUrl`, but the Dashboard mapping never forwards that field into `ActivityItem`, so the logo cannot be rendered.

## Architecture

### Frontend (fe/)

- **Next.js App Router** with server components for page data fetching (`fe/src/app/dashboard/page.tsx`).
- Dashboard widgets are mostly presentational React components in `fe/src/features/dashboard/components/*`.
- The “Dashboard items” types (`ActivityItem`, `DeadlineItem`) live in `fe/src/features/dashboard/mock/mockData.ts` and are used as prop types by components; the real API responses are mapped into these shapes inside `app/dashboard/page.tsx`.

### Backend (be/)

- **Spring Boot** REST API.
- `JobController` exposes `GET /upcoming-deadlines`.
- `UpcomingDeadlineItemResponse` is a DTO with no logo field, so the frontend cannot display a logo unless it:
  1. derives it client-side, or
  2. changes the backend contract to include a logo URL.

## Directory Structure (relevant)

```text
fe/src/app/dashboard/
  page.tsx                 # fetches dashboard stats, upcoming deadlines, kanban
  loading.tsx              # skeleton UI

fe/src/features/dashboard/components/
  RecentActivity.tsx      # avatar currently shows initials
  UpcomingDeadlines.tsx  # avatar currently shows companyInitial

fe/src/features/dashboard/mock/
  mockData.ts              # defines ActivityItem / DeadlineItem shapes

fe/src/features/kanban/types/
  kanban.ts                # JobKanbanCard includes companyLogoUrl?

fe/src/features/kanban/utils/
  clearbit.ts              # buildClearbitLogoUrl() helper

be/trackify/.../controller/
  JobController.java

be/trackify/.../dto/response/
  UpcomingDeadlineItemResponse.java   # no logo field
```

## Key Abstractions

### `ActivityItem` (dashboard prop type)

- **File**: `fe/src/features/dashboard/mock/mockData.ts`
- **Responsibility**: Defines the shape used by `RecentActivity` component.
- **Current fields**: `initials`, `name`, `company`, `statusText`, `whenText`, `tint`
- **Meaning**: Since there is no logo URL field, `RecentActivity.tsx` can only render initials.

### `DeadlineItem` (dashboard prop type)

- **File**: `fe/src/features/dashboard/mock/mockData.ts`
- **Responsibility**: Defines the shape used by `UpcomingDeadlines` component.
- **Current fields**: `companyInitial`, `title`, `subtitle`, `whenText`, `urgencyTint`
- **Meaning**: Since there is no logo URL field, `UpcomingDeadlines.tsx` can only render initials.

### `RecentActivity` component

- **File**: `fe/src/features/dashboard/components/RecentActivity.tsx`
- **Responsibility**: Renders a list of activity rows.
- **Key behavior**: Avatar square uses `{item.initials}`.
- **Implication**: To show logos, this component must render an `<img>` from a new prop field (e.g., `companyLogoUrl`) with fallback.

### `UpcomingDeadlines` component

- **File**: `fe/src/features/dashboard/components/UpcomingDeadlines.tsx`
- **Responsibility**: Renders a horizontal list of upcoming deadline cards.
- **Key behavior**: Avatar uses `{item.companyInitial}`.
- **Implication**: To show logos, this component must switch from text to `<img>` (from a new prop field like `companyLogoUrl`).

### Clearbit logo helper (already exists)

- **File**: `fe/src/features/kanban/utils/clearbit.ts`
- **Responsibility**: Builds a logo URL from either:
  - `companyLogoUrl` if provided, or
  - domain derived from `jdUrl` or `companyName`
- **Key function**: `buildClearbitLogoUrl({ companyLogoUrl?, jdUrl?, companyName })`
- **Why it matters**: Because the upcoming-deadlines backend response has no logo URL, this helper is the most likely intended way to “derive” logos client-side.

### `UpcomingDeadlineItemResponse` (backend DTO)

- **File\*\***: `be/trackify/src/main/java/.../dto/response/UpcomingDeadlineItemResponse.java`
- **Responsibility**: Defines JSON contract for `GET /upcoming-deadlines`.
- **Current fields**: `id`, `companyName`, `position`, `deadline`
- **Implication**: No logo data is available unless the contract is changed.

## Data Flow (dashboard)

1. User visits `/dashboard`.
2. `fe/src/app/dashboard/page.tsx` runs (server component):
   - Fetches `/api/jobs/kanban` (contains kanban cards).
   - Fetches `/api/jobs/upcoming-deadlines` (does not contain logo).
3. `dashboard/page.tsx` maps API results into:
   - `ActivityItem[]` for `RecentActivity`
   - `DeadlineItem[]` for `UpcomingDeadlines`
4. Components render avatars from initials (`item.initials` / `item.companyInitial`).

## Non-Obvious Behaviors & Design Decisions

- **Dashboard “data models” are not the API contracts.**  
  The UI prop types (`ActivityItem`, `DeadlineItem`) are defined in `mockData.ts`, and `dashboard/page.tsx` manually maps API responses into them. That means adding logo support requires changing _both_ the prop types and the mapping logic, not only the component.
- **Upcoming Deadlines cannot directly use existing “kanban card logo URLs”.**  
  The backend endpoint `upcoming-deadlines` returns a simplified DTO without `companyLogoUrl`, so the dashboard must derive logos itself (Clearbit helper) or the backend must be extended.
- **Kanban cards already support `companyLogoUrl`.**  
  `JobKanbanCard` includes optional `companyLogoUrl?`, and other dashboard widgets (e.g., `AiSpotlight`) already render `companyLogoUrl`—so the system is designed to show logos, but the Dashboard mapping for these two sections is currently incomplete.

## Suggested Change Plan (to achieve “logo instead of initials”)

> Explore Mode note: I can’t implement, but this is the exact minimal path required to satisfy the request.

### A) Recent Activity

1. Update `ActivityItem` type to include `companyLogoUrl?: string` (or `companyLogoUrl: string | null`).
2. In `fe/src/app/dashboard/page.tsx`, when building `recentItems`:
   - pull `card.companyLogoUrl` into the new field
   - fallback: derive via `buildClearbitLogoUrl({ companyName: card.companyName, jdUrl: card.jdUrl, companyLogoUrl: card.companyLogoUrl })`
3. In `RecentActivity.tsx`, replace the `{item.initials}` text with:
   - `<img src={item.companyLogoUrl} ...>` when available
   - fallback to initials only if logo is missing.

### B) Upcoming Deadlines

1. Update `DeadlineItem` type to include `companyLogoUrl?: string`.
2. In `fe/src/app/dashboard/page.tsx`, when building `upcomingDeadlineItems`:
   - derive `companyLogoUrl` from `item.companyName` using `buildClearbitLogoUrl({ companyName: item.companyName })`
   - (optionally) use `companyName` + a known job description URL if available—however upcoming-deadlines currently doesn’t include `jdUrl`, so only `companyName` derivation is possible from the current DTO.
3. In `UpcomingDeadlines.tsx`, replace `{item.companyInitial}` with `<img>` rendering and fallback.

## Developer “Gotchas” to Watch

- Clearbit logo URLs might fail (404/blocked). Always provide a fallback UI (initials or placeholder).
- The Clearbit helper expects a `companyName` always; domain derivation may be less accurate if `companyName` is ambiguous. Keep initials fallback for reliability.
- Updating prop types (`ActivityItem`, `DeadlineItem`) will require updating every producer in `dashboard/page.tsx`.

## Suggested Reading Order

1. `fe/src/app/dashboard/page.tsx` — how the Dashboard fetches and maps API data into widget props.
2. `fe/src/features/dashboard/components/RecentActivity.tsx` — replace initials avatar with logo rendering.
3. `fe/src/features/dashboard/components/UpcomingDeadlines.tsx` — replace initials avatar with logo rendering.
4. `fe/src/features/dashboard/mock/mockData.ts` — extend `ActivityItem` / `DeadlineItem` shapes.
5. `fe/src/features/kanban/utils/clearbit.ts` — how to derive logo URLs when backend doesn’t provide them.
6. `be/trackify/.../dto/response/UpcomingDeadlineItemResponse.java` — confirms backend contract lacks logo fields.
