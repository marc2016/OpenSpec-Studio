# Tasks

## 1. Webview Selection Tracking & Floating Action UI

- [x] 1.1 Implement selection detection and coordinate calculation in `src/webview/editor/MarkdownEditorApp.tsx`, and verify via code inspection
- [x] 1.2 Implement floating "Add to Chat" action pill component in `src/webview/editor/MarkdownEditorApp.tsx` that dispatches `ADD_TO_CHAT` message with selected text and file path, and verify dismissal logic

## 2. Extension Host Message Handling & AI Dispatch

- [x] 2.1 Handle `ADD_TO_CHAT` message in `src/customEditor/OpenSpecEditorProvider.ts` to format reference and invoke `workbench.action.chat.open` via `WorkflowOrchestrator`
- [x] 2.2 Add unit tests in `test/customEditor.test.ts` verifying `ADD_TO_CHAT` message handling and command execution with expected arguments

## 3. Verification & Build

- [x] 3.1 Run full build and test suite (`npm run build && npm test`) to verify clean compilation and all tests pass
