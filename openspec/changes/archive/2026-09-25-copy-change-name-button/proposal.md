# Proposal

## Why

Developers and collaborators frequently need to copy and paste the exact change name (for example, when running OpenSpec CLI commands in the terminal, naming branches, or discussing changes in chat). Currently, users must manually select and copy text from the dashboard card. Adding a dedicated one-click copy button next to the change title eliminates manual selection friction and prevents typos.

## What Changes

- Add an accessible, discrete copy button next to the change name on each active change card in `ActiveChangesGrid`.
- Clicking the button writes the change name directly to the system clipboard via `navigator.clipboard.writeText`.
- Provide temporary visual feedback upon copying by displaying a checkmark icon and updating the tooltip state ("Copied!" / "Kopiert!") for 2 seconds.
- Stop click event propagation on the copy button to prevent unintentionally toggling the card's expanded state.
- Add English and German localization strings for the copy button tooltip and copied confirmation state.

## Capabilities

### Modified Capabilities

- `studio-dashboard`: Update active changes presentation to include a one-click change name copy action with visual confirmation feedback.

## Impact

- Webview UI: `src/webview/components/ActiveChangesGrid.tsx`.
- Localization catalogs: `src/webview/i18n/en.ts` and `src/webview/i18n/de.ts`.
- No API or breaking schema changes; backward-compatible enhancement to the dashboard interface.
