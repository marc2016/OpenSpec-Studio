# Spec Delta

## MODIFIED Requirements

### Requirement: Durable specs exploration
The system SHALL list all durable capability specifications present in `openspec/specs/` and allow inspecting their requirements and scenarios with structured scenario cards, distinct WHEN/THEN badges, and clear typography.

#### Scenario: Inspecting capability details
- **WHEN** the user selects a capability in the specs list
- **THEN** the dashboard displays its requirements and associated scenarios in an expandable view with high-readability typography

#### Scenario: Scenario cards with WHEN and THEN badges
- **WHEN** the user expands a capability specification with scenarios
- **THEN** each scenario is rendered in an individual card with sky-blue WHEN and emerald-green THEN pill badges

#### Scenario: Requirement scenario count badge
- **WHEN** a requirement contains defined scenarios
- **THEN** the requirement card displays a badge indicating the total count of scenarios
