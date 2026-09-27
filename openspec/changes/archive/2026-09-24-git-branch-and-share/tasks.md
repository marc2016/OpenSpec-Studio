# Tasks

## 1. Shared Types & URL Parsing Utility

- [x] 1.1 Define `GitState` interface and new IPC message types (`CREATE_BRANCH`, `SWITCH_BRANCH`, `COMMIT_AND_PUSH`, `GIT_OPERATION_RESULT`) in `src/shared/types.ts` and verify with `npm run compile`
- [x] 1.2 Implement `src/core/gitUrlHelper.ts` to parse SSH and HTTPS remote URLs and build shareable compare and pull request links for GitHub, GitLab, and Bitbucket
- [x] 1.3 Create unit tests in `test/gitUrlHelper.test.ts` covering standard and edge-case remote formats and verify with `npm run test`

## 2. Git Backend Adapter & Host Wiring

- [x] 2.1 Implement `src/core/GitAdapter.ts` to detect repository status, active branch, uncommitted count, remote origin URL, and execute branch creation and stage-commit-push with friendly error translation
- [x] 2.2 Add unit tests in `test/gitAdapter.test.ts` verifying repository state detection, branch creation, commit-push execution, and error message sanitization with `npm run test`
- [x] 2.3 Integrate `GitAdapter` into `src/core/StudioDashboardPanel.ts`, handling Git IPC actions and broadcasting `git: GitState` inside `OpenSpecState`

## 3. Webview UI & Modal Components

- [x] 3.1 Implement `src/webview/components/GitShareModal.tsx` providing confirmation of changed files, optional commit note input, progress state, and success view with copy/open link actions
- [x] 3.2 Update `src/webview/components/Header.tsx` to render active branch indicator, modified files badge, and global "Save & Share" trigger button
- [x] 3.3 Update `src/webview/components/ActiveChangesGrid.tsx` to display branch status and contextual branch/share buttons on active change cards

## 4. End-to-End Verification & Integration

- [x] 4.1 Run full project compilation with `npm run compile` and verify that the extension and webview bundle compile cleanly without warnings or errors
- [x] 4.2 Run test suite with `npm run test` and verify that all test suites pass cleanly
