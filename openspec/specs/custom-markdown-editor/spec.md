# Specification: custom-markdown-editor

## Purpose

Enables rich WYSIWYG editing for OpenSpec markdown documents with formatting controls, source code toggle, and native VS Code editor integration.

## Requirements

### Requirement: Custom Editor Registration
The system SHALL provide a registered VS Code Custom Text Editor for OpenSpec markdown documents matching `**/openspec/**/*.md`.

#### Scenario: Opening an OpenSpec markdown file
- **WHEN** user opens an OpenSpec markdown file with OpenSpec Editor
- **THEN** the custom editor webview is loaded with the document contents

### Requirement: Visual Markdown Editing with Formatting Toolbar
The system SHALL display an interactive formatting toolbar at the top of the editor allowing users to format headings, bold, italic, lists, task checkboxes, code blocks, quotes, and tables.

#### Scenario: User applies formatting via toolbar
- **WHEN** user selects text or places cursor and clicks a toolbar formatting button
- **THEN** the editor applies the corresponding markdown formatting to the content

### Requirement: Source Code View Toggle
The system SHALL provide a toggle button to switch between the visual WYSIWYG view and the raw markdown source code editor within the same tab.

#### Scenario: User toggles source code view
- **WHEN** user clicks the source code toggle button
- **THEN** the editor displays the raw markdown text with syntax preserving all edits, and toggling back restores the visual rich-text view

### Requirement: Native Text Editor Switch
The system SHALL provide an action allowing the user to reopen the active document in VS Code's default plain text editor.

#### Scenario: User selects open in default editor
- **WHEN** user clicks the action to open in default text editor
- **THEN** VS Code executes the openWith command targeting the default text editor for the document URI

### Requirement: Document Synchronization and Save
The system SHALL synchronize webview content changes back to the VS Code text document using workspace edits, supporting dirty state tracking, undo/redo, and native saving.

#### Scenario: User edits content in webview
- **WHEN** user modifies text in the custom editor
- **THEN** the underlying VS Code document is updated, marking the tab dirty until saved

### Requirement: Contextual Selection Action for AI Chat
The system SHALL display a floating action bubble when text is selected in the custom markdown editor, allowing users to send the selected text and document reference to the AI chat assistant.

#### Scenario: User sends selection to chat
- **WHEN** user selects text in the custom markdown editor and clicks the Add to Chat action
- **THEN** the system opens the AI chat assistant pre-populated with a reference to the active document and the selected text block

#### Scenario: Selection is dismissed
- **WHEN** user clears the text selection or clicks outside the selection
- **THEN** the floating action bubble is hidden

### Requirement: Target Section Navigation and Highlighting
The OpenSpec Markdown Editor SHALL support navigating to a specific requirement section when instructed via navigation messages or initialization options, scrolling the requirement heading into view and applying a distinct visual highlight to the section.

#### Scenario: Navigating to requirement in active editor
- **WHEN** the custom editor receives a navigation command targeting a requirement name
- **THEN** the editor locates the corresponding requirement heading in the visual DOM, smoothly scrolls it into view, and applies a temporary highlight animation to the section

#### Scenario: Opening editor with initial target requirement
- **WHEN** the custom editor is opened with an initial target requirement
- **THEN** after mounting, the editor automatically scrolls the target requirement into view and applies the highlight animation
