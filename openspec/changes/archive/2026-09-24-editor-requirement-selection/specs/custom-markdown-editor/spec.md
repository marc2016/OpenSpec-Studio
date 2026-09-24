# Spec Delta

## ADDED Requirements

### Requirement: Target Section Navigation and Highlighting
The OpenSpec Markdown Editor SHALL support navigating to a specific requirement section when instructed via navigation messages or initialization options, scrolling the requirement heading into view and applying a distinct visual highlight to the section.

#### Scenario: Navigating to requirement in active editor
- **WHEN** the custom editor receives a navigation command targeting a requirement name
- **THEN** the editor locates the corresponding requirement heading in the visual DOM, smoothly scrolls it into view, and applies a temporary highlight animation to the section

#### Scenario: Opening editor with initial target requirement
- **WHEN** the custom editor is opened with an initial target requirement
- **THEN** after mounting, the editor automatically scrolls the target requirement into view and applies the highlight animation
