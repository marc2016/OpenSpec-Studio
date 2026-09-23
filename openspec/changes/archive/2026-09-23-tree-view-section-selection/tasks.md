# Tasks

## 1. Data Model & Parsing

- [x] 1.1 Add `startLine: number` and `endLine: number` to `SpecRequirement` interface in `src/core/WorkspaceDetector.ts`
- [x] 1.2 Implement section line range calculation in `WorkspaceDetector.parseSpecFile` and verify line ranges with tests in `test/detector.test.ts`

## 2. Command & Tree Item Selection

- [x] 2.1 Register command `openspec-studio.openFileRange` in `src/extension.ts` to open documents and set `editor.selection` spanning the requirement line range
- [x] 2.2 Update `SpecsTreeDataProvider.ts` to bind requirement items to `openspec-studio.openFileRange` with startLine and endLine arguments

## 3. Verification & Testing

- [x] 3.1 Update unit tests in `test/specsTree.test.ts` to verify requirement tree items configure `openspec-studio.openFileRange`
- [x] 3.2 Execute complete test suite (`npm run test`) and verify bundle build (`npm run build`) succeeds cleanly
