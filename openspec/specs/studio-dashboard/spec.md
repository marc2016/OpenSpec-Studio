# Specification: studio-dashboard

## Purpose

Provides an interactive studio dashboard overview allowing users to view, search, filter, and sort active changes, durable specifications, and archived history with persistent user preferences.

## Requirements

### Requirement: Active Changes Filtering and Sorting
The studio dashboard SHALL allow users to sort and filter active OpenSpec changes dynamically.

#### Scenario: Sort by completed tasks first
- **WHEN** user selects the sort mode "Completed first" in the active changes view
- **THEN** changes with 100% completed tasks are listed at the top, followed by descending task completion percentage

#### Scenario: Sort by modification date
- **WHEN** user selects sort mode "Recently modified"
- **THEN** changes are ordered by file modification timestamp with the most recently updated change first

#### Scenario: Filter by text search
- **WHEN** user inputs a query string into the changes search field
- **THEN** only changes whose name matches the search string (case-insensitive) are displayed

#### Scenario: Filter by status
- **WHEN** user selects a specific status filter (such as "In Progress" or "Completed")
- **THEN** only changes matching that status are displayed in the list

#### Scenario: Toggle hide completed changes
- **WHEN** user enables the "Hide completed" toggle
- **THEN** changes that have 100% completed tasks or status "Completed" are excluded from the list

### Requirement: Durable Specs Filtering and Sorting
The studio dashboard SHALL allow users to search and sort durable specifications.

#### Scenario: Search specifications by name or purpose
- **WHEN** user types a query in the durable specs search field
- **THEN** only specifications matching the query in their name or purpose description are shown

#### Scenario: Sort specifications
- **WHEN** user changes the sort option in durable specs view
- **THEN** specifications are sorted according to the selected option (alphabetically or by number of requirements)

### Requirement: Archived History Filtering and Sorting
The studio dashboard SHALL allow users to search and sort archived changes.

#### Scenario: Search archived changes
- **WHEN** user types a query in the archived history search field
- **THEN** only archived changes whose name matches the query are displayed

#### Scenario: Sort archived changes by date
- **WHEN** user toggles archived sort order
- **THEN** archived changes are sorted by archive date descending (newest first) or ascending (oldest first)

### Requirement: Dashboard Preferences Persistence
The dashboard SHALL persist user sorting and filtering preferences across webview reloads and sessions.

#### Scenario: Restoring preferences on reload
- **WHEN** user reloads or re-opens the studio dashboard tab
- **THEN** previously selected sort criteria and active filter settings are automatically restored from persistent storage

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
