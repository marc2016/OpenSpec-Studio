# Design

## Context

The OpenSpec Studio sidebar tree (`SpecsTreeDataProvider`) lists durable capabilities and their sub-requirements. Currently, clicking a requirement tree item simply invokes `vscode.open` with the file URI without any range or selection parameter, leaving the user at the top or previous cursor position of `spec.md`.

## Goals / Non-Goals

**Goals:**
- Extend `SpecRequirement` in `WorkspaceDetector.ts` to include `startLine` and `endLine` (0-indexed).
- Accurately calculate line boundaries for requirements during `parseSpecFile` in `WorkspaceDetector.ts`.
- Register an explicit command `openspec-studio.openFileRange` in `src/extension.ts` (and expose it in `package.json`).
- Configure `SpecsTreeItem` for requirement items to execute `openspec-studio.openFileRange` with file URI and line boundaries.
- Ensure the editor selects the entire section and centers it in the view.

**Non-Goals:**
- Editing or modifying markdown text inline inside the TreeView.
- Parsing line ranges for non-spec files (e.g. `tasks.md` or `proposal.md` are opened at file level).

## Decisions

### 1. Dedicated Command `openspec-studio.openFileRange` vs. Standard `vscode.open` Options
- **Decision**: Register a dedicated VS Code command `openspec-studio.openFileRange(uri, startLine, endLine)`.
- **Rationale**: While `vscode.open` accepts `TextDocumentShowOptions`, standard options sometimes only move the cursor or highlight weakly depending on active editor settings. A dedicated command opens the document via `vscode.window.showTextDocument`, explicitly assigns `editor.selection = new vscode.Selection(...)`, and calls `editor.revealRange(..., vscode.TextEditorRevealType.InCenter)`. This guarantees crisp, deterministic selection across all themes and setups.
- **Alternatives Considered**: Direct `vscode.open` with `{ selection: Range }`. Rejected because `revealRange` behavior and multi-line selection focus can vary across VS Code versions when passed as raw command arguments in `TreeItem.command`.

### 2. Line Range Calculation in `parseSpecFile`
- **Decision**: In `WorkspaceDetector.ts`, store `startLine` when `### Requirement:` is matched. As the loop progresses, when reaching the next `### Requirement:` or EOF or `## ` section, compute `endLine` as the last line before the new header (trimmed of excessive trailing empty lines).
- **Rationale**: Line positions are readily available in `lines[i]` during the existing linear pass in `parseSpecFile`, requiring zero extra file reads and minimal overhead.

## Risks / Trade-offs

- **[Risk] Markdown file edited externally while tree view is open** → Mitigation: `WorkspaceDetector` has a live file watcher that triggers `treeProvider.refresh()`, automatically re-parsing line numbers on file modifications.
