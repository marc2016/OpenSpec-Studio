# Proposal

## Why

Currently, clicking a requirement tree item in the OpenSpec Explorer sidebar opens the document in VS Code's standard plain text editor (`showTextDocument`) to highlight the line numbers in raw code. Users expect requirement clicks to open directly in the visual OpenSpec Markdown Editor and navigate to/highlight that requirement section inside the rich editor instead of switching to raw code.

## What Changes

- Update requirement click command in the OpenSpec Explorer sidebar to open the target document via the OpenSpec Markdown Editor rather than forcing the plain text editor.
- Pass target requirement navigation metadata (such as requirement name/heading) to the active or newly opened custom editor instance.
- In the OpenSpec Markdown Editor webview, listen for navigation requests, locate the requirement heading, scroll it smoothly into view, and apply a temporary visual highlight/selection badge around the requirement section.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `specs-tree-view`: Update requirement tree item command to route navigation to the OpenSpec Markdown Editor instead of plain text code editor.
- `custom-markdown-editor`: Support external navigation to specific requirements with automatic scroll-to and visual highlight in the markdown editor.

## Impact

- `src/core/SpecsTreeDataProvider.ts`: Tree items route to the custom editor command with requirement target.
- `src/customEditor/OpenSpecEditorProvider.ts`: Handle navigation requests and forward them via webview message to active or launching panels.
- `src/webview/editor/MarkdownEditorApp.tsx`: Implement scrolling and highlight animation for target requirements in the DOM.
