# Spec Delta: studio-dashboard

## Purpose

Provides a rich, interactive editor-tab dashboard presenting active changes, task progress metrics, durable specs, and archived changes using React and modern UI components.

## ADDED Requirements

### Requirement: Editor-tab dashboard presentation
The system SHALL display the primary studio dashboard as a full editor tab (`WebviewPanel`) within VS Code, retaining context and state across tab switches.

#### Scenario: Opening the studio dashboard
- **WHEN** the user invokes the command to open OpenSpec Studio or clicks the status bar item
- **THEN** the system creates or reveals an editor tab containing the OpenSpec Studio dashboard

#### Scenario: Preserving dashboard state on tab change
- **WHEN** the user switches away from the studio dashboard tab to an editor and back
- **THEN** the dashboard retains its current view state, expanded sections, and scroll position without remounting

### Requirement: Active changes presentation
The system SHALL render all active changes in the workspace with status badges, task completion progress, linked artifacts, and quick action buttons.

#### Scenario: Displaying change progress
- **WHEN** active changes exist with tasks in `tasks.md`
- **THEN** the dashboard displays a visual progress bar indicating completed tasks versus total tasks for each change

### Requirement: Durable specs exploration
The system SHALL list all durable capability specifications present in `openspec/specs/` and allow inspecting their requirements and scenarios.

#### Scenario: Inspecting capability details
- **WHEN** the user selects a capability in the specs list
- **THEN** the dashboard displays its requirements and associated scenarios in an expandable view

### Requirement: Archived changes history
The system SHALL list previously archived changes with their archive dates and summary information.

#### Scenario: Viewing archived history
- **WHEN** the user navigates to the archive section
- **THEN** all archived changes in `openspec/changes/archive/` are displayed chronologically
