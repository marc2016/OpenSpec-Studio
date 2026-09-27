# Design

## Context

See [proposal.md](file:///Users/marclammers/sources/OpenSpec-Studio/openspec/changes/studio-localization-de-en/proposal.md) for problem statement and motivation.

OpenSpec Studio operates inside VS Code, where the user's preferred language is configured at the IDE level and exposed via `vscode.env.language` (e.g. `'de'`, `'de-de'`, `'en'`, `'en-us'`). To deliver a native, frictionless experience without requiring users to configure language settings inside the studio, the application will detect the host language and provide complete German and English catalogs.

## Goals / Non-Goals

**Goals:**
- Detect VS Code's active UI language in the extension host and communicate `locale: 'en' | 'de'` to the dashboard webview via `OpenSpecState`.
- Provide a zero-dependency, type-safe translation architecture (`src/webview/i18n/`) with full key parity between English and German.
- Support string interpolation (e.g. `t('tasks.progress', { completed: 3, total: 5, percent: 60 })`).
- Support language-sensitive pluralization (e.g. `1 geänderte Datei` vs `2 geänderte Dateien`).
- Update all webview components (`Header`, `WorkflowBar`, `ActiveChangesGrid`, `SpecsExplorer`, `ArchivedHistory`, `GitShareModal`, `OnboardingView`, and `FilterSortToolbar`) to use localized string keys.
- Fallback gracefully to English if the VS Code environment is set to any unsupported language or undefined.

**Non-Goals:**
- Providing a manual language selector or configuration setting in the UI (the language must follow VS Code's setting automatically as requested).
- Translating the content of user markdown specs, change proposals, or Git commit messages entered by the user.
- Introducing large third-party i18n runtimes (`react-i18next`, `formatjs`), keeping the webview bundle lean and fast.

## Decisions

### Decision 1: Extension Host Language Detection with Webview Navigator Fallback
- **Choice**: The VS Code extension host reads `vscode.env.language` (normalizing `'de'`, `'de-*'` to `'de'`, all others to `'en'`) and includes `locale: 'de' | 'en'` in `OpenSpecState`. In addition, the webview hook checks `navigator.language` as a fallback when running in standalone browser mode or before the initial host state update arrives.
- **Rationale**: VS Code's `vscode.env.language` is the single source of truth for the user's IDE display language. Sending it in `OpenSpecState` ensures perfect synchronization without extra message round-trips.
- **Alternatives Considered**: 
  - *Reading `navigator.language` directly in the webview*: May reflect the OS or browser language rather than VS Code's installed language pack.

### Decision 2: Zero-Dependency Type-Safe Translation Catalog
- **Choice**: Structure translations as nested TypeScript record objects with the English dictionary (`en.ts`) serving as the source-of-truth schema. TypeScript enforces that `de.ts` implements the exact same keys:
  ```ts
  export type TranslationSchema = typeof en;
  export const de: TranslationSchema = { ... };
  ```
- **Rationale**: Zero external runtime dependencies, minimal bundle size impact (< 15 KB), and compile-time verification that every German key exists for every English key.
- **Alternatives Considered**: 
  - *JSON files with `i18next`*: Adds 50+ KB of bundle size, requires async loading, and lacks compile-time key checking.

### Decision 3: Translation Context and Hook
- **Choice**: Provide an `I18nProvider` or hook `useTranslation()` that receives the active locale from `useOpenSpecStudio()` and exposes a helper `t(keyPath, params)`:
  - Supports dot-notation paths (e.g. `t('header.title')`, `t('tabs.activeChanges')`).
  - Supports curly-brace interpolation (e.g. `{count}`).
  - Fallback logic: if a key is missing in German, it falls back to English, then to the raw key string.
- **Rationale**: Ergonomic developer experience in React components matching modern frontend standards.

## Risks / Trade-offs

- **[Risk] Regional German Locales (`de-CH`, `de-AT`) Not Recognized** → *Mitigation*: Match locale using `lang.toLowerCase().startsWith('de')`.
- **[Risk] Layout wrapping due to longer German words (e.g., "Dauerhafte Spezifikationen")** → *Mitigation*: Review component flex layouts, button widths, and badges using responsive Tailwind classes with truncation or wrapping guards.
