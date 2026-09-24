# Proposal

## Why

As users manage multiple OpenSpec changes and durable specifications, the Studio Dashboard becomes cluttered without the ability to filter or sort items. Users need a quick way to locate specific changes, prioritize completed changes ready for archiving (e.g. 100% completed tasks at the top), inspect uncompleted tasks in progress, or organize items by recency and name across all dashboard views.

## What Changes

- Add filter and sort controls to the **Active Changes** view:
  - Sort by task completion progress: Completed first (100% → 0%), least completed first (0% → 100%).
  - Sort by modification date: Recently modified first, oldest modified first.
  - Sort alphabetically by change name (A → Z, Z → A).
  - Text search filter matching change names.
  - Status filter dropdown (`All`, `Completed`, `In Progress`, `Ready`, `Draft`).
  - Quick toggle to hide completed changes.
- Add search and sort controls to the **Durable Specs** view:
  - Text search filter matching spec name and purpose.
  - Sort by name (A → Z, Z → A) and requirements count.
- Add search and sort controls to the **Archived History** view:
  - Text search filter matching change name.
  - Sort by archived date (newest first, oldest first) and name (A → Z).
- Persist user sorting and filter preferences across sessions and tab reloads via webview storage.
- Enhance `WorkspaceDetector` and `OpenSpecChange` model to track file modification timestamps (`lastModified`).

## Capabilities

### New Capabilities
- `studio-dashboard`: Interactive filtering, sorting, and user preference persistence for Active Changes, Durable Specs, and Archived History.

### Modified Capabilities

## Impact

- `src/shared/types.ts`: Extend `OpenSpecChange` with `lastModified?: number`.
- `src/core/WorkspaceDetector.ts`: Extract filesystem `mtimeMs` for active changes.
- `src/webview/components/ActiveChangesGrid.tsx`: Implement filtering and sorting controls and logic.
- `src/webview/components/SpecsExplorer.tsx`: Implement search and sorting controls and logic.
- `src/webview/components/ArchivedHistory.tsx`: Implement search and sorting controls and logic.
- `src/webview/`: Add persistent preference management hook / helper.
