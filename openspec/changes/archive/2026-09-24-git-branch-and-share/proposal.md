# Proposal

## Why

Non-technical users (product managers, designers, domain experts) collaborating on OpenSpec specifications and changes are often intimidated by Git terminology and operations (branching, staging, committing, pushing, remotes, upstream tracking, and conflicts). 

Providing a simplified, abstracted Git workflow directly inside OpenSpec Studio allows non-technical contributors to isolate their work in a dedicated branch, save snapshots, upload their work to the remote repository, and receive a shareable link (such as a GitHub/GitLab Pull Request URL) with a single click and clear, friendly confirmations.

## What Changes

- Introduce a new `git-collaboration` capability providing high-level Git operations:
  - Detect repository state: active branch, uncommitted modified files, remote origin URL.
  - One-click branch creation with sensible defaults (e.g. `change/<change-name>`).
  - Streamlined "Save & Share" (Commit & Push) workflow with a clear confirmation dialog showing changed file counts and an optional note.
  - Automatic web URL generation for GitHub, GitLab, and Bitbucket targeting branch view or "New Pull Request / Merge Request" page.
  - Non-technical, friendly error guidance in case of remote conflicts or push rejections instead of cryptic Git terminal output.
- Integrate Git indicators and actions into the OpenSpec Studio dashboard:
  - Header: Active branch indicator with uncommitted changes count and "Save & Share" button.
  - Active Change Cards: Quick action to start or switch to a dedicated branch for the change, and share changes online.
  - Interactive Confirmation & Success Modal (`GitShareModal`) with direct copy-link and browser-open actions.

## Capabilities

### New Capabilities
- `git-collaboration`: High-level Git branch management, simplified commit/push confirmation, remote URL link generation, and non-technical conflict handling.

### Modified Capabilities

## Impact

- `src/shared/types.ts`: Add `GitState` interface to `OpenSpecState` and new webview IPC message types (`CREATE_BRANCH`, `SWITCH_BRANCH`, `COMMIT_AND_PUSH`, `GIT_OPERATION_RESULT`).
- `src/core/GitAdapter.ts`: New backend service wrapping Git commands / VS Code Git API.
- `src/core/gitUrlHelper.ts`: URL parser and builder for GitHub, GitLab, and Bitbucket compare/PR links.
- `src/core/StudioDashboardPanel.ts`: Wire Git state broadcasting and message handlers.
- `src/webview/components/Header.tsx`: Display branch badge and "Save & Share" button.
- `src/webview/components/ActiveChangesGrid.tsx`: Display branch contextual actions per change.
- `src/webview/components/GitShareModal.tsx`: New confirmation and shareable link modal.
