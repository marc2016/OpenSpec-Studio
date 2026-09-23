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
    expect(changeItems.length).toBeGreaterThan(0);

    const changeNames = changeItems.map(i => i.label);
    expect(changeNames).toContain('sidebar-specs-tree-view');
  });

  it('populates artifacts under an active change with open commands', async () => {
    const rootItems = await treeProvider.getChildren();
    const changesCategory = rootItems.find(item => item.label === 'Active Changes')!;
    const changeItems = await treeProvider.getChildren(changesCategory);
    const sidebarChange = changeItems.find(i => i.label === 'sidebar-specs-tree-view')!;

    const artifacts = await treeProvider.getChildren(sidebarChange);
    expect(artifacts.length).toBeGreaterThan(0);

    const artifactLabels = artifacts.map(a => a.label);
    expect(artifactLabels).toContain('proposal.md');
    expect(artifactLabels).toContain('design.md');
    expect(artifactLabels).toContain('tasks.md');

    const proposalItem = artifacts.find(a => a.label === 'proposal.md')!;
    expect(proposalItem.command).toBeDefined();
    expect(proposalItem.command.command).toBe('vscode.open');
    expect(proposalItem.command.arguments[0].fsPath).toContain('proposal.md');
    expect(proposalItem.iconPath).toBeDefined();
    expect((proposalItem.iconPath as any).id).toBe('lightbulb');
  });

  it('triggers change event on refresh', () => {
    const fireSpy = vi.fn();
    (treeProvider as any)._onDidChangeTreeData.fire = fireSpy;
    treeProvider.refresh();
    expect(fireSpy).toHaveBeenCalled();
  });
});
