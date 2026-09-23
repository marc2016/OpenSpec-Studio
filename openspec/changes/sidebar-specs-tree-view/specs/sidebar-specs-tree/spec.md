# Spec Delta: sidebar-specs-tree

## Purpose

Provides a native VS Code sidebar tree view that enables developers to browse, inspect, and navigate OpenSpec specifications, active changes, and planning artifacts directly from the Activity Bar with single-click file opening.

## ADDED Requirements

### Requirement: Hierarchical Tree Presentation in Activity Bar
The system SHALL provide a native TreeView (`TreeDataProvider`) within the OpenSpec Studio view container that hierarchically presents Specifications, Active Changes, and Archived History.

#### Scenario: Displaying tree categories
- **WHEN** the user opens the OpenSpec Studio sidebar view in VS Code
- **THEN** the system displays top-level collapsible sections for Specifications, Active Changes, and Archived History

#### Scenario: Displaying active change artifacts
- **WHEN** the user expands an active change node in the sidebar tree
- **THEN** the system lists its child artifact files including `proposal.md`, `specs/`, `design.md`, and `tasks.md`

### Requirement: Click-to-Open File Navigation
The system SHALL open the corresponding markdown or spec file in the active editor column when the user clicks on any file node in the sidebar tree view.

#### Scenario: Clicking an artifact file node
- **WHEN** the user clicks on a `proposal.md`, `design.md`, or `tasks.md` tree item
- **THEN** the system executes `vscode.open` to display the file in an editor tab

#### Scenario: Clicking a durable specification node
- **WHEN** the user clicks on a specification capability or `spec.md` node
- **THEN** the system opens the corresponding `spec.md` file in an editor tab

### Requirement: Contextual Icons and Progress Badges
The system SHALL render distinct, descriptive icons and progress descriptions for each tree node type to clearly differentiate specs, changes, and task completion.

#### Scenario: Visual indicators for active change items
- **WHEN** active changes are rendered in the tree view
- **THEN** each change displays a Git pull request icon, status description, and task completion count (e.g. "3/5 tasks")

#### Scenario: Visual indicators for artifact types
- **WHEN** change artifacts are rendered
- **THEN** proposals display document icons, tasks display checklist icons, designs display architecture icons, and specs display book icons

### Requirement: Real-time Tree Synchronization
The system SHALL automatically refresh the sidebar tree view in real time when files inside the `openspec/` directory are created, modified, or deleted.

#### Scenario: Updating tree on file modification
- **WHEN** a task in `tasks.md` is checked off or a new change directory is created
- **THEN** the tree view automatically refreshes to display updated task progress and file structure without manual reloading
