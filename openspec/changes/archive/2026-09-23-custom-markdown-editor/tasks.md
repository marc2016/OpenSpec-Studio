# Tasks

## 1. Dependencies & Manifest Configuration

- [x] 1.1 Install `@mdxeditor/editor` and required styling dependencies
- [x] 1.2 Register `openspec.markdownEditor` in `package.json` under `contributes.customEditors`

## 2. Webview Editor Component

- [x] 2.1 Build React markdown editor component with formatting toolbar, source code toggle, and default text editor button
- [x] 2.2 Style editor container and toolbar using VS Code CSS theme variables for seamless dark/light theme integration

## 3. Custom Text Editor Provider

- [x] 3.1 Implement `OpenSpecEditorProvider` in `src/customEditor/OpenSpecEditorProvider.ts` implementing `vscode.CustomTextEditorProvider`
- [x] 3.2 Register provider in `src/extension.ts` and handle document synchronization, saving, and `openWith` default editor switching

## 4. Verification & Testing

- [x] 4.1 Create unit tests for editor provider registration and message handling
- [x] 4.2 Verify extension bundle build (`npm run build`) and test suite (`npm run test`) pass cleanly
