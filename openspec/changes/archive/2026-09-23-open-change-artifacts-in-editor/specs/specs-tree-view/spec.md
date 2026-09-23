# Spec Delta: specs-tree-view

## ADDED Requirements

### Requirement: Change artifact tree items open in markdown editor
The system SHALL open change planning artifacts (`proposal.md`, `tasks.md`, `design.md`, and other markdown change artifacts) in the OpenSpec Markdown Editor when clicked in the Active Changes section of the OpenSpec Explorer sidebar.

#### Scenario: User clicks change artifact item in tree
- **WHEN** user clicks on a change planning artifact such as `proposal.md`, `tasks.md`, or `design.md` under an active change in the OpenSpec Explorer
- **THEN** the system executes the custom editor command to open the artifact in the OpenSpec Markdown Editor
