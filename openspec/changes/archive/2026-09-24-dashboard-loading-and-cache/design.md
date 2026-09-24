# Design

## Context

The OpenSpec Studio dashboard loads all workspace state asynchronously from the VS Code extension host. Previously, data collection in `StudioDashboardPanel.broadcastState` ran sequentially, repeatedly spawned child processes to resolve CLI versions, and re-read/re-parsed every `spec.md` synchronously without caching. Simultaneously, the React webview rendered "No items found" empty states while waiting for initial state data.

See `proposal.md` for motivation and `specs/studio-dashboard-performance/spec.md` for functional requirements.

## Goals / Non-Goals

**Goals:**
- Provide smooth, professional skeleton loading cards (`animate-pulse`) in `ActiveChangesGrid`, `SpecsExplorer`, and `ArchivedHistory` when `loading === true`.
- Display loading indicators (`···`) in tab badges while data is loading.
- Implement an in-memory mtime cache in `WorkspaceDetector` for fast specification retrieval (< 5ms).
- Parallelize state collection via `Promise.all` in `StudioDashboardPanel.broadcastState()`.
- Cache CLI resolution in `CliAdapter` to avoid process spawning overhead on every event.
- Connect header refresh to trigger instant loading animation.

**Non-Goals:**
- Persisting parsed spec caches to disk across VS Code restarts (in-memory cache per extension session is fast and auto-cleared on restart).

## Decisions

### 1. Reusable Skeleton Card Component
- **Choice:** Create `src/webview/components/ui/SkeletonCard.tsx` with customizable rows and badges.
- **Rationale:** Using Tailwind's `animate-pulse` with native VS Code tokens (`bg-vscode-card/40`, `bg-vscode-border/50`) delivers an authentic, premium native feel.

### 2. Mtime-based Specification Invalidation
- **Choice:** Maintain `private specsCache = new Map<string, { mtimeMs: number; capability: OpenSpecCapability }>()` in `WorkspaceDetector`.
- **Rationale:** Checking `fs.statSync(specFile).mtimeMs` is orders of magnitude faster than `fs.readFileSync` plus multi-line regex scanning. Unchanged specs are returned immediately from RAM.

### 3. Concurrent State Gathering
- **Choice:** Replace sequential `await` calls in `StudioDashboardPanel.broadcastState()` with `Promise.all([cliPromise, changesPromise, specsPromise, archivedPromise])`.
- **Rationale:** Eliminates waterfall latency on every state broadcast.

### 4. CLI Resolution In-Memory Cache
- **Choice:** Cache `CliInfo` within `CliAdapter` per `workspaceRoot` and invalidate when `setMode()` is called.
- **Rationale:** Node.js `exec` calls take 150-250ms per run; caching eliminates this recurring overhead.

## Risks / Trade-offs

- *[Risk]* Spec file edited externally while VS Code runs.
  → *Mitigation*: The file watcher triggers `onDidChangeState`, and `mtimeMs` check detects the change immediately and refreshes the cache.
