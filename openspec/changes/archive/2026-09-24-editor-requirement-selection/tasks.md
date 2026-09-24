# Tasks

## 1. Tree View & Extension Command

- [x] 1.1 Update `SpecsTreeItem` in `src/core/SpecsTreeDataProvider.ts` to execute `openspec-studio.openRequirement` with document URI and requirement name
- [x] 1.2 Register command `openspec-studio.openRequirement` in `src/extension.ts` and route to `OpenSpecEditorProvider`

## 2. Editor Provider & Webview IPC

- [x] 2.1 Track active webview panels in `src/customEditor/OpenSpecEditorProvider.ts` and dispatch `NAVIGATE_TO_REQUIREMENT` messages
- [x] 2.2 Include initial `targetRequirement` in `window.OPENSPEC_DATA` within HTML injection when opening from requirement navigation

## 3. Webview Scrolling & Visual Highlighting

- [x] 3.1 Implement requirement heading detection and smooth scroll in `src/webview/editor/MarkdownEditorApp.tsx`
- [x] 3.2 Add `.openspec-requirement-highlight` pulse animation and styles in `src/webview/index.css`

## 4. Verification & Testing

- [x] 4.1 Add unit tests in `test/specsTree.test.ts` and `test/customEditor.test.ts` verifying requirement navigation and command dispatch
- [x] 4.2 Verify extension bundle build (`npm run build`) and test suite (`npm run test`) pass cleanly
