import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { WorkspaceDetector } from './WorkspaceDetector';
import { OpenSpecChange, OpenSpecCapability, OpenSpecArchivedChange, SpecRequirement } from '../shared/types';

export type SpecsTreeItemType =
  | 'category'
  | 'spec-capability'
  | 'spec-requirement'
  | 'change'
  | 'artifact-file'
  | 'archive-entry'
  | 'empty';

export class SpecsTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    public readonly itemType: SpecsTreeItemType,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    public readonly filePath?: string,
    public readonly contextData?: any
  ) {
    super(label, collapsibleState);
    this.setupVisuals();
  }

  private setupVisuals() {
    this.contextValue = this.itemType;

    if (this.filePath) {
      this.resourceUri = vscode.Uri.file(this.filePath);
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [vscode.Uri.file(this.filePath)]
      };
    }

    switch (this.itemType) {
      case 'category':
        this.iconPath = new vscode.ThemeIcon(this.contextData?.icon || 'folder');
        break;

      case 'spec-capability':
        this.iconPath = new vscode.ThemeIcon('book');
        this.tooltip = `Durable Spec: ${this.label}`;
        if (this.filePath) {
          this.command = {
            command: 'openspec-studio.openInCustomEditor',
            title: 'Open in OpenSpec Markdown Editor',
            arguments: [vscode.Uri.file(this.filePath)]
          };
        }
        break;

      case 'spec-requirement': {
        this.iconPath = new vscode.ThemeIcon('check');
        this.tooltip = `Requirement: ${this.label}`;
        const req = this.contextData?.requirement as SpecRequirement | undefined;
        if (this.filePath && req) {
          this.command = {
            command: 'openspec-studio.openRequirement',
            title: 'Open Requirement in Editor',
            arguments: [this.filePath, req.name, req.startLine, req.endLine ?? req.startLine]
          };
        }
        break;
      }

      case 'change':
        this.iconPath = new vscode.ThemeIcon('git-pull-request');
        this.tooltip = `OpenSpec Change: ${this.label} (${this.description || ''})`;
        break;

      case 'artifact-file': {
        const filename = this.filePath ? path.basename(this.filePath).toLowerCase() : '';
        if (filename.includes('proposal')) {
          this.iconPath = new vscode.ThemeIcon('lightbulb');
        } else if (filename.includes('tasks')) {
          this.iconPath = new vscode.ThemeIcon('checklist');
        } else if (filename.includes('design')) {
          this.iconPath = new vscode.ThemeIcon('circuit-board');
        } else if (filename.includes('spec')) {
          this.iconPath = new vscode.ThemeIcon('file-code');
        } else {
          this.iconPath = new vscode.ThemeIcon('file');
        }
        if (this.filePath && /\.md$/i.test(this.filePath)) {
          this.command = {
            command: 'openspec-studio.openInCustomEditor',
            title: 'Open in OpenSpec Markdown Editor',
            arguments: [vscode.Uri.file(this.filePath)]
          };
        }
        break;
      }

      case 'archive-entry':
        this.iconPath = new vscode.ThemeIcon('history');
        this.tooltip = `Archived Change: ${this.label}`;
        break;

      case 'empty':
        this.iconPath = new vscode.ThemeIcon('info');
        break;
    }
  }
}

export class SpecsTreeDataProvider implements vscode.TreeDataProvider<SpecsTreeItem>, vscode.Disposable {
  private _onDidChangeTreeData: vscode.EventEmitter<SpecsTreeItem | undefined | null | void> =
    new vscode.EventEmitter<SpecsTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SpecsTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private disposables: vscode.Disposable[] = [];

  constructor(private readonly detector: WorkspaceDetector) {
    // Synchronize live with file system events via WorkspaceDetector
    this.disposables.push(
      this.detector.onDidChangeState(() => {
        this.refresh();
      })
    );
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: SpecsTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: SpecsTreeItem): Promise<SpecsTreeItem[]> {
    if (!this.detector.hasOpenSpecDirectory()) {
      return [
        new SpecsTreeItem(
          'No OpenSpec directory found',
          'empty',
          vscode.TreeItemCollapsibleState.None,
          undefined,
          { info: 'Run Open Studio Dashboard to initialize' }
        )
      ];
    }

    // Root level: return categories
    if (!element) {
      return this.getRootCategories();
    }

    // Children of category nodes
    if (element.itemType === 'category') {
      const categoryId = element.contextData?.categoryId;
      if (categoryId === 'specs') {
        return this.getSpecsChildren();
      } else if (categoryId === 'changes') {
        return this.getChangesChildren();
      } else if (categoryId === 'archived') {
        return this.getArchivedChildren();
      }
    }

    // Children of a Change node: list artifacts and delta specs
    if (element.itemType === 'change') {
      const change = element.contextData?.change as OpenSpecChange;
      return this.getChangeArtifacts(change);
    }

    // Children of a Capability node: list spec.md or sub-requirements
    if (element.itemType === 'spec-capability') {
      const capability = element.contextData?.capability as OpenSpecCapability;
      return this.getCapabilityChildren(capability);
    }

    return [];
  }

  private async getRootCategories(): Promise<SpecsTreeItem[]> {
    const changes = await this.detector.getActiveChanges();
    const specs = await this.detector.getSpecs();
    const archived = await this.detector.getArchivedChanges();

    const specsCategory = new SpecsTreeItem(
      'Specifications',
      'category',
      vscode.TreeItemCollapsibleState.Expanded,
      undefined,
      { categoryId: 'specs', icon: 'book' }
    );
    specsCategory.description = `${specs.length}`;

    const changesCategory = new SpecsTreeItem(
      'Active Changes',
      'category',
      vscode.TreeItemCollapsibleState.Expanded,
      undefined,
      { categoryId: 'changes', icon: 'git-pull-request' }
    );
    changesCategory.description = `${changes.length}`;

    const archivedCategory = new SpecsTreeItem(
      'Archived History',
      'category',
      vscode.TreeItemCollapsibleState.Collapsed,
      undefined,
      { categoryId: 'archived', icon: 'history' }
    );
    archivedCategory.description = `${archived.length}`;

    return [specsCategory, changesCategory, archivedCategory];
  }

  private async getSpecsChildren(): Promise<SpecsTreeItem[]> {
    const specs = await this.detector.getSpecs();
    if (specs.length === 0) {
      const empty = new SpecsTreeItem('No durable specs yet', 'empty');
      empty.description = 'openspec/specs/';
      return [empty];
    }

    return specs.map((spec) => {
      const hasChildren = (spec.requirements && spec.requirements.length > 0);
      const item = new SpecsTreeItem(
        spec.name,
        'spec-capability',
        hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
        spec.path,
        { capability: spec }
      );
      item.description = `${spec.requirementsCount} reqs`;
      return item;
    });
  }

  private getCapabilityChildren(capability: OpenSpecCapability): SpecsTreeItem[] {
    const items: SpecsTreeItem[] = [];

    // First child: the spec.md file itself
    const specFileItem = new SpecsTreeItem(
      'spec.md',
      'artifact-file',
      vscode.TreeItemCollapsibleState.None,
      capability.path
    );
    specFileItem.command = {
      command: 'openspec-studio.openInCustomEditor',
      title: 'Open in OpenSpec Markdown Editor',
      arguments: [vscode.Uri.file(capability.path)]
    };
    items.push(specFileItem);

    // Sub-items for requirements
    if (capability.requirements) {
      for (const req of capability.requirements) {
        const reqItem = new SpecsTreeItem(
          req.name,
          'spec-requirement',
          vscode.TreeItemCollapsibleState.None,
          capability.path,
          { requirement: req }
        );
        if (req.scenarios && req.scenarios.length > 0) {
          reqItem.description = `${req.scenarios.length} scenarios`;
        }
        items.push(reqItem);
      }
    }

    return items;
  }

  private async getChangesChildren(): Promise<SpecsTreeItem[]> {
    const changes = await this.detector.getActiveChanges();
    if (changes.length === 0) {
      return [new SpecsTreeItem('No active changes', 'empty')];
    }

    return changes.map((change) => {
      const item = new SpecsTreeItem(
        change.name,
        'change',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        { change }
      );
      const progress = change.totalTasks > 0 ? `${change.completedTasks}/${change.totalTasks} tasks` : change.status;
      item.description = progress;
      return item;
    });
  }

  private getChangeArtifacts(change: OpenSpecChange): SpecsTreeItem[] {
    const items: SpecsTreeItem[] = [];

    for (const art of change.artifacts) {
      if (!art.exists || !art.path) continue;
      const artPath = art.path;

      const stat = fs.existsSync(artPath) ? fs.statSync(artPath) : null;
      if (stat && stat.isDirectory()) {
        // Delta specs directory inside change
        try {
          const specEntries = fs.readdirSync(artPath, { withFileTypes: true });
          for (const entry of specEntries) {
            if (entry.isDirectory()) {
              const specFilePath = path.join(artPath, entry.name, 'spec.md');
              if (fs.existsSync(specFilePath)) {
                const parsedSpec = this.detector.parseSpecFile(specFilePath, entry.name);
                const hasReqs = parsedSpec.requirements && parsedSpec.requirements.length > 0;
                const item = new SpecsTreeItem(
                  `specs/${entry.name}`,
                  'spec-capability',
                  hasReqs ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                  specFilePath,
                  { capability: parsedSpec }
                );
                if (hasReqs) {
                  item.description = `${parsedSpec.requirementsCount} reqs`;
                }
                items.push(item);
              }
            }
          }
        } catch {
          // ignore error reading dir
        }
      } else {
        const basename = path.basename(artPath);
        const item = new SpecsTreeItem(
          basename,
          'artifact-file',
          vscode.TreeItemCollapsibleState.None,
          artPath
        );
        if (basename === 'tasks.md' && change.totalTasks > 0) {
          item.description = `${change.completedTasks}/${change.totalTasks}`;
        }
        items.push(item);
      }
    }

    return items;
  }

  private async getArchivedChildren(): Promise<SpecsTreeItem[]> {
    const archived = await this.detector.getArchivedChanges();
    if (archived.length === 0) {
      return [new SpecsTreeItem('No archived changes', 'empty')];
    }

    return archived.map((item) => {
      const treeItem = new SpecsTreeItem(
        item.name,
        'archive-entry',
        vscode.TreeItemCollapsibleState.None,
        item.path
      );
      if (item.archivedDate) {
        treeItem.description = item.archivedDate;
      }
      return treeItem;
    });
  }

  public dispose() {
    this._onDidChangeTreeData.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) d.dispose();
    }
  }
}
