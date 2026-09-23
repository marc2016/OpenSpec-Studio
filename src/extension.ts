import * as vscode from 'vscode';
import { WorkspaceDetector } from './core/WorkspaceDetector';
import { CliAdapter } from './core/CliAdapter';
import { WorkflowOrchestrator } from './core/WorkflowOrchestrator';
import { StudioDashboardPanel } from './core/StudioDashboardPanel';
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

  const refreshCmd = vscode.commands.registerCommand('openspec-studio.refresh', () => {
    if (StudioDashboardPanel.currentPanel) {
      StudioDashboardPanel.currentPanel.broadcastState();
    }
  });

  // 3. Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'openspec-studio.openDashboard';
  statusBarItem.text = '$(dashboard) OpenSpec Studio';
  statusBarItem.tooltip = 'Open OpenSpec Studio Dashboard';
  statusBarItem.show();

  // 4. Sidebar View Provider
  const sidebarProvider: vscode.WebviewViewProvider = {
    resolveWebviewView(webviewView: vscode.WebviewView) {
      webviewView.webview.options = { enableScripts: true };
      webviewView.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <style>
            body {
              padding: 16px;
              color: var(--vscode-foreground);
              font-family: var(--vscode-font-family);
              font-size: 13px;
              line-height: 1.5;
            }
            .btn {
              display: block;
              width: 100%;
              padding: 8px 12px;
              margin-top: 12px;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              text-align: center;
            }
            .btn:hover {
              background: var(--vscode-button-hoverBackground);
            }
            .card {
              background: var(--vscode-sideBar-background);
              border: 1px solid var(--vscode-widget-border, #333);
              border-radius: 6px;
              padding: 12px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h3 style="margin-top:0;">OpenSpec Studio</h3>
          <p style="color: var(--vscode-descriptionForeground); font-size: 12px;">
            Open the full interactive Studio Dashboard as an editor tab.
          </p>
          <button class="btn" id="openBtn">Open Studio Dashboard</button>
          <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('openBtn').addEventListener('click', () => {
              vscode.postMessage({ command: 'open' });
            });
          </script>
        </body>
        </html>
      `;

      webviewView.webview.onDidReceiveMessage((msg) => {
        if (msg.command === 'open') {
          openDashboard();
        }
      });
    }
  };

  const sidebarRegistration = vscode.window.registerWebviewViewProvider(
    'openspec-studio.sidebarView',
    sidebarProvider
  );

  context.subscriptions.push(openCmd, refreshCmd, statusBarItem, sidebarRegistration);
}

export function deactivate() {
  if (StudioDashboardPanel.currentPanel) {
    StudioDashboardPanel.currentPanel.dispose();
  }
}
