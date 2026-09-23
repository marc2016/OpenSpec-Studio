import * as vscode from 'vscode';
import { AiTarget } from '../shared/types';

export interface WorkflowActionParams {
  action: 'propose' | 'explore' | 'apply' | 'sync' | 'archive';
  changeName?: string;
  input?: string;
}

export class WorkflowOrchestrator {
  constructor(private defaultAiTarget: AiTarget = 'copilot') {}

  public getPrompt(params: WorkflowActionParams): string {
    const { action, changeName, input } = params;

    switch (action) {
      case 'propose':
        return input ? `/opsx-propose ${input}` : '/opsx-propose';
      case 'explore':
        return input ? `/opsx-explore ${input}` : '/opsx-explore';
      case 'apply':
        return changeName ? `/opsx-apply ${changeName}` : '/opsx-apply';
      case 'sync':
        return changeName ? `/opsx-sync ${changeName}` : '/opsx-sync';
      case 'archive':
        return changeName ? `/opsx-archive ${changeName}` : '/opsx-archive';
      default:
        return `/opsx-${action}`;
    }
  }

  public async dispatch(params: WorkflowActionParams, targetOverride?: AiTarget): Promise<void> {
    const target = targetOverride || this.defaultAiTarget;
    const prompt = this.getPrompt(params);

    switch (target) {
      case 'copilot':
        await this.dispatchToCopilot(prompt);
        break;
      case 'terminal':
        this.dispatchToTerminal(prompt, params);
        break;
      case 'clipboard':
      default:
        await this.dispatchToClipboard(prompt);
        break;
    }
  }

  private async dispatchToCopilot(prompt: string): Promise<void> {
    try {
      // Try opening chat with prefilled query
      await vscode.commands.executeCommand('workbench.action.chat.open', {
        query: prompt
      });
    } catch (err) {
      // Fallback if Copilot Chat command is unavailable
      await this.dispatchToClipboard(prompt);
      vscode.window.showInformationMessage(
        `GitHub Copilot Chat could not be opened automatically. Prompt copied to clipboard: "${prompt}"`
      );
    }
  }

  private dispatchToTerminal(prompt: string, params: WorkflowActionParams): void {
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal({ name: 'OpenSpec' });
    terminal.show();

    // If it's a CLI command directly executable (like sync or archive), run openspec command or echo prompt
    if (params.action === 'sync') {
      terminal.sendText(`npx openspec sync specs ${params.changeName ? `--change ${params.changeName}` : ''}`);
    } else if (params.action === 'archive') {
      terminal.sendText(`npx openspec archive ${params.changeName || ''}`);
    } else {
      terminal.sendText(`echo "Ready for AI Agent. Execute in your assistant chat: ${prompt}"`);
    }
  }

  private async dispatchToClipboard(prompt: string): Promise<void> {
    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage(`Workflow prompt copied to clipboard: "${prompt}"`);
  }
}
