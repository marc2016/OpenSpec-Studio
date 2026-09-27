# Tasks

## 1. Localization Strings

- [x] 1.1 Add translation keys `copyName: 'Copy change name'` and `copiedName: 'Copied!'` to `activeChanges` in `src/webview/i18n/en.ts`
- [x] 1.2 Add matching German translation keys `copyName: 'Änderungsnamen kopieren'` and `copiedName: 'Kopiert!'` to `activeChanges` in `src/webview/i18n/de.ts`
- [x] 1.3 Verify translation schema key parity between English and German catalogs with `npm run test`

## 2. ActiveChangesGrid UI Implementation

- [x] 2.1 Implement `handleCopyChangeName` utility with `navigator.clipboard.writeText` and fallback in `src/webview/components/ActiveChangesGrid.tsx`
- [x] 2.2 Add inline copy button adjacent to `CardTitle` with `mdiContentCopy` / `mdiCheck` icons, localized tooltip, and `e.stopPropagation()` in `src/webview/components/ActiveChangesGrid.tsx`
- [x] 2.3 Verify webview bundle builds cleanly with `npm run build`

## 3. Verification

- [x] 3.1 Run complete test suite with `npm run test` to verify 100% test pass rate
- [x] 3.2 Validate OpenSpec change with `openspec validate copy-change-name-button --strict`
