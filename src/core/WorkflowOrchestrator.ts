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
    await this.dispatchPrompt(prompt, target, params);
  }

  public async dispatchCustomPrompt(prompt: string, targetOverride?: AiTarget): Promise<void> {
    const target = targetOverride || this.defaultAiTarget;
    await this.dispatchPrompt(prompt, target, { action: 'explore', input: prompt });
  }

  private async dispatchPrompt(prompt: string, target: AiTarget, params: WorkflowActionParams): Promise<void> {
    let effectiveTarget = target;

    // Auto-detect environment if default 'copilot' target is set
    if (target === 'copilot') {
      const appName = (vscode.env.appName || '').toLowerCase();
      if (appName.includes('antigravity')) {
        effectiveTarget = 'antigravity';
      } else if (appName.includes('cursor')) {
        effectiveTarget = 'cursor';
      }
    }

    switch (effectiveTarget) {
      case 'cursor':
        await this.dispatchToCursor(prompt);
        break;
      case 'antigravity':
        await this.dispatchToAntigravity(prompt);
        break;
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

  private async getAvailableCommands(): Promise<string[]> {
    if (typeof vscode.commands.getCommands === 'function') {
      try {
        return await vscode.commands.getCommands(true);
      } catch {
        return [];
      }
    }
    return [];
  }

  private async tryCommands(
    candidates: Array<{ command: string; args?: any }>,
    prompt: string,
    environmentLabel: string
  ): Promise<boolean> {
    const availableCommands = await this.getAvailableCommands();
    const hasCommand = (cmd: string) =>
      availableCommands.length === 0 ||
      availableCommands.includes(cmd) ||
      cmd.startsWith('antigravity.') ||
      cmd.startsWith('aichat.') ||
      cmd.startsWith('cursor.');

    for (const candidate of candidates) {
      if (hasCommand(candidate.command)) {
        if (candidate.args !== undefined) {
          try {
            await vscode.commands.executeCommand(candidate.command, candidate.args);
            return true;
          } catch {
            // Candidate with args failed; fallback to invocation without args below
          }
        }
        try {
          await vscode.commands.executeCommand(candidate.command);
          return true;
        } catch {
          // Continue to next candidate
        }
      }
    }

    await this.dispatchToClipboard(prompt);
    vscode.window.showInformationMessage(
      `${environmentLabel} Chat konnte nicht direkt geöffnet werden. Prompt in Zwischenablage kopiert.`
    );
    return false;
  }

  private async dispatchToCursor(prompt: string): Promise<void> {
    await vscode.env.clipboard.writeText(prompt);
    const candidates = [
      { command: 'aichat.newchataction', args: { query: prompt, text: prompt } },
      { command: 'aichat.newchataction', args: { query: prompt } },
      { command: 'aichat.newchataction' },
      { command: 'workbench.panel.aichat.view.focus' },
      { command: 'cursor.chat' },
      { command: 'aichat.focus' },
      { command: 'aichat.open' },
      { command: 'workbench.action.chat.open', args: { query: prompt } },
      { command: 'workbench.action.chat.open' }
    ];
    await this.tryCommands(candidates, prompt, 'Cursor AI');
  }

  private async dispatchToAntigravity(prompt: string): Promise<void> {
    await vscode.env.clipboard.writeText(prompt);
    const candidates = [
      { command: 'antigravity.sendPromptToAgentPanel', args: prompt },
      { command: 'antigravity.openAgent' },
      { command: 'antigravity.prioritized.chat.open', args: prompt },
      { command: 'antigravity.prioritized.chat.open', args: { query: prompt } },
      { command: 'antigravity.prioritized.chat.open' },
      { command: 'antigravity.openChatView' },
      { command: 'workbench.action.chat.open', args: { query: prompt } },
      { command: 'workbench.action.chat.open' },
      { command: 'workbench.action.chat.focus' },
      { command: 'workbench.action.chat.focusInput' },
      { command: 'workbench.action.chat.newChat' },
      { command: 'workbench.action.quickchat.toggle', args: { query: prompt } },
      { command: 'workbench.action.quickchat.toggle' }
    ];
    await this.tryCommands(candidates, prompt, 'Antigravity');
  }

  private async dispatchToCopilot(prompt: string): Promise<void> {
    await vscode.env.clipboard.writeText(prompt);
    const candidates = [
      { command: 'workbench.action.chat.open', args: { query: prompt } },
      { command: 'workbench.action.chat.open' },
      { command: 'workbench.action.chat.focus' },
      { command: 'workbench.action.chat.focusInput' },
      { command: 'workbench.action.chat.newChat' },
      { command: 'antigravity.prioritized.chat.open', args: { query: prompt } },
      { command: 'antigravity.prioritized.chat.open' },
      { command: 'aichat.newchataction', args: { query: prompt, text: prompt } },
      { command: 'aichat.newchataction', args: { query: prompt } },
      { command: 'aichat.newchataction' },
      { command: 'workbench.panel.aichat.view.focus' },
      { command: 'cursor.chat' },
      { command: 'aichat.focus' },
      { command: 'aichat.open' },
      { command: 'workbench.action.quickchat.toggle', args: { query: prompt } },
      { command: 'workbench.action.quickchat.toggle' }
    ];
    await this.tryCommands(candidates, prompt, 'AI');
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
