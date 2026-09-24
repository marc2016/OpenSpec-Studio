# Design: Floating Add to Chat for Editor Selection

## Context

See `proposal.md` for motivation.
`MarkdownEditorApp.tsx` hosts the MDXEditor instance inside a VS Code webview panel managed by `OpenSpecEditorProvider.ts`.
`WorkflowOrchestrator` is already responsible for routing AI workflow actions to Copilot (`workbench.action.chat.open`), terminal, or clipboard.

## Goals / Non-Goals

**Goals:**
- Detect user text selections in `MarkdownEditorApp.tsx` and render a sleek floating action pill ("💬 Add to Chat") above the selection.
- Send the selected text along with the active document path to the extension host via `postMessage`.
- In `OpenSpecEditorProvider`, format the prompt query with a relative file path reference and blockquote, then dispatch to the AI assistant using `WorkflowOrchestrator`.
- Cleanly dismiss the floating pill when the selection is collapsed, cleared, or when the user scrolls or clicks elsewhere.

**Non-Goals:**
- Building a standalone in-webview chat interface.
- Overriding native Monaco editor context menus outside the custom webview editor.

## Decisions

### Decision: Standard Selection Listener and Viewport Coordinate Calculation
- **Choice**: Listen to `pointerup`, `keyup`, and `selectionchange` within the editor container. If a non-empty selection exists within the editor content, calculate its viewport coordinates using `range.getBoundingClientRect()`.
- **Rationale**: Simple, robust, and framework-agnostic. Avoids deep coupling to Lexical internals while maintaining accurate positioning relative to the editor container.
- **Alternatives considered**: Lexical-specific floating toolbar plugin. Rejected because MDXEditor's internal plugin interface is more complex and less flexible for custom action buttons.

### Decision: Extension-Host Query Formatting and Dispatch
- **Choice**: The webview sends `{ command: 'ADD_TO_CHAT', text: string, filePath: string }`. `OpenSpecEditorProvider` calculates `vscode.workspace.asRelativePath(document.uri)` and formats:
  ```markdown
  Referenz: `<relativePath>`
  > <selected text>

  ```
  It then invokes `workflowOrchestrator.dispatchToCopilot(query)` (with fallback to clipboard).
- **Rationale**: Keeps the webview lightweight and delegates workspace path resolution and AI target handling to the existing extension host infrastructure.

## Risks / Trade-offs

- **[Risk] Floating bubble positioning on viewport edges or container scrolling**:
  - *Mitigation*: Clamp coordinates within container bounds; if `top - bubbleHeight < 0`, place the bubble below the selection (`bottom + 8px`). Hide the bubble on container scroll to prevent visual detachment.
- **[Risk] Chat command availability in VS Code**:
  - *Mitigation*: Fall back to `vscode.env.clipboard.writeText` and notify user if `workbench.action.chat.open` fails or Copilot is not installed.
