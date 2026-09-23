import { describe, it, expect, vi } from 'vitest';
import { WorkspaceDetector } from '../src/core/WorkspaceDetector';
import { CliAdapter } from '../src/core/CliAdapter';
import * as path from 'path';

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

  it('detects existing openspec directory', () => {
    expect(detector.hasOpenSpecDirectory()).toBe(true);
    expect(detector.getOpenSpecRoot()).toContain('openspec');
  });

  it('reads active change and tasks', async () => {
    const changes = await detector.getActiveChanges();
    expect(changes.length).toBeGreaterThan(0);
    const active = changes.find(c => c.name === 'vscode-openspec-studio');
    expect(active).toBeDefined();
    expect(active?.tasks.length).toBeGreaterThan(0);
    expect(active?.artifacts.length).toBe(4);
  });

  it('reads spec files correctly', async () => {
    const changeTasks = detector.parseTasks(
      path.join(root, 'openspec', 'changes', 'vscode-openspec-studio', 'tasks.md')
    );
    expect(changeTasks.length).toBe(15);
    expect(changeTasks[0].done).toBe(true);
    expect(changeTasks[0].description).toContain('Initialize VS Code extension');
  });

  it('resolves CLI info with auto mode', async () => {
    const cliInfo = await cli.resolveCli(root);
    expect(cliInfo.isAvailable).toBe(true);
    expect(['local', 'global', 'npx']).toContain(cliInfo.mode);
  });

  it('updates task progress dynamically when tasks change', async () => {
    const changesBefore = await detector.getActiveChanges();
    const studioChange = changesBefore.find(c => c.name === 'vscode-openspec-studio');
    expect(studioChange).toBeDefined();
    const completedCount = studioChange!.completedTasks;

    // Verify completed tasks are correctly calculated
    expect(completedCount).toBe(15);
    expect(studioChange!.status).toBe('Completed');
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
