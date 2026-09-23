# Design

## Context

See `proposal.md` - Why.
When clicking requirement items in the OpenSpec Explorer sidebar, `SpecsTreeDataProvider` previously executed `openspec-studio.openFileRange`, which called `vscode.window.showTextDocument(doc)`. This opened the file in VS Code's standard text editor rather than the custom OpenSpec Markdown Editor.

## Goals / Non-Goals

**Goals:**
- Route requirement clicks in the sidebar tree to the OpenSpec Markdown Editor.
- Communicate the target requirement name to the webview (both on fresh document open and when the editor is already open).
- Scroll smoothly to the target requirement heading within the visual editor.
- Apply a prominent, temporary visual highlight animation to clearly indicate the selected section.

**Non-Goals:**
- Replacing the text editor for users who explicitly choose to edit raw code via the "In VS Code Text-Editor öffnen" action.
- Line-number based selection in the visual DOM (the visual DOM uses Lexical headings/blocks, so heading/title text matching is more robust than raw file line numbers).

## Decisions

### 1. Navigation by Requirement Title vs Line Number
- **Decision:** Match target requirement in the visual editor by requirement name/heading rather than file line numbers.
- **Rationale:** MDXEditor renders markdown into Lexical DOM nodes (`h3`, `p`, etc.) without maintaining 1:1 file line numbers. Looking up headings matching `Requirement: <name>` is robust, resilient to whitespace variations, and accurately identifies the exact DOM node to scroll and highlight.
- **Alternative considered:** Mapping byte/line offsets to Lexical node keys — complex, fragile across rich text format conversions.

### 2. Panel Tracking in OpenSpecEditorProvider
- **Decision:** Maintain a registry `activePanels: Map<string, vscode.WebviewPanel>` in `OpenSpecEditorProvider`.
- **Rationale:** When the user clicks a requirement in the sidebar tree, if the document is already open in an editor tab, `openRequirement` can immediately reveal the panel and dispatch `NAVIGATE_TO_REQUIREMENT` via `postMessage`. If it is not yet open, `vscode.commands.executeCommand('vscode.openWith', ...)` opens it, and the initial target is passed via `window.OPENSPEC_DATA`.
- **Alternative considered:** Opening a new tab on every click — creates duplicate tabs or conflicts with `supportsMultipleEditorsPerDocument: false`.

### 3. Visual Highlight Effect
- **Decision:** Apply a temporary CSS animation class `.openspec-requirement-target-highlight` to the target heading and its enclosing requirement container in the webview.
- **Rationale:** A glowing outline and soft background pulse using VS Code theme selection colors (`var(--vscode-editor-selectionHighlightBackground, rgba(55, 148, 255, 0.25))`) provides instant visual confirmation without altering document content or marking the file dirty.

## Risks / Trade-offs

- **[Risk]** The target heading may take a few milliseconds to render on initial document load.  
  → **Mitigation:** If the DOM node is not found immediately on mount, retry with `requestAnimationFrame` or a small timeout (e.g., 50ms) up to a max threshold.
- **[Risk]** Requirement heading text formatted with special characters.  
  → **Mitigation:** Normalize text comparisons (trim whitespace, case-insensitive match for the requirement name suffix).
