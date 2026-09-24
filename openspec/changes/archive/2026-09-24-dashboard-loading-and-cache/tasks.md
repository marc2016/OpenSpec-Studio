# Tasks

## 1. Backend Performance & Caching

- [x] 1.1 Implement in-memory mtime cache for spec capabilities in `src/core/WorkspaceDetector.ts` and verify unit tests pass with `npm run test`.
- [x] 1.2 Implement CLI resolution cache in `src/core/CliAdapter.ts` and verify tests pass with `npm run test`.
- [x] 1.3 Parallelize state retrieval using `Promise.all` in `src/core/StudioDashboardPanel.ts` and verify compilation with `npm run compile`.

## 2. Skeleton Loading UI Components

- [x] 2.1 Create reusable `SkeletonCard` component in `src/webview/components/ui/SkeletonCard.tsx` with animated pulse placeholders.
- [x] 2.2 Integrate skeleton loading state into `src/webview/components/SpecsExplorer.tsx` when `loading === true`.
- [x] 2.3 Integrate skeleton loading state into `src/webview/components/ActiveChangesGrid.tsx` and `src/webview/components/ArchivedHistory.tsx` when `loading === true`.

## 3. Webview Integration & Header Refresh

- [x] 3.1 Update `src/webview/App.tsx` to display animated loading indicators in tab badges during loading instead of zero.
- [x] 3.2 Wire header refresh button to set `loading: true` and request state with visual spinner feedback in `src/webview/components/Header.tsx` and `src/webview/hooks/useVscodeApi.ts`.

## 4. Verification & Validation

- [x] 4.1 Run `npm run test` and `npm run build` to verify all unit tests and webview builds succeed.
- [x] 4.2 Validate change artifacts with `openspec validate dashboard-loading-and-cache --strict`.
