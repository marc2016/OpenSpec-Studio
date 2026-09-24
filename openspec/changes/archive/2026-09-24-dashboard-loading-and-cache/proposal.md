# Proposal

## Why

When opening the OpenSpec Studio dashboard or working with workspaces that contain many specifications, the initial load is slow because the extension host sequentially executes child processes and repeatedly re-reads and regex-parses all `spec.md` files from disk. Concurrently, the webview immediately renders empty state cards ("No Specs Found", "0 Specs") before data arrives, misleading users into believing their specifications are missing or unconfigured.

## What Changes

- **Pulsing Skeleton Cards**: Render modern, pulsing skeleton placeholders in `SpecsExplorer`, `ActiveChangesGrid`, and `ArchivedHistory` while data is loading (`loading === true`), replacing the deceptive "No items found" states.
- **Loading Tab Badges & Visual Indicator**: Display pulsating dots (`···`) instead of `0` in tab badges during loading.
- **Interactive Refresh Feedback**: Trigger immediate loading states and animate the refresh button when manually refreshing from the dashboard header.
- **In-Memory Mtime Spec Caching**: Cache parsed `OpenSpecCapability` structures in memory within `WorkspaceDetector`, invalidating entries only when file `mtimeMs` changes on disk.
- **Parallel Data Fetching**: Run CLI resolution, active changes detection, specs reading, and archived history concurrently using `Promise.all` in `StudioDashboardPanel.broadcastState()`.
- **CLI Resolution Caching**: Cache `CliAdapter.resolveCli()` results to prevent repeated child process execution on every event.

## Capabilities

### New Capabilities
- `studio-dashboard-performance`: High-performance spec caching, concurrent state gathering, and skeleton placeholder states for smooth dashboard loading.

### Modified Capabilities

## Impact

- `src/core/WorkspaceDetector.ts`: Add in-memory mtime cache for spec capabilities.
- `src/core/StudioDashboardPanel.ts`: Run state loading via `Promise.all`.
- `src/core/CliAdapter.ts`: Cache resolved CLI info.
- `src/webview/App.tsx`: Manage loading state across tabs and badges.
- `src/webview/components/ui/SkeletonCard.tsx`: New reusable skeleton card component.
- `src/webview/components/SpecsExplorer.tsx`, `ActiveChangesGrid.tsx`, `ArchivedHistory.tsx`: Integrate skeleton loading states.
