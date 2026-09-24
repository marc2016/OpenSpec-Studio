# Proposal: Add to Chat for Editor Selection

## Why

In the OpenSpec Markdown Editor, users cannot easily send selected text to their AI assistant chat (e.g., GitHub Copilot Chat). Because the editor is rendered inside an isolated Webview iframe, native VS Code text selection context menus and standard editor commands do not automatically capture webview selections. Adding a floating "Add to Chat" action directly upon text selection enables users to seamlessly query their AI assistant about specific requirements, sections, or text selections.

## What Changes

- Implement a floating action bubble (pill) in the visual Markdown Editor that appears above the user's active text selection.
- Clicking the "Add to Chat" action in the bubble sends a message with the selected text and document path to the extension host.
- The extension host formats the selection as a structured reference (including relative file path and blockquote) and opens the AI chat via `workbench.action.chat.open` (or falls back according to the configured `openspec.aiTarget`).
- Automatically dismiss the bubble when selection is cleared or when clicking outside.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `custom-markdown-editor`: Adds requirement for contextual text selection action that dispatches the selected content and file reference to the AI chat assistant.

## Impact

- `src/webview/editor/MarkdownEditorApp.tsx`: Selection tracking and floating bubble UI component.
- `src/customEditor/OpenSpecEditorProvider.ts`: Handle `ADD_TO_CHAT` message and coordinate with `WorkflowOrchestrator`.
- `test/customEditor.test.ts`: Verify `ADD_TO_CHAT` message handling and command dispatch.
