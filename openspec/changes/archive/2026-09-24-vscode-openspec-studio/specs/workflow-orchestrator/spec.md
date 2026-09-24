# Spec Delta: workflow-orchestrator

## Purpose

Enables one-click triggering of OpenSpec workflow steps and dispatches workflow instructions across multiple supported AI assistants or fallback channels.

## ADDED Requirements

### Requirement: Workflow action buttons
The system SHALL provide action buttons for core OpenSpec workflows including Propose, Explore, Apply, Sync, and Archive in the dashboard interface.

#### Scenario: Triggering propose action
- **WHEN** the user clicks the Propose button and provides a description or change name
- **THEN** the system generates the appropriate workflow command and sends it to the selected AI target

#### Scenario: Triggering apply action for a change
- **WHEN** the user clicks Apply on an active change card
- **THEN** the system dispatches the apply command for that specific change to the selected AI target

### Requirement: Multi-AI target dispatching
The system SHALL support dispatching workflow actions to configurable AI targets, including GitHub Copilot Chat, external agents, terminal execution, or system clipboard.

#### Scenario: Dispatching to GitHub Copilot Chat
- **WHEN** the active AI target is set to GitHub Copilot and a workflow action is triggered
- **THEN** the system opens the VS Code Copilot Chat window with the corresponding slash command and parameters pre-filled

#### Scenario: Fallback to clipboard
- **WHEN** the user selects clipboard dispatch or an AI chat extension is not installed
- **THEN** the system copies the workflow prompt to the system clipboard and notifies the user with a confirmation toast
