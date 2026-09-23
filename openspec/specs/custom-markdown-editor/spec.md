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
