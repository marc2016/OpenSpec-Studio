import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  OpenSpecChange,
  OpenSpecCapability,
  OpenSpecArchivedChange,
  ChangeTask,
  SpecRequirement,
  SpecScenario
} from '../shared/types';
import { CliAdapter } from './CliAdapter';

export class WorkspaceDetector implements vscode.Disposable {
  private fileWatcher?: vscode.FileSystemWatcher;
  private readonly _onDidChangeState = new vscode.EventEmitter<void>();
  public readonly onDidChangeState = this._onDidChangeState.event;

  constructor(
    private readonly workspaceRoot: string,
    private readonly cliAdapter: CliAdapter
  ) {
    this.setupWatcher();
  }

  public hasOpenSpecDirectory(): boolean {
    const dir = path.join(this.workspaceRoot, 'openspec');
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  }

  public getOpenSpecRoot(): string {
    return path.join(this.workspaceRoot, 'openspec');
  }

  private setupWatcher() {
    const pattern = new vscode.RelativePattern(this.workspaceRoot, 'openspec/**');
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidCreate(() => this._onDidChangeState.fire());
    this.fileWatcher.onDidChange(() => this._onDidChangeState.fire());
    this.fileWatcher.onDidDelete(() => this._onDidChangeState.fire());
  }

  public async getActiveChanges(): Promise<OpenSpecChange[]> {
    const changesDir = path.join(this.getOpenSpecRoot(), 'changes');
    if (!fs.existsSync(changesDir)) {
      return [];
    }

    const entries = fs.readdirSync(changesDir, { withFileTypes: true });
    const changes: OpenSpecChange[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'archive' || entry.name.startsWith('.')) {
        continue;
      }

      const changePath = path.join(changesDir, entry.name);
      const tasksPath = path.join(changePath, 'tasks.md');
      const proposalPath = path.join(changePath, 'proposal.md');
      const designPath = path.join(changePath, 'design.md');
      const specsDir = path.join(changePath, 'specs');

      const tasks = this.parseTasks(tasksPath);
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.done).length;

      const artifacts = [
        { id: 'proposal', exists: fs.existsSync(proposalPath), path: proposalPath },
        { id: 'specs', exists: fs.existsSync(specsDir), path: specsDir },
        { id: 'design', exists: fs.existsSync(designPath), path: designPath },
        { id: 'tasks', exists: fs.existsSync(tasksPath), path: tasksPath }
      ];

      const isPlanningComplete = artifacts.every((a) => a.exists);

      let status = 'Draft';
      if (totalTasks > 0) {
        if (completedTasks === totalTasks) {
          status = 'Completed';
        } else if (completedTasks > 0) {
          status = 'In Progress';
        } else if (isPlanningComplete) {
          status = 'Ready';
        }
      } else if (isPlanningComplete) {
        status = 'Ready';
      }

      changes.push({
        name: entry.name,
        path: changePath,
        status,
        isPlanningComplete,
        totalTasks,
        completedTasks,
        tasks,
        artifacts
      });
    }

    return changes;
  }

  public parseTasks(tasksFilePath: string): ChangeTask[] {
    if (!fs.existsSync(tasksFilePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(tasksFilePath, 'utf8');
      const lines = content.split('\n');
      const tasks: ChangeTask[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const checkboxMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
        if (checkboxMatch) {
          const isDone = checkboxMatch[1].toLowerCase() === 'x';
          const description = checkboxMatch[2].trim();
          tasks.push({
            id: `task-${tasks.length + 1}`,
            description,
            done: isDone
          });
        }
      }

      return tasks;
    } catch {
      return [];
    }
  }

  public async getSpecs(): Promise<OpenSpecCapability[]> {
    const specsDir = path.join(this.getOpenSpecRoot(), 'specs');
    if (!fs.existsSync(specsDir)) {
      return [];
    }

    const capabilities: OpenSpecCapability[] = [];
    this.collectCapabilities(specsDir, specsDir, capabilities);
    return capabilities;
  }

  private collectCapabilities(
    currentDir: string,
    baseSpecsDir: string,
    results: OpenSpecCapability[]
  ) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    const specFile = path.join(currentDir, 'spec.md');
    if (fs.existsSync(specFile)) {
      const relPath = path.relative(baseSpecsDir, currentDir);
      const specData = this.parseSpecFile(specFile, relPath);
      results.push(specData);
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        this.collectCapabilities(path.join(currentDir, entry.name), baseSpecsDir, results);
      }
    }
  }

  private parseSpecFile(specFilePath: string, capabilityId: string): OpenSpecCapability {
    try {
      const content = fs.readFileSync(specFilePath, 'utf8');
      const lines = content.split('\n');

      let purpose = '';
      const requirements: SpecRequirement[] = [];
      let currentReq: SpecRequirement | null = null;
      let currentScenario: SpecScenario | null = null;
      let inPurpose = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('## Purpose')) {
          inPurpose = true;
          continue;
        } else if (line.startsWith('## ') && inPurpose) {
          inPurpose = false;
        }

        if (inPurpose) {
          if (!line.startsWith('<!--') && line.trim()) {
            purpose += (purpose ? ' ' : '') + line.trim();
          }
          continue;
        }

        if (line.startsWith('### Requirement:')) {
          if (currentReq) {
            requirements.push(currentReq);
          }
          currentReq = {
            name: line.replace('### Requirement:', '').trim(),
            description: '',
            scenarios: []
          };
          currentScenario = null;
          continue;
        }

        if (line.startsWith('#### Scenario:') && currentReq) {
          currentScenario = {
            name: line.replace('#### Scenario:', '').trim(),
            when: '',
            then: ''
          };
          currentReq.scenarios.push(currentScenario);
          continue;
        }

        if (currentScenario) {
          const whenMatch = line.match(/\*\*WHEN\*\*\s*(.*)/i);
          const thenMatch = line.match(/\*\*THEN\*\*\s*(.*)/i);
          if (whenMatch) {
            currentScenario.when = whenMatch[1].trim();
          } else if (thenMatch) {
            currentScenario.then = thenMatch[1].trim();
          }
        } else if (currentReq && !line.startsWith('#')) {
          if (line.trim()) {
            currentReq.description += (currentReq.description ? '\n' : '') + line.trim();
          }
        }
      }

      if (currentReq) {
        requirements.push(currentReq);
      }

      return {
        id: capabilityId,
        name: capabilityId,
        path: specFilePath,
        purpose: purpose || 'Specification for capability',
        requirementsCount: requirements.length,
        requirements
      };
    } catch {
      return {
        id: capabilityId,
        name: capabilityId,
        path: specFilePath,
        purpose: '',
        requirementsCount: 0,
        requirements: []
      };
    }
  }

  public async getArchivedChanges(): Promise<OpenSpecArchivedChange[]> {
    const archiveDir = path.join(this.getOpenSpecRoot(), 'changes', 'archive');
    if (!fs.existsSync(archiveDir)) {
      return [];
    }

    try {
      const entries = fs.readdirSync(archiveDir, { withFileTypes: true });
      const archives: OpenSpecArchivedChange[] = [];

      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) {
          continue;
        }

        const dateMatch = entry.name.match(/^(\d{4}-\d{2}-\d{2})-(.*)$/);
        const archivedDate = dateMatch ? dateMatch[1] : undefined;
        const displayName = dateMatch ? dateMatch[2] : entry.name;

        archives.push({
          name: displayName,
          path: path.join(archiveDir, entry.name),
          archivedDate
        });
      }

      // Sort newest first
      archives.sort((a, b) => (b.archivedDate || '').localeCompare(a.archivedDate || ''));
      return archives;
    } catch {
      return [];
    }
  }

  public dispose() {
    this.fileWatcher?.dispose();
    this._onDidChangeState.dispose();
  }
}
