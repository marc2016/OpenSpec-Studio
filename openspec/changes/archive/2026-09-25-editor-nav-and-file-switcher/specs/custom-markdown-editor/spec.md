# Spec Delta: custom-markdown-editor

## ADDED Requirements

### Requirement: Dashboard Navigation from Editor Header
The OpenSpec Markdown Editor SHALL provide a dedicated navigation action in the top header bar that returns the user directly to the OpenSpec Studio Dashboard.

#### Scenario: User navigates to dashboard from editor header
- **WHEN** user clicks the Dashboard navigation button in the editor top header
- **THEN** the system executes the command to reveal or open the OpenSpec Studio Dashboard panel

### Requirement: Related Change Artifacts Switching
When editing a document belonging to an OpenSpec change, the OpenSpec Markdown Editor SHALL provide a navigation control in the top header displaying sibling planning artifacts and allowing immediate switching between them.

#### Scenario: Displaying related artifacts for an active change
- **WHEN** the editor loads an OpenSpec change document
- **THEN** the header displays access to the sibling artifacts of the change (including proposal, design, tasks, and delta specifications)

#### Scenario: Switching to another change artifact
- **WHEN** user selects a sibling artifact from the header navigation control
- **THEN** the system opens the selected artifact in the OpenSpec Markdown Editor
