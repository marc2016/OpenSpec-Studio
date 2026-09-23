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

  it('dispatches to clipboard fallback', async () => {
    await orchestrator.dispatch({ action: 'explore', input: 'design' }, 'clipboard');
    expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith('/opsx-explore design');
    expect(vscode.window.showInformationMessage).toHaveBeenCalled();
  });
});
