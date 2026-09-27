# Proposal

## Why

OpenSpec Studio is currently hardcoded in English, which presents a language barrier for German-speaking teams, non-technical stakeholders (such as German product managers, domain experts, and requirements engineers), and mixed-language organizations.

Rather than forcing users to manually select and configure language settings inside the studio, the application should automatically detect VS Code's active display language (`vscode.env.language`) and provide seamless localization in both German and English.

## What Changes

- Introduce a new `studio-localization` capability:
  - Automatically detect the VS Code UI display language via `vscode.env.language` on the extension host.
  - Broadcast the resolved locale (`'de'` or `'en'`) to the dashboard and editor webviews via `OpenSpecState`.
  - Provide a lightweight, type-safe i18n translation system supporting German (`de`) and English (`en`).
  - Translate all dashboard UI elements:
    - Header (status badges, AI selector labels, refresh tooltip)
    - Workflow actions (Propose, Explore, Apply, Sync, Archive)
    - Navigation tabs (Active Changes, Durable Specs, Archived History)
    - Active change cards (tasks breakdown, status badges, empty states, action buttons)
    - Specs explorer and archived change lists
    - Filter and sort toolbars (placeholders, option labels, clear filters button)
    - Git branch and share modal (`GitShareModal`)
    - Toast notifications and system messages
  - Fallback gracefully to English (`en`) for any unsupported locale.
  - Support automatic language updates when VS Code's display language changes.

## Capabilities

### New Capabilities
- `studio-localization`: Automatic VS Code locale detection and comprehensive German and English translation dictionary for all OpenSpec Studio user interfaces.

### Modified Capabilities

## Impact

- `src/shared/types.ts`: Add `locale: 'en' | 'de'` to `OpenSpecState`.
- `src/core/StudioDashboardPanel.ts`: Pass `vscode.env.language` to webview state.
- `src/webview/i18n/`: New localization dictionary and `useTranslation` / `t` helper.
- `src/webview/components/`: Update `Header`, `WorkflowBar`, `ActiveChangesGrid`, `SpecsExplorer`, `ArchivedHistory`, `GitShareModal`, `FilterSortToolbar`, and `OnboardingView` to use localized string keys.
