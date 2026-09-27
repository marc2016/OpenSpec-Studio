# Design

## Context

See `proposal.md` for motivation. Currently, `SpecsExplorer.tsx` renders expanded requirements and their scenarios in an unformatted list using `text-[11px]` and monospace font.

## Goals / Non-Goals

**Goals:**
- Upgrade font sizes and weights in `SpecsExplorer.tsx`:
  - Requirement titles: `text-sm font-semibold`
  - Requirement descriptions: `text-xs leading-relaxed text-vscode-fg/80`
  - Scenario names: `text-xs font-semibold text-vscode-fg`
  - Scenario text: `text-xs leading-relaxed text-vscode-fg/90`
- Wrap each scenario in a distinct card container with subtle borders and padding.
- Render WHEN and THEN keywords as distinct pill badges (`sky-400` for WHEN and `emerald-400` for THEN) while keeping condition and outcome text in readable sans-serif font.
- Add a scenario count badge to each requirement header (e.g. `2 Scenarios` or localized plural).

**Non-Goals:**
- Changing backend spec extraction logic in `WorkspaceDetector.ts` or `SpecsTreeDataProvider.ts`.
- Sub-accordion collapsing for individual requirements (kept all visible upon expanding spec as selected in Option A).

## Decisions

1. **Pill Badges for Gherkin Keywords**:
   - *Chosen*: Styled mini-badges with background tints and colored borders:
     - `WHEN`: `bg-sky-500/15 text-sky-400 border border-sky-500/30 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded`
     - `THEN`: `bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded`
   - *Alternative*: Plain text keywords. Plain text blends in too much with the condition text.
2. **Typography Scale**:
   - *Chosen*: `text-xs` (12px) for details and `text-sm` (14px) for titles, avoiding tiny `11px` for body text.
3. **Localization**:
   - Add translation key `specs.scenariosCount` with plural support in `en.json` and `de.json`.

## Risks / Trade-offs

- [Vertical height increase] → Scenario cards will take slightly more vertical height than 11px text walls. Mitigated by clean grouping, making visual scanning much faster.
