# Design: Editor Navigation and Related Files Switcher

## Context

See `proposal.md` for motivation. Currently, the `OpenSpecEditorProvider` hosts a custom webview editor (`MarkdownEditorApp.tsx`) for `**/openspec/**/*.md` documents. While editing, users only see the file name, sync status, and an action to reopen the file in the default VS Code text editor. There is no link back to the main Studio Dashboard (`openspec-studio.openDashboard`), and users cannot switch between related change artifacts (`proposal.md`, `specs/`, `design.md`, `tasks.md`) without using the general VS Code explorer.

## Goals / Non-Goals

**Goals:**
- Provide a dedicated, prominent Dashboard button in the custom editor top bar that triggers `openspec-studio.openDashboard`.
- Detect when an open document resides in an OpenSpec change directory (`openspec/changes/<change-name>/...`).
- Inspect the change directory to list all existing sibling change artifacts (`proposal.md`, `design.md`, `tasks.md`, and any delta specs).
- Provide a responsive file-switcher component in the top bar to quickly toggle between sibling artifacts.
- Support opening selected artifacts directly in the custom editor via `vscode.openWith`.
- Ensure all new UI labels, titles, and tooltips are localized in English and German via the existing i18n system.

**Non-Goals:**
- Creating new missing artifacts directly from the editor (artifact generation remains part of OpenSpec CLI / Studio workflows).
- Embedding multiple document editors in split panes inside a single webview tab.

## Decisions

### Decision 1: Sibling Artifact Discovery in Extension Host
- **Choice**: Perform filesystem resolution and artifact discovery in `OpenSpecEditorProvider.ts` upon resolving or initializing the custom editor, and pass `relatedFiles` via `INIT_EDITOR` to the webview.
- **Rationale**: The extension host has direct, efficient access to `fs` and `vscode.workspace`, without requiring webview-side filesystem probing or permission complications.
- **Alternatives considered**:
  - Webview sends a separate request message `GET_RELATED_FILES`. While possible, doing this directly during editor initialization minimizes round-trips and layout jitter.

### Decision 2: Message Passing Protocol for Navigation Actions
- **Choice**:
  - `OPEN_DASHBOARD`: Triggers `vscode.commands.executeCommand('openspec-studio.openDashboard')`.
  - `OPEN_FILE`: Receives `{ filePath: string }` and triggers `vscode.commands.executeCommand('vscode.openWith', vscode.Uri.file(filePath), OpenSpecEditorProvider.viewType)`.
- **Rationale**: Reuses native VS Code commands and guarantees that if the target file is already open in another tab or editor group, VS Code focuses or reveals it cleanly.

### Decision 3: Top Navigation Bar Layout
- **Choice**:
  - Place the "Dashboard" navigation button on the far left of the header bar, followed by a separator.
  - Display the current document title and status.
  - Render an artifact switcher pill/tab bar or compact selector for sibling artifacts in the center/left header area.
  - Maintain the "In VS Code Text-Editor öffnen" action on the far right.
- **Rationale**: Following established IDE and web conventions, the back/home navigation belongs on the top left, followed by breadcrumb/contextual navigation and file switching.

### Decision 4: Internationalization Structure
- **Choice**: Add an `editor` namespace to `src/webview/i18n/en.ts` and `src/webview/i18n/de.ts` covering:
  - `dashboard`: 'Dashboard'
  - `dashboardTooltip`: 'Open OpenSpec Studio Dashboard' / 'OpenSpec Studio Dashboard öffnen'
  - `relatedFiles`: 'Related Artifacts' / 'Zugehörige Dokumente'
  - `openDefaultEditor`: 'Open in Text Editor' / 'In VS Code Text-Editor öffnen'
- **Rationale**: Keeps localization centralized and consistent with the dashboard translations.

## Risks / Trade-offs

- [Risk] Custom editor document might not be inside a change folder (e.g., durable specs under `openspec/specs/`).
  → *Mitigation*: If the document is not part of a change directory, `relatedFiles` is empty, and the artifact switcher is cleanly omitted while the Dashboard button remains active.
- [Risk] Unsaved edits in the current file when switching to another artifact.
  → *Mitigation*: Opening another file in VS Code triggers standard tab switching; the current document retains its dirty state and debounced edits in memory.
