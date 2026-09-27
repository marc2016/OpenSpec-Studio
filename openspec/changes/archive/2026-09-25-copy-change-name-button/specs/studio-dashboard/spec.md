# Spec Delta

## MODIFIED Requirements

### Requirement: Active changes presentation
The system SHALL render all active changes in the workspace with status badges, task completion progress, linked artifacts, quick action buttons, and a one-click clipboard copy action for the change name.

#### Scenario: Displaying change progress
- **WHEN** active changes exist with tasks in `tasks.md`
- **THEN** the dashboard displays a visual progress bar indicating completed tasks versus total tasks for each change

#### Scenario: Copying change name to clipboard
- **WHEN** the user clicks the copy button next to the change name on an active change card
- **THEN** the system copies the change name string to the system clipboard without toggling card expansion, and displays temporary visual confirmation (e.g. checkmark icon and "Copied!" tooltip state)
