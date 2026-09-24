# Tasks

## 1. Extension Manifest & Command Contributions

- [x] 1.1 Register `openspec-studio.specsTree` tree view in `package.json` under `contributes.views` for the `openspec-studio` view container and verify compilation.
- [x] 1.2 Add view action buttons (Refresh and Open Studio Dashboard) to `package.json` under `contributes.menus` for `view/title` and verify manifest validation.

## 2. Specs Tree Data Provider Implementation

- [x] 2.1 Implement `SpecsTreeItem` with strongly-typed node variants, ThemeIcons (`$(book)`, `$(git-pull-request)`, `$(file-text)`, `$(checklist)`, etc.), and click-to-open `vscode.open` commands in `src/core/SpecsTreeDataProvider.ts`.
- [x] 2.2 Implement `getChildren` in `SpecsTreeDataProvider` to build hierarchical categories (Durable Specs, Active Changes, Archived History) populated from `WorkspaceDetector`.
- [x] 2.3 Connect `WorkspaceDetector.onDidChangeState` to tree data change events to automatically synchronize tree nodes with file system updates.

## 3. Extension Host Registration & Verification

- [x] 3.1 Register `SpecsTreeDataProvider` in `src/extension.ts` with `vscode.window.registerTreeDataProvider` and bind the `openspec-studio.refreshTree` command.
- [x] 3.2 Implement unit tests in `test/specsTree.test.ts` verifying tree structure, children resolution, task progress labels, and command bindings.
- [x] 3.3 Compile with `npm run build` and execute tests with `npm test` verifying full suite passes.
