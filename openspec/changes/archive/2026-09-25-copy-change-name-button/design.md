# Design

## Context

In `ActiveChangesGrid.tsx`, active change cards are rendered with a clickable `<CardHeader>` that toggles card expansion. The change name is rendered in `<CardTitle>`. Users frequently need to copy the change name to use in CLI commands or messages.

See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a responsive inline copy button immediately adjacent to the change title.
- Copy `change.name` to the system clipboard upon click.
- Prevent card toggle expansion when clicking the copy button (`e.stopPropagation()`).
- Provide clear visual feedback: swap the icon to a checkmark (`mdiCheck`) and update tooltip text for 2 seconds.
- Provide localized tooltips and confirmation messages in English and German.

**Non-Goals:**
- Copying change descriptions, tasks, or full branch URLs (branch sharing is already supported via GitShareModal).
- Displaying full-screen toast notifications that obscure dashboard content for simple clipboard operations.

## Decisions

### Decision 1: Inline placement next to change title
- **Choice**: Place a compact icon button (`w-3.5 h-3.5`) inside a flex container alongside `<CardTitle>`.
- **Alternatives considered**:
  - Adding another button to the right-hand action bar: Rejected because the right-hand area is reserved for major workflow actions (Run Apply, Branch, Share, Open Folder). An inline button makes the direct relationship to the title obvious.
  - Making the entire title text clickable to copy: Rejected because clicking the header already expands/collapses the card.

### Decision 2: Feedback and state handling
- **Choice**: Use a local `copiedName: string | null` React state in `ActiveChangesGrid`. When clicked, set `copiedName` to `change.name` and schedule a 2000ms `setTimeout` to clear it.
- **Alternatives considered**:
  - Per-card child component wrapper: Rejected as unnecessary complexity for a simple inline icon state.

### Decision 3: Clipboard API with legacy fallback
- **Choice**: Invoke `navigator.clipboard?.writeText(name)` with a graceful fallback to a temporary `textarea` + `document.execCommand('copy')` if clipboard permissions are restricted in certain VS Code webview environments.

## Risks / Trade-offs

- **[Card expansion triggered on click]** → Add `e.stopPropagation()` and `e.preventDefault()` to the button click handler.
- **[Restricted clipboard in webview]** → Wrap in `try/catch` and provide legacy fallback so copying never throws unhandled errors.
