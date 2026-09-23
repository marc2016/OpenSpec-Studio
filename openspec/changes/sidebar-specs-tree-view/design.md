# Design: Sidebar Specs Tree View & File Navigator

## Context

See [proposal.md](proposal.md) for motivation. OpenSpec Studio currently provides an editor-tab Webview dashboard (`StudioDashboardPanel`) and an activity bar container with a minimal Webview view. `WorkspaceDetector` already monitors the file system and extracts structured data for changes, tasks, specs, and archives.

## Goals / Non-Goals

**Goals:**
- Provide a native, responsive `vscode.TreeDataProvider` (`SpecsTreeDataProvider`) registered in the `openspec-studio` Activity Bar view container.
- Display a categorized tree structure:
  - **Durable Specifications**: Capabilties and their `spec.md` files.
  - **Active Changes**: Changes in progress, task completion metrics, and individual planning artifacts (`proposal.md`, `design.md`, `tasks.md`, delta specs).
  - **Archived History**: Historical archived change milestones.
- Ensure clicking any file node immediately opens the file in VS Code (`vscode.open`).
- Provide rich visual iconography using VS Code `ThemeIcon` and badges.
- Automatically refresh tree items when `WorkspaceDetector` detects changes in `./openspec/`.

**Non-Goals:**
- Inline editing of markdown files inside the tree view (standard VS Code editor handles editing).
- Replacing the full editor-tab Studio Dashboard (the tree view complements the dashboard for fast navigation).

## Decisions

### Decision 1: Native VS Code TreeDataProvider over Webview
- **Decision**: Implement `SpecsTreeDataProvider` as a native `vscode.TreeDataProvider<SpecsTreeItem>` rather than embedding a React tree in a WebviewView.
- **Rationale**: Native VS Code tree views are lightweight, support native key navigation (arrow keys, search-to-filter), integrate with VS Code's theme icon font system, and launch files directly via `vscode.open` without IPC overhead.
- **Alternatives Considered**: React tree inside `sidebarView` WebviewView. Rejected due to slower load times, styling divergence from native VS Code sidebars, and extra IPC messaging layers.

### Decision 2: Tree Item Architecture & Hierarchy
- **Decision**: Create a discriminated union of `SpecsTreeItem` types:
  - `CategoryItem`: Root nodes (`Specifications`, `Active Changes`, `Archived History`).
  - `ChangeItem`: Represents a change directory, showing task progress (e.g., `(3/5 tasks)`) as description, status badge, and expandable children.
  - `FileItem`: Represents an individual file (`proposal.md`, `spec.md`, `design.md`, `tasks.md`), with `command: { command: 'vscode.open', arguments: [vscode.Uri.file(path)] }`.
  - `CapabilityItem`: Represents a durable capability in `openspec/specs/`.
- **Rationale**: Keeps the tree strongly typed, simple to test, and enables distinct icons and context menus per item type.

### Decision 3: Reactive State Binding
- **Decision**: Connect `SpecsTreeDataProvider` directly to `WorkspaceDetector.onDidChangeState`.
- **Rationale**: When tasks are checked off in `tasks.md` or a new spec is added, `WorkspaceDetector` fires `onDidChangeState`, prompting `SpecsTreeDataProvider` to fire its `_onDidChangeTreeData` event. The tree updates automatically with zero polling.

## Risks / Trade-offs

- **[Risk] Deep nesting in large spec hierarchies**: If a project has dozens of specs and changes, deeply nested trees can cause visual clutter.
  - *Mitigation*: Group items into high-level categories (`Specifications`, `Active Changes`, `Archived History`) with collapsed defaults for archives and clean icons.
- **[Risk] File existence checks during rapid writes**: Quick file creation/deletion could trigger tree refreshes during partial file writes.
  - *Mitigation*: Debounce tree data reloads or gracefully handle non-existent files during reads with `fs.existsSync` safety guards.
