import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { WorkspaceDetector } from './WorkspaceDetector';
import { CliAdapter } from './CliAdapter';
import { WorkflowOrchestrator } from './WorkflowOrchestrator';
import { OpenSpecState, FromWebviewMessage, ToWebviewMessage, AiTarget, CliMode } from '../shared/types';
import { OpenSpecEditorProvider } from '../customEditor/OpenSpecEditorProvider';

export class StudioDashboardPanel {
  public static currentPanel: StudioDashboardPanel | undefined;
  public static readonly viewType = 'openspec-studio.dashboard';

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];
  private aiTarget: AiTarget = 'copilot';

  public static createOrShow(
    extensionUri: vscode.Uri,
    workspaceDetector: WorkspaceDetector,
    cliAdapter: CliAdapter,
    orchestrator: WorkflowOrchestrator
  ): StudioDashboardPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If panel already exists, reveal it
    if (StudioDashboardPanel.currentPanel) {
      StudioDashboardPanel.currentPanel.panel.reveal(column);
      StudioDashboardPanel.currentPanel.broadcastState();
      return StudioDashboardPanel.currentPanel;
    }

    // Otherwise create a new editor tab panel
    const panel = vscode.window.createWebviewPanel(
      StudioDashboardPanel.viewType,
      'OpenSpec Studio',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          extensionUri,
          vscode.Uri.joinPath(extensionUri, 'dist'),
          vscode.Uri.joinPath(extensionUri, 'dist', 'webview')
        ]
      }
    );

    StudioDashboardPanel.currentPanel = new StudioDashboardPanel(
      panel,
      extensionUri,
      workspaceDetector,
      cliAdapter,
      orchestrator
    );

    return StudioDashboardPanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    private readonly detector: WorkspaceDetector,
    private readonly cliAdapter: CliAdapter,
    private readonly orchestrator: WorkflowOrchestrator
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    // Load initial user config
    const config = vscode.workspace.getConfiguration('openspec');
    this.aiTarget = (config.get<string>('aiTarget') as AiTarget) || 'copilot';
    const cliMode = (config.get<string>('cliMode') as CliMode) || 'auto';
    this.cliAdapter.setMode(cliMode);

    // 1. Listen for messages from the Webview BEFORE setting HTML to prevent race conditions
    this.panel.webview.onDidReceiveMessage(
      (message: FromWebviewMessage) => this.handleMessage(message),
      null,
      this.disposables
    );

    // 2. Listen to filesystem events to broadcast state live
    this.detector.onDidChangeState(
      () => this.broadcastState(),
      null,
      this.disposables
    );

    // 3. Listen to panel visibility changes to refresh state when tab becomes active
    this.panel.onDidChangeViewState(
      (e) => {
        if (e.webviewPanel.visible) {
          this.broadcastState();
        }
      },
      null,
      this.disposables
    );

    // 4. Listen for when panel is closed
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // 5. Set panel HTML
    this.updateWebviewHtml();

    // 6. Broadcast initial state
    this.broadcastState();
  }

  public async broadcastState(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      this.postMessage({
        type: 'STATE_UPDATE',
        state: {
          isInitialized: false,
          loading: false,
          cliInfo: { mode: 'auto', resolvedPath: 'openspec', isAvailable: false },
          aiTarget: this.aiTarget,
          changes: [],
          specs: [],
          archived: [],
          error: 'No workspace folder open.'
        }
      });
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const isInitialized = this.detector.hasOpenSpecDirectory();
    const cliInfo = await this.cliAdapter.resolveCli(rootPath);

    let changes: any[] = [];
    let specs: any[] = [];
    let archived: any[] = [];

    if (isInitialized) {
      changes = await this.detector.getActiveChanges();
      specs = await this.detector.getSpecs();
      archived = await this.detector.getArchivedChanges();
    }

    const state: OpenSpecState = {
      isInitialized,
      rootPath,
      cliInfo,
      aiTarget: this.aiTarget,
      changes,
      specs,
      archived,
      loading: false
    };

    this.postMessage({ type: 'STATE_UPDATE', state });
  }

  private async handleMessage(message: FromWebviewMessage): Promise<void> {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) return;

    switch (message.type) {
      case 'REQUEST_STATE':
        await this.broadcastState();
        break;

      case 'SET_AI_TARGET':
        this.aiTarget = message.aiTarget;
        await vscode.workspace.getConfiguration('openspec').update('aiTarget', message.aiTarget, true);
        await this.broadcastState();
        break;

      case 'RUN_WORKFLOW':
        await this.orchestrator.dispatch(
          {
            action: message.action,
            changeName: message.changeName,
            input: message.input
          },
          this.aiTarget
        );
        break;

      case 'INIT_PROJECT': {
        const cliInfo = await this.cliAdapter.resolveCli(workspaceRoot);
        const res = await this.cliAdapter.initProject(workspaceRoot, cliInfo);
        if (res.success) {
          vscode.window.showInformationMessage('OpenSpec successfully initialized!');
        } else {
          vscode.window.showErrorMessage(`Failed to initialize OpenSpec: ${res.output}`);
        }
        await this.broadcastState();
        break;
      }

      case 'INSTALL_CLI': {
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal({ name: 'OpenSpec Install' });
        terminal.show();
        terminal.sendText('npm install -D openspec');
        break;
      }

      case 'OPEN_FILE': {
        try {
          const targetUri = vscode.Uri.file(message.filePath);
          if (message.filePath.endsWith('.md')) {
            await vscode.commands.executeCommand('vscode.openWith', targetUri, OpenSpecEditorProvider.viewType);
          } else {
            await vscode.commands.executeCommand('vscode.open', targetUri, {
              preview: false,
              viewColumn: vscode.ViewColumn.Beside
            });
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(`Could not open file: ${err.message}`);
        }
        break;
      }

      case 'OPEN_CHANGE_FOLDER': {
        const changePath = path.join(workspaceRoot, 'openspec', 'changes', message.changeName);
        if (fs.existsSync(changePath)) {
          vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(changePath));
        }
        break;
      }
    }
  }

  private postMessage(msg: ToWebviewMessage) {
    this.panel.webview.postMessage(msg);
  }

  private updateWebviewHtml() {
    const webview = this.panel.webview;
    const distWebview = vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview');
    const indexPath = path.join(distWebview.fsPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      webview.html = `<html><body><h3>OpenSpec Studio webview build not found at: ${indexPath}</h3><p>Run 'npm run build:webview' to build the webview bundle.</p></body></html>`;
      return;
    }

    let html = fs.readFileSync(indexPath, 'utf8');

    // Replace assets paths with webview URIs (supports /assets/, ./assets/, and assets/)
    html = html.replace(/(src|href)=(["'])(?:\.\/|\/)?assets\/([^"']+)\2/g, (_, attr, quote, file) => {
      const assetUri = webview.asWebviewUri(vscode.Uri.joinPath(distWebview, 'assets', file));
      return `${attr}=${quote}${assetUri}${quote}`;
    });

    // Inject Content Security Policy if not already present
    if (!html.includes('http-equiv="Content-Security-Policy"')) {
      const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};">`;
      html = html.replace('<head>', `<head>\n  ${csp}`);
    }

    webview.html = html;
  }

  public dispose() {
    StudioDashboardPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
