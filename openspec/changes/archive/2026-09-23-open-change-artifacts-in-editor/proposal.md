# Proposal

## Why

In the OpenSpec Explorer sidebar under "Active Changes", clicking change artifacts (`proposal.md`, `tasks.md`, and `design.md`) currently opens them in VS Code's standard text editor rather than the custom visual OpenSpec Markdown Editor. Users expect all OpenSpec markdown artifacts—including change planning documents—to open consistently in the OpenSpec Markdown Editor.

## What Changes

- Update change artifact tree items in the OpenSpec Explorer sidebar (`proposal.md`, `tasks.md`, `design.md`, and other markdown change artifacts) so clicking them executes `openspec-studio.openInCustomEditor`.
- Ensure delta specs and specification files under active changes continue to open directly in the OpenSpec Markdown Editor.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `specs-tree-view`: Change artifact tree items (`proposal.md`, `tasks.md`, `design.md`) must route click actions to the OpenSpec Markdown Editor instead of the plain text editor.

## Impact

- `src/core/SpecsTreeDataProvider.ts`: Configure `SpecsTreeItem` command for artifact files with `.md` extension to invoke `openspec-studio.openInCustomEditor`.
- `test/specsTree.test.ts`: Update test expectations to verify that artifact items (`proposal.md`, `design.md`, `tasks.md`) use `openspec-studio.openInCustomEditor`.
