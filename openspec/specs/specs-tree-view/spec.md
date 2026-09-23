# Specification: specs-tree-view

## Purpose

Provides tree navigation for OpenSpec specifications and enables targeted section highlighting in the markdown editor when clicking requirement items.

## Requirements

### Requirement: Requirement tree items select section in editor
When a requirement tree item in the OpenSpec Explorer is clicked, the system SHALL open the containing specification markdown document and select the entire line range spanning from the requirement heading to the beginning of the next requirement or section.

#### Scenario: User clicks requirement node in tree
- **WHEN** user clicks on a requirement tree item in the OpenSpec Explorer
- **THEN** the editor opens the corresponding spec markdown file, sets the editor selection across all lines of that requirement section, and scrolls the selection into view

### Requirement: Requirement line range calculation
The system SHALL determine the starting line number and ending line number of each requirement in a spec markdown document during parsing.

#### Scenario: Parsing multiple requirements in a spec file
- **WHEN** a spec file with multiple requirements and scenarios is parsed
- **THEN** each requirement object contains startLine pointing to the heading line and endLine pointing to the last line before the subsequent section or end of file

### Requirement: Change artifact tree items open in markdown editor
The system SHALL open change planning artifacts (`proposal.md`, `tasks.md`, `design.md`, and other markdown change artifacts) in the OpenSpec Markdown Editor when clicked in the Active Changes section of the OpenSpec Explorer sidebar.

#### Scenario: User clicks change artifact item in tree
- **WHEN** user clicks on a change planning artifact such as `proposal.md`, `tasks.md`, or `design.md` under an active change in the OpenSpec Explorer
- **THEN** the system executes the custom editor command to open the artifact in the OpenSpec Markdown Editor
