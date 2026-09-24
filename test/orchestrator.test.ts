import { describe, it, expect, vi } from 'vitest';
import { WorkflowOrchestrator } from '../src/core/WorkflowOrchestrator';

// Mock vscode
vi.mock('vscode', () => ({
  commands: {
    executeCommand: vi.fn().mockResolvedValue(undefined)
  },
  window: {
    activeTerminal: undefined,
    createTerminal: vi.fn().mockReturnValue({
      show: vi.fn(),
      sendText: vi.fn()
    }),
    showInformationMessage: vi.fn()
  },
  env: {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
  }
}));

import * as vscode from 'vscode';

describe('WorkflowOrchestrator', () => {
  const orchestrator = new WorkflowOrchestrator('copilot');

  it('generates correct prompt templates for all actions', () => {
    expect(orchestrator.getPrompt({ action: 'propose' })).toBe('/opsx-propose');
    expect(orchestrator.getPrompt({ action: 'propose', input: 'add dark mode' })).toBe('/opsx-propose add dark mode');
    expect(orchestrator.getPrompt({ action: 'explore', input: 'offline sync' })).toBe('/opsx-explore offline sync');
    expect(orchestrator.getPrompt({ action: 'apply', changeName: 'vscode-openspec-studio' })).toBe('/opsx-apply vscode-openspec-studio');
    expect(orchestrator.getPrompt({ action: 'sync', changeName: 'vscode-openspec-studio' })).toBe('/opsx-sync vscode-openspec-studio');
    expect(orchestrator.getPrompt({ action: 'archive', changeName: 'vscode-openspec-studio' })).toBe('/opsx-archive vscode-openspec-studio');
  });

  it('dispatches to copilot chat command', async () => {
    await orchestrator.dispatch({ action: 'apply', changeName: 'add-auth' }, 'copilot');
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
      'workbench.action.chat.open',
      { query: '/opsx-apply add-auth' }
    );
  });

  it('dispatches to cursor chat command', async () => {
    (vscode.commands as any).getCommands = vi.fn().mockResolvedValue(['aichat.newchataction']);
    await orchestrator.dispatch({ action: 'explore', input: 'offline' }, 'cursor');
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
      'aichat.newchataction',
      expect.objectContaining({ query: '/opsx-explore offline' })
    );
  });

  it('dispatches to antigravity chat command', async () => {
    (vscode.commands as any).getCommands = vi.fn().mockResolvedValue(['antigravity.sendPromptToAgentPanel']);
    await orchestrator.dispatch({ action: 'explore', input: 'offline' }, 'antigravity');
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
      'antigravity.sendPromptToAgentPanel',
      '/opsx-explore offline'
    );
  });

  it('auto-detects antigravity environment and routes copilot target to antigravity', async () => {
    (vscode.env as any).appName = 'Antigravity IDE';
    (vscode.commands as any).getCommands = vi.fn().mockResolvedValue(['antigravity.sendPromptToAgentPanel']);
    await orchestrator.dispatch({ action: 'apply', changeName: 'my-change' }, 'copilot');
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
      'antigravity.sendPromptToAgentPanel',
      '/opsx-apply my-change'
    );
    (vscode.env as any).appName = 'Visual Studio Code';
  });

  it('falls back to executeCommand without args if executing with args throws', async () => {
    (vscode.commands as any).getCommands = vi.fn().mockResolvedValue(['antigravity.sendPromptToAgentPanel']);
    (vscode.commands.executeCommand as any).mockImplementationOnce(() => {
      throw new Error('Invalid query argument');
    });
    await orchestrator.dispatch({ action: 'explore', input: 'offline' }, 'antigravity');
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith('antigravity.sendPromptToAgentPanel');
  });

  it('dispatches custom prompt with fallback to clipboard if command fails', async () => {
    (vscode.commands as any).getCommands = vi.fn().mockResolvedValue(['unsupported.command']);
    await orchestrator.dispatchCustomPrompt('Referenz: `test.md`\n> sample');
    expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith('Referenz: `test.md`\n> sample');
  });
});
