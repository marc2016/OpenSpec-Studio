# Design

## Context

The OpenSpec Studio dashboard is hosted within a VS Code Webview (`StudioDashboardPanel`) rendering a React 18 SPA. Currently, the dashboard displays active changes (`ActiveChangesGrid`), durable specs (`SpecsExplorer`), and archived history (`ArchivedHistory`) in static lists without filtering or user-controlled sorting.

See `proposal.md` for motivation and `specs/studio-dashboard/spec.md` for functional requirements.

## Goals / Non-Goals

**Goals:**
- Provide intuitive, responsive filtering (text search, status dropdown, toggle switches) and sorting options across all dashboard tabs.
- Place changes with completed tasks at the top when sorting by task progress ("Completed first").
- Provide date-based sorting ("Recently modified" and "Oldest modified") by capturing filesystem modification timestamps.
- Persist user preference choices across dashboard tab reloads and VS Code restarts.
- Ensure consistent aesthetics adhering to VS Code design tokens and existing UI components (`Card`, `Badge`, `Button`).

**Non-Goals:**
- Full-text search inside markdown body content of proposals or specs (search targets headers, titles, names, and purpose).
- Modifying underlying OpenSpec CLI commands or on-disk formats.

## Decisions

### 1. Client-Side Filtering & Sorting in React Components
- **Choice:** Filter and sort lists directly in React component state using derived `useMemo` computations.
- **Rationale:** The number of active changes, specs, and archives in a workspace is typically between 5 and 100 items. Client-side evaluation provides sub-millisecond instant feedback while typing in the search box without IPC lag or re-reading the filesystem.
- **Alternatives considered:** Sending search queries to the extension host via `postMessage`. Rejected due to added latency, debouncing complexity, and unnecessary message traffic.

### 2. Filesystem Timestamp Tracking in WorkspaceDetector
- **Choice:** Extend `OpenSpecChange` in `src/shared/types.ts` with `lastModified?: number` (epoch timestamp in milliseconds) populated in `WorkspaceDetector.getActiveChanges()` using `fs.statSync(changePath).mtimeMs` (or `tasks.md` timestamp).
- **Rationale:** Enables precise chronological sorting of active changes.

### 3. Preferences Persistence via LocalStorage Hook
- **Choice:** Create a lightweight `useLocalStorageState<T>(key: string, defaultValue: T)` hook in `src/webview/hooks/`.
- **Rationale:** VS Code webviews support standard HTML5 `localStorage` partitioned per extension webview origin. It avoids boilerplate message passing to `vscode.workspace.getConfiguration` for purely ephemeral UI view states while guaranteeing persistence across panel toggles.

### 4. Shared Filter Toolbar Component
- **Choice:** Extract a reusable `FilterSortToolbar` component for search input, dropdowns, and count badges.
- **Rationale:** Eliminates duplicate styling and interaction patterns across Active Changes, Specs, and Archived tabs.

## Risks / Trade-offs

- *[Risk]* Empty filter results might look like a data loading error.
  → *Mitigation*: Render an explicit "No matching changes found" empty state with a "Clear search / Reset filters" button.
- *[Risk]* Corrupt or outdated localStorage values.
  → *Mitigation*: Fallback gracefully to default values if JSON parsing fails or value is unrecognized.
