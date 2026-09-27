# Design

## Context

See [proposal.md](file:///Users/marclammers/sources/OpenSpec-Studio/openspec/changes/git-branch-and-share/proposal.md) for motivation and problem statement.

OpenSpec Studio runs as a VS Code webview extension. Currently, `StudioDashboardPanel` monitors OpenSpec workspace state using `WorkspaceDetector` and communicates with the React webview via `ToWebviewMessage` and `FromWebviewMessage`. While technical developers use terminal Git commands or VS Code's Source Control panel, non-technical authors (product managers, designers, domain reviewers) modifying specs in the Studio need a streamlined, one-click mechanism to:
1. Isolate their edits onto a feature branch without knowing Git branching syntax.
2. Review their pending modifications and "Save & Share" (stage, commit, push) to remote with a brief confirmation.
3. Obtain a direct web link (e.g. GitHub compare/PR URL or GitLab merge request URL) to share with teammates.

## Goals / Non-Goals

**Goals:**
- Provide a robust `GitAdapter` service in the VS Code host extension to query repository state (current branch, modified file count, remote URL) and perform high-level Git actions (create/switch branch, stage-commit-push).
- Integrate a lightweight URL parser (`gitUrlHelper`) that parses SSH (`git@github.com:...`) and HTTPS (`https://github.com/...`) remote origins and constructs compare/PR links for GitHub, GitLab, and Bitbucket.
- Extend `OpenSpecState` with an optional `git: GitState` object containing branch info, uncommitted count, and remote URL.
- Support bidirectional webview messages for Git actions (`CREATE_BRANCH`, `SWITCH_BRANCH`, `COMMIT_AND_PUSH`) and operation results (`GIT_OPERATION_RESULT`).
- Provide an intuitive, non-technical UI modal (`GitShareModal`) and dashboard buttons (in header and change cards) that display file counts, an optional note, and direct copy/open link actions.
- Provide friendly, actionable error messages instead of raw terminal output for push rejections, authentication failures, or remote divergence.

**Non-Goals:**
- Implementing a full-featured Git client inside OpenSpec Studio (no interactive merge conflict resolution, rebase, cherry-pick, stash, or interactive staging of individual hunks).
- Direct GitHub/GitLab REST API integration requiring personal access tokens (PATs) or OAuth scopes — the extension relies on existing Git credentials and VS Code's Git auth provider.
- Modifying Git hooks or manipulating global `.gitconfig`.

## Decisions

### Decision 1: Execution via VS Code Built-in Git Extension with CLI Fallback
- **Choice**: Utilize the official VS Code Git extension API (`vscode.extensions.getExtension('vscode.git')`) as primary provider to leverage user credentials, auth helpers, and repository listeners; fallback to spawning `git` CLI commands via Node's `child_process.execFile` when the VS Code Git extension is inactive or disabled.
- **Rationale**: The VS Code Git extension already handles SSH keys, credential helpers, and GPG signing smoothly in the editor environment. The CLI fallback ensures compatibility in headless tests or minimal editor environments.
- **Alternatives Considered**: 
  - *Only raw CLI `git` execution*: Fails or hangs if SSH passphrases or HTTPS credentials prompt in a terminal that is not visible to the webview.
  - *`isomorphic-git` / pure JS*: Heavyweight, requires custom credential storage and reimplements plumbing already provided by VS Code.

### Decision 2: Web URL Parsing & Compare/PR Link Construction
- **Choice**: Implement a standalone, pure TypeScript utility (`src/core/gitUrlHelper.ts`) with zero external dependencies to parse remote URLs and construct direct web links:
  - GitHub: `https://github.com/<owner>/<repo>/compare/<branch>?expand=1`
  - GitLab: `https://gitlab.com/<owner>/<repo>/-/merge_requests/new?merge_request%5Bsource_branch%5D=<branch>`
  - Bitbucket: `https://bitbucket.org/<owner>/<repo>/pull-requests/new?source=<branch>`
  - Unsupported/generic: Fallback to base web URL or raw branch identifier.
- **Rationale**: Instant web links provide immediate satisfaction for users to open a PR or share the link with their team without needing GitHub API tokens.
- **Alternatives Considered**: Direct GitHub Octokit SDK integration (rejected: requires user token configuration, rate limits, and network permissions).

### Decision 3: "Save & Share" Staging & Commit Policy
- **Choice**: Staging all modified and untracked files (`git add -A`) when performing "Save & Share", with a default commit message ("Update specs: <branch or change name>") if the user leaves the optional note empty.
- **Rationale**: Non-technical users think in terms of "saving my current work snapshot". Asking them to selectively stage files creates confusion and risks omitting newly created spec files.
- **Alternatives Considered**: Staging only `openspec/` files (rejected: users may also edit related mockups or configuration files as part of their change).

### Decision 4: Non-Technical Error Masking & Translation
- **Choice**: Intercept raw Git errors (exit codes, stderr) and map regex patterns to human-friendly messages:
  - Remote rejected / non-fast-forward: *"Someone else on your team pushed new changes to this branch. Please ask a developer or teammate to sync the latest updates."*
  - Auth error / Permission denied: *"Could not connect to the remote repository. Please check your internet connection or verify your Git sign-in."*
  - Remote origin missing: *"No remote repository is configured for this workspace."*
- **Rationale**: Raw Git messages (like `Updates were rejected because the remote contains work that you do not have locally`) frighten non-technical users and lead to panic.
- **Alternatives Considered**: Displaying raw terminal error log (rejected: contrary to the core UX goal).

## Risks / Trade-offs

- **[Risk] Remote Authentication Prompts Block Process** → *Mitigation*: Run operations with a strict timeout (e.g. 15s) and leverage the VS Code Git extension's internal credential provider where possible. If a command prompts for credentials, fail gracefully with an actionable notification.
- **[Risk] User on `main` / `master` Overwriting Production** → *Mitigation*: If the active branch is `main` or `master`, the UI suggests creating a dedicated change branch (`change/<name>`) instead of pushing directly to the primary branch.
- **[Risk] SSH Remote URL formats vary widely** → *Mitigation*: Support `git@`, `ssh://`, `https://`, and `.git` suffix stripping in comprehensive unit tests for `gitUrlHelper`.
