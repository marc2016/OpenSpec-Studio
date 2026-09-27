# Specification: git-collaboration

## Purpose

Provides non-technical users with intuitive Git branch management, safe snapshot sharing, and direct web pull request links within OpenSpec Studio.

## Requirements

### Requirement: Git State Detection and Monitoring
The system SHALL detect and monitor the Git repository status of the active workspace, including the current branch name, the number of uncommitted file modifications, and the upstream remote origin URL.

#### Scenario: Active repository detected
- **WHEN** the dashboard or workspace is loaded in a Git-tracked folder
- **THEN** the system detects the active branch name, counts uncommitted modified/untracked files, and makes this status accessible to the dashboard

#### Scenario: Workspace without Git repository
- **WHEN** the active workspace does not contain a Git repository
- **THEN** the system indicates that Git tracking is unavailable without throwing unhandled exceptions or disrupting dashboard functionality

### Requirement: Simplified Branch Creation and Switching
The system SHALL allow users to create and switch to a dedicated Git branch in a single action, providing sensible naming conventions based on active OpenSpec changes.

#### Scenario: Create change-specific branch
- **WHEN** the user initiates branch creation from an active change card
- **THEN** the system pre-fills a branch name in the format `change/<change-name>`, creates the branch, and switches the working tree to it upon confirmation

#### Scenario: Branch creation with existing name
- **WHEN** the user enters a branch name that already exists in the repository
- **THEN** the system alerts the user that the branch name is already taken and prevents branch creation until a unique name is provided

### Requirement: Save and Share Confirmation Workflow
The system SHALL provide a confirmation workflow before staging, committing, and pushing changes to the remote repository, displaying a summary of modified files and allowing an optional descriptive note.

#### Scenario: User confirms save and share
- **WHEN** the user clicks "Save & Share" and confirms the action with an optional note
- **THEN** the system stages all workspace modifications, commits them using the note or a default message, and pushes the branch to the remote repository

#### Scenario: User cancels save and share
- **WHEN** the user opens the save and share confirmation modal and clicks cancel or dismisses the dialog
- **THEN** no Git staging, commit, or push operations are executed, and the working tree remains untouched

#### Scenario: Attempting save and share with no uncommitted changes
- **WHEN** the user triggers save and share while the working tree has zero uncommitted changes
- **THEN** the system indicates that all changes are already saved and offers to push any unpushed commits or share the existing branch link

### Requirement: Web Shareable Link Generation
The system SHALL parse remote origin URLs for recognized hosting platforms (including GitHub, GitLab, and Bitbucket) and generate a direct web URL to view the branch or open a Pull Request / Merge Request.

#### Scenario: GitHub remote link generation
- **WHEN** changes are pushed to a remote hosted on GitHub
- **THEN** the system generates a comparison/pull request URL in the format `https://github.com/<owner>/<repo>/compare/<branch>?expand=1` and offers options to copy or open the link

#### Scenario: GitLab remote link generation
- **WHEN** changes are pushed to a remote hosted on GitLab
- **THEN** the system generates a merge request URL in the format `https://gitlab.com/<owner>/<repo>/-/merge_requests/new?merge_request%5Bsource_branch%5D=<branch>` and offers options to copy or open the link

#### Scenario: Unsupported or self-hosted remote
- **WHEN** changes are pushed to a remote that does not match known web platform patterns
- **THEN** the system displays the remote name and branch name, allowing the user to copy the branch reference

### Requirement: User-Friendly Conflict and Error Guidance
The system SHALL translate raw Git errors (such as non-fast-forward push rejections, authentication failures, or missing remotes) into actionable, non-technical explanations and guidance.

#### Scenario: Remote branch has conflicting changes
- **WHEN** a push operation fails because the remote branch contains newer commits from another collaborator
- **THEN** the system displays a clear, friendly warning explaining that the remote branch has newer updates, and advises the user to coordinate with a teammate or developer to merge changes safely

#### Scenario: Missing remote or authentication failure
- **WHEN** a push operation fails due to missing remote configuration or authentication credentials
- **THEN** the system alerts the user that the remote server could not be reached, suggesting they check their network connection or sign in via VS Code
