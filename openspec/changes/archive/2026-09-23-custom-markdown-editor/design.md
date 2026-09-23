# Design

## Context

OpenSpec Studio users work extensively with markdown documents across proposals, durable specifications, and task lists. While VS Code provides standard markdown text editing, users frequently seek a rich editing experience with a visual formatting toolbar, fast source code switching, and native document lifecycle integration.

## Goals / Non-Goals

**Goals:**
- Implement `OpenSpecEditorProvider` implementing `vscode.CustomTextEditorProvider`.
- Register `openspec.markdownEditor` in `package.json` for `**/openspec/**/*.md`.
- Integrate `@mdxeditor/editor` for fast, native Markdown AST editing.
- Provide a top formatting toolbar with style toggles, heading selectors, lists, task checkboxes, code blocks, and tables.
- Support instant toggling between visual WYSIWYG mode and raw markdown source code mode.
- Provide a button / command to switch to the default VS Code text editor (`vscode.openWith(uri, 'default')`).
- Implement robust bidirectional state synchronization via `vscode.WorkspaceEdit`.

**Non-Goals:**
- Replacing VS Code's editor for non-OpenSpec markdown files outside `openspec/`.
- Building a custom proprietary markdown parser.

## Decisions

### 1. Editor Engine: MDXEditor (`@mdxeditor/editor`)
- **Decision**: Adopt `@mdxeditor/editor` (built on Meta's Lexical framework).
- **Rationale**: MDXEditor is designed specifically for Markdown AST manipulation without lossy HTML conversion. It ships with prebuilt toolbar components, table support, and the `diffSourcePlugin` for switching between rich-text and source code views.
- **Alternatives Considered**: TipTap (rejected due to headless nature requiring significant custom toolbar and markdown serialization boilerplate).

### 2. Custom Text Editor Provider (`vscode.CustomTextEditorProvider`)
- **Decision**: Use `CustomTextEditorProvider` rather than a standard `WebviewPanel`.
- **Rationale**: `CustomTextEditorProvider` hooks directly into VS Code's document model:
  - Document dirty indicators (`*`) are managed automatically.
  - `Cmd+S` / Save commands invoke VS Code's document save handlers.
  - Reverting and external file changes are synchronized automatically.
  - Multi-tab management and layout splits work natively.

### 3. Bidirectional Sync & Source Toggle
- **Decision**:
  - Webview sends debounced `edit` messages on content change.
  - Extension applies edits via `vscode.WorkspaceEdit` replacing document content.
  - In-editor toolbar includes `DiffSourceToggleWrapper` to switch between rich-text and source view in place.
  - Toolbar includes an `Open in Text Editor` button that messages the extension to call `vscode.commands.executeCommand('vscode.openWith', uri, 'default')`.

## Risks / Trade-offs

- **[Risk] Styling divergence with VS Code themes** → Mitigation: Target CSS variables (`--vscode-editor-background`, `--vscode-editor-foreground`, `--vscode-toolbar-hoverBackground`) to adapt seamlessly to all dark, light, and high-contrast themes.
- **[Risk] Edit loop during typing** → Mitigation: Track document versions and debounce webview edit dispatches to avoid feedback loops between extension and webview.
