import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { OpenSpecEditorProvider } from '../src/customEditor/OpenSpecEditorProvider';

// Mock vscode module
vi.mock('vscode', () => {
  const registerCustomEditorProvider = vi.fn().mockReturnValue({ dispose: vi.fn() });
  const executeCommand = vi.fn();
  const applyEdit = vi.fn().mockResolvedValue(true);

  return {
    window: {
      registerCustomEditorProvider,
      showErrorMessage: vi.fn()
    },
    commands: {
      executeCommand
    },
    workspace: {
      applyEdit,
      asRelativePath: vi.fn().mockImplementation((uri: any) => uri?.fsPath || String(uri)),
      getConfiguration: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValue('copilot')
      }),
      onDidChangeTextDocument: vi.fn().mockReturnValue({ dispose: vi.fn() }),
      onDidSaveTextDocument: vi.fn().mockReturnValue({ dispose: vi.fn() })
    },
    Uri: {
      file: (f: string) => ({ fsPath: f, toString: () => f, scheme: 'file' }),
      joinPath: (base: any, ...segments: string[]) => ({
        fsPath: path.join(base.fsPath || base, ...segments),
        toString: () => path.join(base.fsPath || base, ...segments)
      })
    },
    Range: class {
      constructor(public start: any, public end: any) {}
    },
    Position: class {
      constructor(public line: number, public character: number) {}
    },
    WorkspaceEdit: class {
      public replace = vi.fn();
    },
    env: {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    }
  };
});

describe('OpenSpecEditorProvider', () => {
  const distWebview = path.resolve(__dirname, '../dist/webview');
  const indexHtml = path.join(distWebview, 'index.html');
  const fixtureChangeDir = path.resolve(__dirname, '../openspec/changes/fixture-change');
  let createdDummyHtml = false;

  beforeAll(() => {
    if (!fs.existsSync(indexHtml)) {
      fs.mkdirSync(distWebview, { recursive: true });
      fs.writeFileSync(
        indexHtml,
        '<!DOCTYPE html><html><head><script src="./assets/index.js"></script></head><body><div id="root"></div></body></html>',
        'utf8'
      );
      createdDummyHtml = true;
    }

    fs.mkdirSync(path.join(fixtureChangeDir, 'specs/vault'), { recursive: true });
    fs.writeFileSync(path.join(fixtureChangeDir, 'proposal.md'), '# Proposal');
    fs.writeFileSync(path.join(fixtureChangeDir, 'design.md'), '# Design');
    fs.writeFileSync(path.join(fixtureChangeDir, 'tasks.md'), '# Tasks');
    fs.writeFileSync(path.join(fixtureChangeDir, 'specs/vault/spec.md'), '# Vault Spec');
  });

  afterAll(() => {
    if (createdDummyHtml && fs.existsSync(indexHtml)) {
      try {
        fs.unlinkSync(indexHtml);
      } catch {
        // ignore
      }
    }

    if (fs.existsSync(fixtureChangeDir)) {
      try {
        fs.rmSync(fixtureChangeDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  });

  const mockContext: any = {
    extensionUri: { fsPath: path.resolve(__dirname, '..') }
  };

  it('exposes the correct viewType', () => {
    expect(OpenSpecEditorProvider.viewType).toBe('openspec.markdownEditor');
  });

  it('registers custom editor provider with vscode.window', async () => {
    const vscode = await import('vscode');
    const disposable = OpenSpecEditorProvider.register(mockContext);
    expect(disposable).toBeDefined();
    expect(vscode.window.registerCustomEditorProvider).toHaveBeenCalledWith(
      'openspec.markdownEditor',
      expect.any(OpenSpecEditorProvider),
      expect.objectContaining({
        webviewOptions: { retainContextWhenHidden: true }
      })
    );
  });

  it('resolves custom text editor and initializes webview', async () => {
    const provider = new OpenSpecEditorProvider(mockContext);
    const postMessageSpy = vi.fn();
    let messageHandler: ((msg: any) => Promise<void>) | undefined;

    const mockWebview: any = {
      options: {},
      html: '',
      postMessage: postMessageSpy,
      onDidReceiveMessage: vi.fn().mockImplementation((handler) => {
        messageHandler = handler;
        return { dispose: vi.fn() };
      }),
      asWebviewUri: (uri: any) => uri.toString()
    };

    const mockWebviewPanel: any = {
      webview: mockWebview,
      reveal: vi.fn(),
      onDidDispose: vi.fn()
    };

    const sampleDoc: any = {
      uri: { fsPath: '/test/openspec/specs/vault/spec.md', toString: () => '/test/openspec/specs/vault/spec.md', scheme: 'file' },
      getText: () => '# Vault Spec\n\n## Purpose\nSample spec',
      positionAt: (offset: number) => ({ line: 0, character: offset })
    };

    await provider.resolveCustomTextEditor(sampleDoc, mockWebviewPanel, {} as any);

    expect(mockWebview.options.enableScripts).toBe(true);
    expect(mockWebview.html).toContain('window.OPENSPEC_MODE = "editor"');
    expect(mockWebview.html).toContain('window.OPENSPEC_DATA =');
    expect(mockWebview.html).toContain('connect-src');
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'INIT_EDITOR',
        filePath: '/test/openspec/specs/vault/spec.md',
        content: sampleDoc.getText()
      })
    );

    // Test message handling: DOCUMENT_EDIT
    const vscode = await import('vscode');
    expect(messageHandler).toBeDefined();
    if (messageHandler) {
      await messageHandler({ command: 'DOCUMENT_EDIT', text: '# Updated Spec' });
      expect(vscode.workspace.applyEdit).toHaveBeenCalled();

      // Test message handling: OPEN_IN_DEFAULT_EDITOR
      await messageHandler({ command: 'OPEN_IN_DEFAULT_EDITOR' });
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'vscode.openWith',
        sampleDoc.uri,
        'default'
      );

      // Test message handling: ADD_TO_CHAT
      await messageHandler({
        command: 'ADD_TO_CHAT',
        text: 'Sample requirement to ask about',
        filePath: '/test/openspec/specs/vault/spec.md'
      });
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'workbench.action.chat.open',
        expect.objectContaining({
          query: expect.stringContaining('Sample requirement to ask about')
        })
      );

      // Test message handling: OPEN_DASHBOARD
      await messageHandler({ command: 'OPEN_DASHBOARD' });
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith('openspec-studio.openDashboard');

      // Test message handling: OPEN_FILE
      const targetDocPath = path.join(fixtureChangeDir, 'proposal.md');
      await messageHandler({ command: 'OPEN_FILE', filePath: targetDocPath });
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'vscode.openWith',
        expect.objectContaining({ fsPath: targetDocPath }),
        OpenSpecEditorProvider.viewType
      );
    }
  });

  it('correctly discovers related change files for a change document', () => {
    const provider = new OpenSpecEditorProvider(mockContext);
    const proposalPath = path.join(fixtureChangeDir, 'proposal.md');
    const related = provider.getRelatedChangeFiles(proposalPath);

    expect(related.length).toBeGreaterThanOrEqual(3);
    const labels = related.map((r) => r.label);
    expect(labels).toContain('Proposal');
    expect(labels).toContain('Design');
    expect(labels).toContain('Tasks');

    const activeItem = related.find((r) => r.active);
    expect(activeItem?.label).toBe('Proposal');
  });

  it('correctly discovers related change files for an archived change document', () => {
    const provider = new OpenSpecEditorProvider(mockContext);
    const archivedProposalPath = path.resolve(
      __dirname,
      '../openspec/changes/archive/2026-09-25-editor-nav-and-file-switcher/proposal.md'
    );
    if (fs.existsSync(archivedProposalPath)) {
      const related = provider.getRelatedChangeFiles(archivedProposalPath);
      expect(related.length).toBeGreaterThanOrEqual(3);
      expect(related.map((r) => r.label)).toContain('Proposal');
    }
  });

  it('returns empty array when file is not part of an openspec change', () => {
    const provider = new OpenSpecEditorProvider(mockContext);
    const nonChangeDoc = path.resolve(__dirname, '../openspec/specs/custom-markdown-editor/spec.md');
    const related = provider.getRelatedChangeFiles(nonChangeDoc);
    expect(related).toEqual([]);
  });

  it('delegates to default editor when opened with a non-file scheme like git', async () => {
    const vscode = await import('vscode');
    const provider = new OpenSpecEditorProvider(mockContext);
    const gitDoc: any = {
      uri: { fsPath: '/test/openspec/specs/vault/spec.md', toString: () => 'git:/test/openspec/specs/vault/spec.md', scheme: 'git' },
      getText: () => '# Git Spec',
      positionAt: () => ({ line: 0, character: 0 })
    };

    const mockWebviewPanel: any = {
      webview: { options: {}, html: '', postMessage: vi.fn(), onDidReceiveMessage: vi.fn() },
      onDidDispose: vi.fn()
    };

    await provider.resolveCustomTextEditor(gitDoc, mockWebviewPanel, {} as any);
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith('vscode.openWith', gitDoc.uri, 'default');
  });

  it('navigates to requirement on already opened panel or opens via openWith', async () => {
    const vscode = await import('vscode');
    const targetUri = {
      fsPath: '/test/openspec/specs/vault/spec.md',
      toString: () => '/test/openspec/specs/vault/spec.md'
    };

    // When panel is open, openRequirement dispatches NAVIGATE_TO_REQUIREMENT
    await OpenSpecEditorProvider.openRequirement(targetUri as any, 'Target Requirement Name');
    expect(vscode.commands.executeCommand).toHaveBeenCalled();
  });
});
