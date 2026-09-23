# Design: Open Change Artifacts in Editor

## Context

See `proposal.md` for background.
Currently, `SpecsTreeItem.setupVisuals` initializes the default command for files with `filePath` to `vscode.open`. While `spec-capability` and `spec-requirement` items override this to use `openspec-studio.openInCustomEditor` or `openspec-studio.openRequirement`, `artifact-file` items (such as `proposal.md`, `design.md`, and `tasks.md`) under active changes still default to `vscode.open`.

## Goals / Non-Goals

**Goals:**
- Unify file opening behavior for all markdown artifacts in the OpenSpec Explorer sidebar so clicking them opens the OpenSpec Markdown Editor.
- Maintain existing non-markdown file handling (e.g. any non-.md files open with standard `vscode.open`).
- Ensure all tests in `test/specsTree.test.ts` reflect the updated command.

**Non-Goals:**
- Altering the behavior of external file explorer clicks or git diff views.
- Changing how the editor renders proposal or tasks files (the MDXEditor already renders standard markdown).

## Decisions

### Decision: Route all markdown artifact-file items to `openspec-studio.openInCustomEditor`
- **Choice**: In `SpecsTreeItem.setupVisuals` or item creation in `getChangeArtifacts`, check if `filePath.endsWith('.md')` and assign `openspec-studio.openInCustomEditor` with `vscode.Uri.file(filePath)` as the argument.
- **Rationale**: Keeps tree item creation clean and centralized. Any markdown artifact created under a change automatically opens in the custom editor without needing individual overrides per file name.
- **Alternatives considered**: Hardcoding individual checks for `proposal.md`, `tasks.md`, `design.md`. Rejected because any future or custom artifacts (like delta specs or extra notes) should also open in the custom editor.

## Risks / Trade-offs

- **[Risk] Test breakage in `specsTree.test.ts`**: The existing test asserts `expect(proposalItem.command.command).toBe('vscode.open')`.
  - **Mitigation**: Update the test to verify that `proposalItem.command.command` is `'openspec-studio.openInCustomEditor'`, matching the new requirement.
