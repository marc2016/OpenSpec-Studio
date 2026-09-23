# Proposal

## Why

When navigating OpenSpec specifications in the sidebar tree view, clicking on a requirement sub-item currently opens the `spec.md` document at the top of the file without focusing or highlighting the specific requirement. Users have to manually scroll and search through the file to locate the clicked requirement. Selecting and highlighting the entire markdown section corresponding to the clicked requirement directly navigates the user to their target content and provides immediate visual context.

## What Changes

- **Requirement Range Parsing**: Calculate or record the line range (start line and end line) of each requirement section in `spec.md` (from `### Requirement: ...` to the start of the next requirement or section).
- **Targeted Navigation & Selection**: Configure tree item commands for requirement sub-items so that clicking them opens the markdown document and selects the complete text range of the requirement section in the active editor.
- **Auto-Scroll to Selection**: Ensure the editor reveals the selected requirement range in the center of the viewport (`vscode.TextEditorRevealType.InCenter`).

## Capabilities

### New Capabilities
- `specs-tree-view`: Sidebar tree navigation for OpenSpec specifications and requirements with section highlighting in markdown files.

### Modified Capabilities
None.

## Impact

- `src/core/WorkspaceDetector.ts`: Enhance `SpecRequirement` to store `startLine` and `endLine` (0-indexed or 1-indexed) during `parseSpecFile`.
- `src/core/SpecsTreeDataProvider.ts`: Pass line ranges to tree item commands, or register a dedicated navigation command `openspec-studio.openFileRange` that opens the document and sets `vscode.TextEditor.selection` across the entire requirement section.
- `src/extension.ts`: Register `openspec-studio.openFileRange` command if needed.
- `test/specsTree.test.ts` & `test/detector.test.ts`: Add test cases verifying requirement line ranges and command execution.
