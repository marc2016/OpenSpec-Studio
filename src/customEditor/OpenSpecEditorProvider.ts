import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class OpenSpecEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'openspec.markdownEditor';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new OpenSpecEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      OpenSpecEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        },
        supportsMultipleEditorsPerDocument: false
      }
    );
  }

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const webview = webviewPanel.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')
      ]
    };

    webview.html = this.getHtmlForWebview(webview, document);

    const postInit = () => {
      webview.postMessage({
        type: 'INIT_EDITOR',
        filePath: document.uri.fsPath,
        content: document.getText()
      });
    };

    // Send initial content
    postInit();

    // Synchronize external changes (disk or other editor tab)
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString() && e.contentChanges.length > 0) {
        webview.postMessage({
          type: 'DOCUMENT_UPDATE',
          content: document.getText()
        });
      }
    });

    // Handle messages from the webview
    const messageSubscription = webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'READY':
          postInit();
          break;

        case 'DOCUMENT_EDIT': {
          const newText = message.text;
          if (typeof newText === 'string' && newText !== document.getText()) {
            await this.updateTextDocument(document, newText);
          }
          break;
        }

        case 'OPEN_IN_DEFAULT_EDITOR': {
          try {
            await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
          } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to open default editor: ${err.message}`);
          }
          break;
        }
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      messageSubscription.dispose();
    });
  }

  private async updateTextDocument(document: vscode.TextDocument, newText: string): Promise<boolean> {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );
    edit.replace(document.uri, fullRange, newText);
    return vscode.workspace.applyEdit(edit);
  }

  private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
    const distWebview = vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview');
    const indexPath = path.join(distWebview.fsPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      return `<html><body><h3>OpenSpec Studio webview build not found at: ${indexPath}</h3><p>Run 'npm run build:webview' to build the webview bundle.</p></body></html>`;
    }

    let html = fs.readFileSync(indexPath, 'utf8');

    // Replace assets paths with webview URIs
    html = html.replace(/(src|href)=(["'])(?:\.\/|\/)?assets\/([^"']+)\2/g, (_, attr, quote, file) => {
      const assetUri = webview.asWebviewUri(vscode.Uri.joinPath(distWebview, 'assets', file));
      return `${attr}=${quote}${assetUri}${quote}`;
    });

    // Inject mode=editor flag script and initial document data
    const initialData = JSON.stringify({
      mode: 'editor',
      filePath: document.uri.fsPath,
      content: document.getText()
    }).replace(/</g, '\\u003c');

    const modeScript = `<script>window.OPENSPEC_MODE = "editor"; window.OPENSPEC_DATA = ${initialData};</script>`;
    html = html.replace('<head>', `<head>\n  ${modeScript}`);

    // Inject CSP if not present
    if (!html.includes('http-equiv="Content-Security-Policy"')) {
      const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; script-src ${webview.cspSource} 'unsafe-inline' 'unsafe-eval'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; connect-src ${webview.cspSource} https: data:;">`;
      html = html.replace('<head>', `<head>\n  ${csp}`);
    }

    return html;
  }
}
