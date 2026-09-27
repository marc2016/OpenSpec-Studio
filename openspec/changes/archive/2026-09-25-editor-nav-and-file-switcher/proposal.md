# Proposal: Editor Navigation and Related Files Switcher

## Why

When viewing or editing OpenSpec documents in the custom markdown editor, users are isolated from the overarching Studio Dashboard context. Navigating back to the dashboard requires either finding the status bar item or running a command palette action. Furthermore, working on an OpenSpec change typically requires jumping between linked planning artifacts (`proposal.md`, delta specifications in `specs/`, `design.md`, and `tasks.md`), forcing users to navigate nested folder trees in the standard VS Code file explorer. Adding top header navigation to jump back to the dashboard and quickly switch between related change artifacts significantly accelerates spec authoring and review.

## What Changes

- Add a top header navigation bar button in the Custom Markdown Editor to return directly to the OpenSpec Studio Dashboard.
- Add an artifact switcher (dropdown and/or quick-switch pill controls) in the editor top header when viewing a change document, allowing one-click jumping between related change files (`proposal.md`, `design.md`, `tasks.md`, and delta specs).
- Enhance `OpenSpecEditorProvider` to discover sibling change artifacts for the active document and provide them to the webview editor.
- Add message handling in `OpenSpecEditorProvider` for `OPEN_DASHBOARD` and `OPEN_FILE` actions.
- Provide bilingual localization (`en` and `de`) for all new navigation controls, tooltips, and file switch labels.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `custom-markdown-editor`: Extend the custom editor specification with requirements for dashboard navigation from the editor top bar and jumping between related change artifacts.

## Impact

- `src/customEditor/OpenSpecEditorProvider.ts`: Inspect file paths to detect change contexts and sibling files; register message listeners for dashboard and file opening.
- `src/webview/editor/MarkdownEditorApp.tsx`: Update top header bar to render the Dashboard button and artifact switcher.
- `src/webview/i18n/en.ts` and `src/webview/i18n/de.ts`: Add localized strings for editor navigation.
