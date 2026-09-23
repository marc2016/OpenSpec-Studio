# Proposal: Sidebar Specs Tree View & File Navigator

## Why

While OpenSpec Studio provides a rich dashboard within an editor tab, developers constantly need quick, side-by-side visibility into their specifications, active change files, and requirements directly in VS Code's sidebar without switching editor tabs. A dedicated tree view in the sidebar allows developers to browse specs, jump straight into `spec.md`, `proposal.md`, `tasks.md`, or `design.md` with a single click, and navigate requirements while editing source code.

## What Changes

- Add a native VS Code TreeView (`TreeDataProvider`) in the `OpenSpec Studio` Activity Bar view container (`openspec-studio.specsTree`).
- Render a hierarchical tree showing:
  - **Specifications (`specs/`)**: Lists all durable specs and their capability folders, showing `spec.md` and detailed requirements/scenarios with dedicated icons.
  - **Active Changes (`changes/`)**: Lists in-flight changes with their planning artifacts (`proposal.md`, delta specs, `design.md`, `tasks.md`), task progress indicators, and status badges.
  - **Archived Changes (`changes/archive/`)**: Lists completed and archived changes for historical reference.
- Add click-to-open functionality: clicking any spec, file, or artifact item immediately opens the file in the editor (via `vscode.open`).
- Add rich icons using VS Code ThemeIcons / Codicons (e.g. `$(book)`, `$(git-pull-request)`, `$(checklist)`, `$(file-text)`, `$(history)`, `$(folder)`).
- Add inline toolbar actions on the tree view: Refresh (`$(refresh)`), Open Studio Dashboard (`$(dashboard)`), and Collapse All.
- Wire the tree view to `WorkspaceDetector` so that file additions, edits, or deletions in `openspec/**` reactively update the tree in real time.

## Capabilities

### New Capabilities
- `sidebar-specs-tree`: Native VS Code tree view and file navigator in the sidebar displaying durable specs, active changes, and artifacts with click-to-open navigation and reactive updates.

### Modified Capabilities
<!-- None: This capability extends the OpenSpec Studio UI with a native sidebar explorer. -->

## Impact
- Extends `package.json` with tree view contribution (`openspec-studio.specsTree`) and navigation commands.
- Implements `SpecsTreeDataProvider` in `src/core/` implementing `vscode.TreeDataProvider`.
- No breaking changes to existing dashboard, CLI adapter, or workspace detector.
