import { describe, it, expect, vi } from 'vitest';
import * as path from 'path';
import { WorkspaceDetector } from '../src/core/WorkspaceDetector';
import { CliAdapter } from '../src/core/CliAdapter';
import { SpecsTreeDataProvider, SpecsTreeItem } from '../src/core/SpecsTreeDataProvider';

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
  Uri: {
    file: (f: string) => ({ fsPath: f, scheme: 'file' })
  },
  ThemeIcon: class {
    constructor(public readonly id: string) {}
  },
  TreeItem: class {
    public contextValue?: string;
    public iconPath?: any;
    public tooltip?: string;
    public description?: string;
    public resourceUri?: any;
    public command?: any;
    constructor(public label: string, public collapsibleState: number = 0) {}
  },
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2
  },
  RelativePattern: vi.fn(),
  EventEmitter: class {
    private listeners: any[] = [];
    event = (listener: any) => {
      this.listeners.push(listener);
      return { dispose: () => {} };
    };
    fire = (data: any) => {
      for (const l of this.listeners) l(data);
    };
    dispose = vi.fn();
  }
}));

describe('SpecsTreeDataProvider', () => {
  const root = path.resolve(__dirname, '..');
  const cli = new CliAdapter();
  const detector = new WorkspaceDetector(root, cli);
  const treeProvider = new SpecsTreeDataProvider(detector);

  it('provides root categories for Specifications, Active Changes, and Archived History', async () => {
    const rootItems = await treeProvider.getChildren();
    expect(rootItems.length).toBe(3);

    const labels = rootItems.map(item => item.label);
    expect(labels).toContain('Specifications');
    expect(labels).toContain('Active Changes');
    expect(labels).toContain('Archived History');
  });

  it('populates active changes under Active Changes category', async () => {
    const rootItems = await treeProvider.getChildren();
    const changesCategory = rootItems.find(item => item.label === 'Active Changes');
    expect(changesCategory).toBeDefined();

    const changeItems = await treeProvider.getChildren(changesCategory);
    expect(Array.isArray(changeItems)).toBe(true);
    expect(changeItems.length).toBeGreaterThan(0);
  });

  it('populates artifacts under an active change with open commands', async () => {
    const sampleChange: any = {
      name: 'sample-change',
      tasks: [{ id: 'task-1', description: 'Task 1', done: true }],
      totalTasks: 1,
      completedTasks: 1,
      status: 'Completed',
      artifacts: [
        { id: 'proposal', exists: true, path: path.join(root, 'openspec', 'changes', 'archive', '2026-09-24-vscode-openspec-studio', 'proposal.md') },
        { id: 'design', exists: true, path: path.join(root, 'openspec', 'changes', 'archive', '2026-09-24-vscode-openspec-studio', 'design.md') },
        { id: 'tasks', exists: true, path: path.join(root, 'openspec', 'changes', 'archive', '2026-09-24-vscode-openspec-studio', 'tasks.md') },
        { id: 'specs', exists: true, path: path.join(root, 'openspec', 'changes', 'archive', '2026-09-24-vscode-openspec-studio', 'specs') }
      ]
    };
    const changeNode = new SpecsTreeItem('sample-change', 'change', 1, undefined, { change: sampleChange });
    const artifacts = await treeProvider.getChildren(changeNode);
    expect(artifacts.length).toBeGreaterThan(0);

    const artifactLabels = artifacts.map(a => a.label);
    expect(artifactLabels).toContain('proposal.md');
    expect(artifactLabels).toContain('design.md');
    expect(artifactLabels).toContain('tasks.md');

    const proposalItem = artifacts.find(a => a.label === 'proposal.md')!;
    expect(proposalItem.command).toBeDefined();
    expect(proposalItem.command.command).toBe('openspec-studio.openInCustomEditor');
    expect(proposalItem.command.arguments[0].fsPath).toContain('proposal.md');
    expect(proposalItem.iconPath).toBeDefined();
    expect((proposalItem.iconPath as any).id).toBe('lightbulb');

    const designItem = artifacts.find(a => a.label === 'design.md')!;
    expect(designItem.command).toBeDefined();
    expect(designItem.command.command).toBe('openspec-studio.openInCustomEditor');

    const tasksItem = artifacts.find(a => a.label === 'tasks.md')!;
    expect(tasksItem.command).toBeDefined();
    expect(tasksItem.command.command).toBe('openspec-studio.openInCustomEditor');
  });

  it('triggers change event on refresh', () => {
    const fireSpy = vi.fn();
    (treeProvider as any)._onDidChangeTreeData.fire = fireSpy;
    treeProvider.refresh();
    expect(fireSpy).toHaveBeenCalled();
  });

  it('configures openInCustomEditor command for top-level spec-capability and spec.md items', async () => {
    const rootItems = await treeProvider.getChildren();
    const specsCategory = rootItems.find(item => item.label === 'Specifications')!;
    const specItems = await treeProvider.getChildren(specsCategory);
    const specItem = specItems.find(i => i.label === 'specs-tree-view')!;
    expect(specItem).toBeDefined();
    expect(specItem.command).toBeDefined();
    expect(specItem.command.command).toBe('openspec-studio.openInCustomEditor');
    expect(specItem.command.arguments[0].fsPath).toContain('spec.md');

    const specChildren = await treeProvider.getChildren(specItem);
    const specMdFileItem = specChildren.find(c => c.label === 'spec.md')!;
    expect(specMdFileItem).toBeDefined();
    expect(specMdFileItem.command).toBeDefined();
    expect(specMdFileItem.command.command).toBe('openspec-studio.openInCustomEditor');
  });

  it('configures openRequirement command for requirement items', async () => {
    const rootItems = await treeProvider.getChildren();
    const specsCategory = rootItems.find(item => item.label === 'Specifications')!;
    const specItems = await treeProvider.getChildren(specsCategory);
    const specItem = specItems.find(i => i.label === 'specs-tree-view');
    expect(specItem).toBeDefined();

    const specChildren = await treeProvider.getChildren(specItem);
    expect(specChildren.length).toBeGreaterThan(1);

    const reqItem = specChildren.find(c => c.itemType === 'spec-requirement')!;
    expect(reqItem).toBeDefined();
    expect(reqItem.command).toBeDefined();
    expect(reqItem.command.command).toBe('openspec-studio.openRequirement');
    expect(reqItem.command.arguments[0]).toContain('spec.md');
    expect(typeof reqItem.command.arguments[1]).toBe('string');
    expect(reqItem.command.arguments[1].length).toBeGreaterThan(0);
    expect(typeof reqItem.command.arguments[2]).toBe('number');
    expect(reqItem.command.arguments[3]).toBeGreaterThanOrEqual(reqItem.command.arguments[2]);
  });
});
