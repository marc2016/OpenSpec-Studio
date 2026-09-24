# Specification: cli-adapter

## Purpose

Discovers, resolves, and executes OpenSpec CLI commands via local project dependencies, global system path, or npx fallback, providing automated installation and project initialization.

## Requirements

### Requirement: OpenSpec CLI resolution
The system SHALL attempt to resolve the OpenSpec CLI executable by checking the local project `node_modules/.bin/openspec`, global PATH `openspec`, and falling back to `npx openspec`.

#### Scenario: Local project CLI takes precedence
- **WHEN** a local `openspec` binary exists in `node_modules/.bin/`
- **THEN** the system executes OpenSpec commands using the local binary

#### Scenario: Fallback to npx
- **WHEN** neither local nor global `openspec` binaries are found
- **THEN** the system executes OpenSpec commands via `npx --yes openspec`

### Requirement: One-click OpenSpec initialization
The system SHALL provide an action in the onboarding state to initialize OpenSpec in the active project.

#### Scenario: User clicks initialize OpenSpec
- **WHEN** the user triggers the initialize action from the onboarding screen
- **THEN** the system executes `openspec init` in the project root and updates the dashboard upon completion

### Requirement: One-click OpenSpec local installation
The system SHALL provide an action in the onboarding state to install OpenSpec as a project development dependency.

#### Scenario: User installs OpenSpec locally
- **WHEN** the user triggers the install CLI action
- **THEN** the system runs the package manager install command (e.g. `npm install -D openspec`) in an integrated terminal
