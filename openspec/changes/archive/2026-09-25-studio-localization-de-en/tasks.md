# Tasks

## 1. Type Definitions & Host Detection

- [x] 1.1 Add `locale?: 'en' | 'de'` to `OpenSpecState` in `src/shared/types.ts` and verify with `npm run compile`
- [x] 1.2 Update `src/core/StudioDashboardPanel.ts` to inspect `vscode.env.language` and broadcast resolved `locale` in `broadcastState()`
- [x] 1.3 Update `src/webview/hooks/useVscodeApi.ts` to expose `locale` from state with fallback to `navigator.language`

## 2. Localization Infrastructure & Catalogs

- [x] 2.1 Implement English dictionary in `src/webview/i18n/en.ts` covering header, workflows, tabs, change cards, specs explorer, history, Git modal, onboarding, and filter/sort toolbars
- [x] 2.2 Implement German dictionary in `src/webview/i18n/de.ts` with strict TypeScript key parity against English `TranslationSchema`
- [x] 2.3 Implement translation lookup function `t(key, params)` and `I18nContext` / `useTranslation()` in `src/webview/i18n/index.ts`
- [x] 2.4 Create unit tests in `test/i18n.test.ts` verifying translation key parity between English and German, interpolation, and fallback behavior with `npm run test`

## 3. Webview Component Localization

- [x] 3.1 Localize `src/webview/components/Header.tsx` and `src/webview/components/WorkflowBar.tsx` using `useTranslation`
- [x] 3.2 Localize `src/webview/components/ActiveChangesGrid.tsx` and `src/webview/components/ui/FilterSortToolbar.tsx`
- [x] 3.3 Localize `src/webview/components/SpecsExplorer.tsx` and `src/webview/components/ArchivedHistory.tsx`
- [x] 3.4 Localize `src/webview/components/GitShareModal.tsx` and `src/webview/components/OnboardingView.tsx`
- [x] 3.5 Localize navigation tab titles and toast notification labels in `src/webview/App.tsx`

## 4. End-to-End Verification

- [x] 4.1 Run full build with `npm run build` and verify that the extension and webview bundle compile without errors
- [x] 4.2 Run test suite with `npm run test` and verify that all test suites pass cleanly
