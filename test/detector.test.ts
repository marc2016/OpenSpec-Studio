import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { WorkspaceDetector } from '../src/core/WorkspaceDetector';
import { CliAdapter } from '../src/core/CliAdapter';
import * as path from 'path';
import * as fs from 'fs';

// Mock vscode module for node test runner
vi.mock('vscode', () => ({
  workspace: {
    createFileSystemWatcher: vi.fn().mockReturnValue({
      onDidCreate: vi.fn(),
      onDidChange: vi.fn(),
      onDidDelete: vi.fn(),
      dispose: vi.fn()
    })
  },
  RelativePattern: vi.fn(),
  EventEmitter: class {
    event = vi.fn();
    fire = vi.fn();
    dispose = vi.fn();
  }
}));

describe('WorkspaceDetector and CliAdapter', () => {
  const root = path.resolve(__dirname, '..');
  const cli = new CliAdapter();
  const detector = new WorkspaceDetector(root, cli);
  const tempChangeDir = path.join(root, 'openspec', 'changes', 'test-detector-change');

  beforeAll(() => {
    fs.mkdirSync(tempChangeDir, { recursive: true });
    fs.writeFileSync(path.join(tempChangeDir, 'proposal.md'), '# Proposal');
    fs.writeFileSync(path.join(tempChangeDir, 'design.md'), '# Design');
    fs.writeFileSync(path.join(tempChangeDir, 'tasks.md'), '- [x] Initialize\n- [ ] Follow up');
    fs.mkdirSync(path.join(tempChangeDir, 'specs'), { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(tempChangeDir)) {
      fs.rmSync(tempChangeDir, { recursive: true, force: true });
    }
  });

  it('detects existing openspec directory', () => {
    expect(detector.hasOpenSpecDirectory()).toBe(true);
    expect(detector.getOpenSpecRoot()).toContain('openspec');
  });

  it('reads active change and tasks', async () => {
    const changes = await detector.getActiveChanges();
    expect(changes.length).toBeGreaterThan(0);
    const testChange = changes.find(c => c.name === 'test-detector-change');
    expect(testChange).toBeDefined();
    expect(testChange?.tasks.length).toBe(2);
    expect(testChange?.completedTasks).toBe(1);
    expect(testChange?.totalTasks).toBe(2);
    expect(testChange?.artifacts.length).toBe(4);
    expect(testChange?.lastModified).toBeTypeOf('number');
    expect(testChange?.lastModified).toBeGreaterThan(0);
  });

  it('reads spec files correctly', async () => {
    const changeTasks = detector.parseTasks(path.join(tempChangeDir, 'tasks.md'));
    expect(changeTasks.length).toBe(2);
    expect(changeTasks[0].done).toBe(true);
    expect(changeTasks[0].description).toBe('Initialize');
    expect(changeTasks[1].done).toBe(false);
  });

  it('caches specs in memory based on mtime', async () => {
    detector.clearSpecsCache();
    const specs1 = await detector.getSpecs();
    expect(specs1.length).toBeGreaterThan(0);
    const specs2 = await detector.getSpecs();
    expect(specs2.length).toBe(specs1.length);
    expect(specs2[0]).toBe(specs1[0]);
  });

  it('resolves CLI info with auto mode and caches result', async () => {
    cli.clearCache();
    const cliInfo = await cli.resolveCli(root);
    expect(cliInfo.isAvailable).toBe(true);
    expect(['local', 'global', 'npx']).toContain(cliInfo.mode);
    const cachedInfo = await cli.resolveCli(root);
    expect(cachedInfo).toBe(cliInfo);
  });

  it('updates task progress dynamically when tasks change', async () => {
    fs.writeFileSync(path.join(tempChangeDir, 'tasks.md'), '- [x] Initialize\n- [x] Follow up');
    const changes = await detector.getActiveChanges();
    const testChange = changes.find(c => c.name === 'test-detector-change');
    expect(testChange).toBeDefined();
    expect(testChange!.completedTasks).toBe(2);
    expect(testChange!.totalTasks).toBe(2);
    expect(testChange!.status).toBe('Completed');
  });

  it('calculates startLine and endLine for spec requirements', () => {
    const specPath = path.join(
      root,
      'openspec',
      'specs',
      'specs-tree-view',
      'spec.md'
    );
    const parsed = (detector as any).parseSpecFile(specPath, 'specs-tree-view');
    expect(parsed.requirements.length).toBe(3);
    expect(parsed.requirements[0].startLine).toBeDefined();
    expect(parsed.requirements[0].endLine).toBeGreaterThan(parsed.requirements[0].startLine);
    expect(parsed.requirements[1].startLine).toBeGreaterThan(parsed.requirements[0].endLine);
    expect(parsed.requirements[2].startLine).toBeGreaterThan(parsed.requirements[1].endLine);
  });
});
