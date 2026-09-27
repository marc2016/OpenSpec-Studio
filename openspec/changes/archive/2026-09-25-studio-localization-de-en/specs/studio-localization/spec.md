# Spec Delta

## Purpose

Provides automatic localization for OpenSpec Studio in German and English based on the active VS Code display language without manual user configuration.

## ADDED Requirements

### Requirement: Automatic Locale Detection from VS Code
The system SHALL automatically detect the host editor's configured display language and map it to a supported locale without requiring manual user selection.

#### Scenario: German language environment detected
- **WHEN** VS Code is running with language set to `de` or a German regional variant (such as `de-DE`, `de-AT`, or `de-CH`)
- **THEN** the system resolves the active locale to German (`de`) and renders all user interface elements in German

#### Scenario: Non-German language environment fallback
- **WHEN** VS Code is running with English, an unsupported language, or undefined locale
- **THEN** the system defaults to English (`en`) and renders all user interface elements in English

### Requirement: Comprehensive German and English Translations
The system SHALL provide full translation catalogs for all user-facing texts across OpenSpec Studio, including headers, navigation tabs, workflow action triggers, status filters, sorting options, task progress, empty states, modals, and notifications.

#### Scenario: German UI text rendering
- **WHEN** the resolved locale is German (`de`)
- **THEN** the interface renders German titles, labels, badges, and tooltips (e.g., "Aktive Änderungen", "Dauerhafte Spezifikationen", "Änderung vorschlagen", "Speichern & Teilen")

#### Scenario: English UI text rendering
- **WHEN** the resolved locale is English (`en`)
- **THEN** the interface renders English titles, labels, badges, and tooltips (e.g., "Active Changes", "Durable Specs", "Propose Change", "Save & Share")

### Requirement: Dynamic Interpolation and Pluralization
The system SHALL support parameterized string interpolation for dynamic values such as counts, percentages, and entity names.

#### Scenario: Formatting task counts and progress
- **WHEN** rendering change task counters with dynamic numbers (e.g. 5 completed out of 10)
- **THEN** the system correctly interpolates the numbers according to the active locale (e.g. `5 von 10 Aufgaben (50%)` in German and `5 / 10 tasks (50%)` in English)

#### Scenario: Formatting modified files count
- **WHEN** displaying the count of uncommitted files in Git indicators or modals
- **THEN** the system applies pluralization rules appropriate for the active locale (e.g. `1 geänderte Datei` vs `3 geänderte Dateien` in German)

### Requirement: Missing Key and Fallback Safety
The system SHALL ensure that missing translation keys never throw runtime exceptions or render blank labels.

#### Scenario: Fallback on missing key
- **WHEN** a translation key is queried that is missing from the active locale catalog
- **THEN** the system falls back to the English translation or key name without crashing the webview
