# Proposal

## Why

Editing OpenSpec markdown documents (proposals, specs, design, tasks) currently relies either on standard raw markdown text editors without visual formatting controls, or requires switching back and forth between editor and preview. Users need a dedicated, rich WYSIWYG editor for OpenSpec files with formatting buttons at the top, while retaining the ability to quickly switch back to raw markdown code or reopen in VS Code's standard text editor.

## What Changes

- **Custom Editor Provider**: Register a VS Code Custom Text Editor (`openspec.markdownEditor`) for markdown documents within OpenSpec (`**/openspec/**/*.md`).
- **Rich Markdown Editing UI**: Embed a modern WYSIWYG markdown editor (`@mdxeditor/editor`) with formatting toolbar buttons (Headings, Bold, Italic, Strikethrough, Lists, Task Checklist, Code block, Quote, Table, Link).
- **Source Code Switch**: Include a toolbar button and shortcut to seamlessly toggle between visual WYSIWYG view and raw markdown source code within the editor.
- **VS Code Standard Editor Switch**: Provide a button / command to immediately reopen the document in the default VS Code text editor (`vscode.openWith(uri, 'default')`).
- **Two-way Document Synchronization**: Integrate with VS Code's `CustomTextEditorProvider` so changes update the underlying `vscode.TextDocument`, preserving undo/redo history, dirty indicators, and native save (`Cmd+S`).

## Capabilities

### New Capabilities
- `custom-markdown-editor`: Custom text editor provider for OpenSpec markdown files featuring a WYSIWYG toolbar, source toggle, and native document synchronization.

### Modified Capabilities
None.

## Impact

- `package.json`: Add `customEditors` contribution for `openspec.markdownEditor`.
- `src/customEditor/OpenSpecEditorProvider.ts`: New custom text editor provider handling document lifecycle and messaging.
- `src/webview/editor/`: React editor component mounting MDXEditor with formatting plugins and toolbar.
- Build & Bundling: Add `@mdxeditor/editor` dependency and configure build assets.
