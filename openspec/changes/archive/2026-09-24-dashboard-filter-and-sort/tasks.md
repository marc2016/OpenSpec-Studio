# Tasks

## 1. Data Model & Extension Host Updates

- [x] 1.1 Add `lastModified?: number` to `OpenSpecChange` in `src/shared/types.ts` and verify types compile with `npm run compile`.
- [x] 1.2 Update `WorkspaceDetector.getActiveChanges()` in `src/core/WorkspaceDetector.ts` to populate `lastModified` using `fs.statSync(changePath).mtimeMs` and verify unit tests pass with `npm run test`.

## 2. Preference Persistence & Reusable Toolbar

- [x] 2.1 Create `useLocalStorageState` hook in `src/webview/hooks/useLocalStorageState.ts` with error handling and verify default value behavior.
- [x] 2.2 Create reusable `FilterSortToolbar` in `src/webview/components/ui/FilterSortToolbar.tsx` with search input, filter select, sort select, and count badge.

## 3. Active Changes Filtering & Sorting

- [x] 3.1 Integrate filtering and sorting into `src/webview/components/ActiveChangesGrid.tsx` supporting "Completed first" (100% completion priority), "Least completed first", "Recently modified", "Oldest modified", and "Name (A-Z / Z-A)".
- [x] 3.2 Add status filtering (`All`, `Completed`, `In Progress`, `Ready`, `Draft`) and a "Hide completed" quick toggle to `ActiveChangesGrid.tsx`.
- [x] 3.3 Add filtered empty-state display with "Clear filters" button when no changes match the current filter criteria.

## 4. Durable Specs & Archived History Controls

- [x] 4.1 Add text search and sorting (Name A-Z/Z-A, requirements count) with preference persistence to `src/webview/components/SpecsExplorer.tsx`.
- [x] 4.2 Add text search and date/name sorting with preference persistence to `src/webview/components/ArchivedHistory.tsx`.

## 5. Verification & End-to-End Validation

- [x] 5.1 Run `npm run test` and `npm run build:webview` to verify test suite and webview compilation succeed without errors.
- [x] 5.2 Validate change artifacts with `openspec validate dashboard-filter-and-sort --strict`.
