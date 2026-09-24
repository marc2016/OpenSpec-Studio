# Specification: workspace-detector

## Purpose

Detects whether the currently active workspace contains an OpenSpec directory, watches for real-time filesystem changes, and triggers state updates or onboarding views accordingly.

## Requirements

### Requirement: OpenSpec workspace detection
The system SHALL scan the root of any open workspace folder upon extension activation and check for the presence of an `openspec` directory.

#### Scenario: OpenSpec directory exists
- **WHEN** a workspace containing an `openspec/` directory is opened
- **THEN** the system marks the workspace as initialized and activates the full studio dashboard state

#### Scenario: OpenSpec directory does not exist
- **WHEN** a workspace without an `openspec/` directory is opened
- **THEN** the system marks the workspace as uninitialized and displays the onboarding view

### Requirement: Real-time filesystem watching
The system SHALL watch the `openspec/**` directory hierarchy for file creation, modification, and deletion events and notify the dashboard to refresh its state.

#### Scenario: Change artifact is updated
- **WHEN** an artifact such as `tasks.md` or `proposal.md` is modified on disk
- **THEN** the file watcher emits a change event and the studio dashboard updates its task progress and change status without requiring a manual reload

#### Scenario: OpenSpec directory is created externally
- **WHEN** an `openspec/` directory is initialized via terminal or external tool while the extension is running
- **THEN** the watcher detects the directory creation and automatically transitions the UI from onboarding to active dashboard
