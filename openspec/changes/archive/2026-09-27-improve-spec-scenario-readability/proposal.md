# Proposal

## Why

When inspecting capability specifications in the OpenSpec Studio dashboard, the expanded details view currently renders requirement descriptions and scenarios in a very small 11px font and unformatted monospace blocks. This creates an overwhelming wall of text that makes it difficult to read and understand requirements and acceptance criteria at a glance.

Improving the visual hierarchy, typography, and scenario card presentation will make reviewing durable specifications significantly more pleasant, structured, and readable.

## What Changes

- Increase the typography scale for requirement titles (`text-sm font-semibold`), descriptions (`text-xs leading-relaxed`), and scenario details.
- Replace dense inline scenario text with dedicated, styled scenario cards featuring subtle borders and rounded corners.
- Render **WHEN** and **THEN** keywords as distinct, colored pill badges (sky-blue for WHEN, emerald-green for THEN) while displaying condition and expectation text in clean, readable sans-serif typography.
- Display a scenario count badge on requirement cards to give users an immediate sense of test coverage and complexity.

## Capabilities

### Modified Capabilities
- `studio-dashboard`: Enhance durable specs exploration with readable typography, structured scenario cards, and colored pill badges for WHEN/THEN steps.

## Impact

- Webview component `SpecsExplorer.tsx` in `src/webview/components/SpecsExplorer.tsx`.
- Localization strings in `src/webview/i18n/` if scenario count labels require localized plurals.
- Zero breaking changes to backend or data structures.
