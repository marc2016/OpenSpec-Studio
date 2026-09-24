import * as vscode from 'vscode';
import { WorkspaceDetector } from './core/WorkspaceDetector';
import { CliAdapter } from './core/CliAdapter';
import { WorkflowOrchestrator } from './core/WorkflowOrchestrator';
import { StudioDashboardPanel } from './core/StudioDashboardPanel';
import { SpecsTreeDataProvider } from './core/SpecsTreeDataProvider';
import { OpenSpecEditorProvider } from './customEditor/OpenSpecEditorProvider';
import { AiTarget } from './shared/types';

export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();

  // 1. Initialize core services
  const cliAdapter = new CliAdapter();
  const workspaceDetector = new WorkspaceDetector(workspaceRoot, cliAdapter);
  const config = vscode.workspace.getConfiguration('openspec');
  const aiTarget = (config.get<string>('aiTarget') as AiTarget) || 'copilot';
  const orchestrator = new WorkflowOrchestrator(aiTarget);

  context.subscriptions.push(workspaceDetector);

  // 2. Register Dashboard Open Command
  const openDashboard = () => {
    StudioDashboardPanel.createOrShow(
      context.extensionUri,
      workspaceDetector,
      cliAdapter,
      orchestrator
    );
  };

  const openCmd = vscode.commands.registerCommand('openspec-studio.openDashboard', openDashboard);

  // 3. Native Sidebar Tree Provider
  const specsTreeDataProvider = new SpecsTreeDataProvider(workspaceDetector);
  const treeView = vscode.window.createTreeView('openspec-studio.specsTree', {
    treeDataProvider: specsTreeDataProvider,
    showCollapseAll: true
  });

  const refreshCmd = vscode.commands.registerCommand('openspec-studio.refresh', () => {
    specsTreeDataProvider.refresh();
    if (StudioDashboardPanel.currentPanel) {
      StudioDashboardPanel.currentPanel.broadcastState();
    }
  });

  const refreshTreeCmd = vscode.commands.registerCommand('openspec-studio.refreshTree', () => {
    specsTreeDataProvider.refresh();
  });

  const openFileRangeCmd = vscode.commands.registerCommand(
    'openspec-studio.openFileRange',
    async (target: string | vscode.Uri, startLine: number = 0, endLine: number = startLine) => {
      try {
        const uri = typeof target === 'string' ? vscode.Uri.file(target) : target;
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc, { preview: false });
        const safeStartLine = Math.max(0, Math.min(startLine, doc.lineCount - 1));
        const safeEndLine = Math.max(safeStartLine, Math.min(endLine, doc.lineCount - 1));
        const endLineLength = doc.lineAt(safeEndLine).text.length;
        const range = new vscode.Range(
          new vscode.Position(safeStartLine, 0),
          new vscode.Position(safeEndLine, endLineLength)
        );
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      } catch (err) {
        console.error('Failed to open file range:', err);
      }
    }
  );

  // 4. Custom Markdown Editor Provider
  const customEditorRegistration = OpenSpecEditorProvider.register(context, orchestrator);

  const openInCustomEditorCmd = vscode.commands.registerCommand(
    'openspec-studio.openInCustomEditor',
    async (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (targetUri) {
        await vscode.commands.executeCommand('vscode.openWith', targetUri, OpenSpecEditorProvider.viewType);
      }
    }
  );

  const openRequirementCmd = vscode.commands.registerCommand(
    'openspec-studio.openRequirement',
    async (target: string | vscode.Uri, requirementName?: string) => {
      try {
        const uri = typeof target === 'string' ? vscode.Uri.file(target) : target;
        if (requirementName) {
          await OpenSpecEditorProvider.openRequirement(uri, requirementName);
        } else {
          await vscode.commands.executeCommand('vscode.openWith', uri, OpenSpecEditorProvider.viewType);
        }
      } catch (err) {
        console.error('Failed to open requirement in custom editor:', err);
      }
    }
  );

  // 5. Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'openspec-studio.openDashboard';
  statusBarItem.text = '$(dashboard) OpenSpec Studio';
  statusBarItem.tooltip = 'Open OpenSpec Studio Dashboard';
  statusBarItem.show();

  context.subscriptions.push(
    openCmd,
    refreshCmd,
    refreshTreeCmd,
    openFileRangeCmd,
    openRequirementCmd,
    customEditorRegistration,
    openInCustomEditorCmd,
    statusBarItem,
    treeView,
    specsTreeDataProvider
  );
}

export function deactivate() {
  if (StudioDashboardPanel.currentPanel) {
    StudioDashboardPanel.currentPanel.dispose();
  }
}
