# Tasks

## 1. Extension Host Support & Sibling Artifact Discovery

- [x] 1.1 Implement change context detection and sibling artifact discovery in `OpenSpecEditorProvider.ts` to locate `proposal.md`, `design.md`, `tasks.md`, and delta specs under `specs/**/*.md`.
- [x] 1.2 Include discovered `relatedFiles` in `INIT_EDITOR` and initial HTML script payload, sending label, relative path, and full file path.
- [x] 1.3 Add message listeners in `OpenSpecEditorProvider.ts` for `OPEN_DASHBOARD` (invoking `openspec-studio.openDashboard`) and `OPEN_FILE` (opening target file with `vscode.openWith`).

## 2. Localization & Types

- [x] 2.1 Define shared types for `RelatedFileItem` in `src/shared/types.ts`.
- [x] 2.2 Add editor navigation translations in `src/webview/i18n/en.ts` and `src/webview/i18n/de.ts` for dashboard action, file switcher, and tooltips.

## 3. Webview Header UI & Navigation

- [x] 3.1 Add a Dashboard button in `MarkdownEditorApp.tsx` top header with dashboard icon, localized tooltip, and `OPEN_DASHBOARD` dispatch.
- [x] 3.2 Add a related files switcher (dropdown / tab selector) in `MarkdownEditorApp.tsx` top header showing sibling artifacts with active state indicator and `OPEN_FILE` dispatch.
- [x] 3.3 Ensure graceful fallback when the edited file does not belong to a change directory (hide switcher while keeping Dashboard button).

## 4. Verification & Testing

- [x] 4.1 Build webview and extension bundles (`npm run build:webview`, `npm run compile`) and verify no TypeScript or bundling errors.
- [x] 4.2 Run existing test suites (`npm test`) and add/update unit tests for `OpenSpecEditorProvider` and editor navigation.
