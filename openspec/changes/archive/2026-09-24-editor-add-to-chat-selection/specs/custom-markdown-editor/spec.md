# Spec Delta: custom-markdown-editor

## ADDED Requirements

### Requirement: Contextual Selection Action for AI Chat
The system SHALL display a floating action bubble when text is selected in the custom markdown editor, allowing users to send the selected text and document reference to the AI chat assistant.

#### Scenario: User sends selection to chat
- **WHEN** user selects text in the custom markdown editor and clicks the Add to Chat action
- **THEN** the system opens the AI chat assistant pre-populated with a reference to the active document and the selected text block

#### Scenario: Selection is dismissed
- **WHEN** user clears the text selection or clicks outside the selection
- **THEN** the floating action bubble is hidden
