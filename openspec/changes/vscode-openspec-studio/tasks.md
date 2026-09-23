# Tasks

## 1. Extension Scaffold & Build Configuration

- [x] 1.1 Initialize VS Code extension project structure (`package.json`, `tsconfig.json`, build scripts) and verify extension builds cleanly with `npm run compile`.
- [x] 1.2 Configure extension manifest contributes (`openspec-studio.openDashboard` command, status bar item, activity bar container) and verify activation in VS Code extension host.
- [x] 1.3 Configure Vite and Tailwind CSS build pipeline for the React Webview application and verify output bundle generation in `dist/webview`.

## 2. CLI Adapter & Workspace Detection

- [x] 2.1 Implement `WorkspaceDetector` to check for `./openspec/` and watch `openspec/**` via `vscode.workspace.createFileSystemWatcher`, verifying change events are emitted on file updates.
- [x] 2.2 Implement `CliAdapter` with fallback resolution chain (local `node_modules/.bin/openspec`, global PATH, `npx openspec`) and verify CLI detection correctly identifies available binaries.
- [x] 2.3 Implement CLI command runners for `openspec list --json`, `openspec list --specs --json`, `openspec init`, and verify JSON output parsing with unit tests.

## 3. Webview IPC Bridge & shadcn/ui Dashboard

- [x] 3.1 Implement typed bidirectional IPC messaging between Extension Host and Webview, verifying state synchronization and command dispatching.
- [x] 3.2 Implement `OnboardingView` for uninitialized workspaces with One-Click Init and Install actions, verifying UI renders and dispatches CLI actions.
- [x] 3.3 Implement `ActiveChangesGrid` component rendering change cards with task completion progress bars, status badges, and action triggers, verifying rendering with test changes.
- [x] 3.4 Implement `SpecsExplorer` component displaying capabilities, requirements, and scenarios in an expandable tree view, verifying data formatting.
- [x] 3.5 Implement `ArchivedHistory` component displaying past archived changes chronologically, verifying archive entries are displayed correctly.

## 4. Multi-AI Workflow Orchestrator

- [x] 4.1 Implement `WorkflowOrchestrator` action handlers for Propose, Explore, Apply, Sync, and Archive, verifying prompt templates match OpenSpec workflow expectations.
- [x] 4.2 Implement AI Target dispatcher supporting GitHub Copilot Chat (`workbench.action.chat.open`), integrated terminal execution, and clipboard fallback, verifying dispatch routing per selected target.

## 5. End-to-End Verification

- [x] 5.1 Wire `StudioDashboardPanel` with `retainContextWhenHidden: true`, connecting FileSystemWatcher, CLI adapter, and Webview IPC, verifying the full dashboard opens in an editor tab.
- [x] 5.2 Verify live updates: modify `tasks.md` or `proposal.md` in a sample workspace and verify dashboard updates dynamically without manual refresh.
