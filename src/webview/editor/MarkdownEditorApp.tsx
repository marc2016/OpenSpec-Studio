import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  BlockTypeSelect,
  ListsToggle,
  CodeToggle,
  InsertTable,
  InsertThematicBreak,
  DiffSourceToggleWrapper
} from '@mdxeditor/editor';
import Icon from '@mdi/react';
import {
  mdiFileDocumentEditOutline,
  mdiCodeBraces,
  mdiCheckCircleOutline,
  mdiOpenInNew,
  mdiChatOutline
} from '@mdi/js';
import { getVsCodeApi } from '../hooks/useVscodeApi';

const initialData = typeof window !== 'undefined' ? (window as any).OPENSPEC_DATA : undefined;

function navigateToRequirement(requirementName: string) {
  if (!requirementName) return;

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetNorm = normalize(requirementName);

  const attemptScroll = (retryCount: number = 0) => {
    const editorEl = document.querySelector('.openspec-mdx-editor') || document.body;
    const headings = editorEl.querySelectorAll('h1, h2, h3, h4, h5, h6');

    let matchedElement: HTMLElement | null = null;
    for (const h of Array.from(headings)) {
      const text = h.textContent || '';
      if (normalize(text).includes(targetNorm)) {
        matchedElement = h as HTMLElement;
        break;
      }
    }

    if (matchedElement) {
      matchedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Remove existing highlights
      document.querySelectorAll('.openspec-requirement-highlight').forEach((el) => {
        el.classList.remove('openspec-requirement-highlight');
      });

      // Add temporary highlight animation class
      matchedElement.classList.add('openspec-requirement-highlight');
      setTimeout(() => {
        matchedElement?.classList.remove('openspec-requirement-highlight');
      }, 3000);
    } else if (retryCount < 5) {
      setTimeout(() => attemptScroll(retryCount + 1), 120);
    }
  };

  attemptScroll();
}

export function MarkdownEditorApp() {
  const [content, setContent] = useState<string>(() => initialData?.content ?? '');
  const [filePath, setFilePath] = useState<string>(() => initialData?.filePath ?? '');
  const [fileName, setFileName] = useState<string>(() => {
    if (initialData?.filePath) {
      const parts = initialData.filePath.split(/[\\/]/);
      return parts[parts.length - 1] || 'Document.md';
    }
    return 'Document.md';
  });
  const [isReady, setIsReady] = useState<boolean>(() => Boolean(initialData));
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [selectionBubble, setSelectionBubble] = useState<{
    text: string;
    top: number;
    left: number;
    visible: boolean;
  }>({ text: '', top: 0, left: 0, visible: false });

  const editorRef = useRef<MDXEditorMethods | null>(null);
  const editorBodyRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserEditRef = useRef<boolean>(false);
  const lastSyncedContentRef = useRef<string>(initialData?.content ?? '');
  const initialContentRef = useRef<string>(initialData?.content ?? '');
  const vscode = getVsCodeApi();

  useEffect(() => {
    // If opened with initial target requirement, navigate after initial render
    if (initialData?.targetRequirement) {
      setTimeout(() => navigateToRequirement(initialData.targetRequirement), 180);
    }

    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'INIT_EDITOR') {
        const text = msg.content ?? '';
        setContent(text);
        initialContentRef.current = text;
        lastSyncedContentRef.current = text;
        isUserEditRef.current = false;
        if (msg.filePath) {
          setFilePath(msg.filePath);
          const parts = msg.filePath.split(/[\\/]/);
          setFileName(parts[parts.length - 1] || 'Document.md');
        }
        setIsReady(true);
        setIsDirty(Boolean(msg.isDirty));
        if (msg.targetRequirement) {
          setTimeout(() => navigateToRequirement(msg.targetRequirement), 180);
        }
      } else if (msg.type === 'NAVIGATE_TO_REQUIREMENT') {
        if (msg.requirementName) {
          navigateToRequirement(msg.requirementName);
        }
      } else if (msg.type === 'DOCUMENT_UPDATE') {
        const newText = msg.content ?? '';
        setContent(newText);
        lastSyncedContentRef.current = newText;
        isUserEditRef.current = false;
        if (editorRef.current) {
          editorRef.current.setMarkdown(newText);
        }
        setIsDirty(false);
      } else if (msg.type === 'DIRTY_STATE_CHANGE') {
        setIsDirty(Boolean(msg.isDirty));
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify extension that webview is ready to receive initial content
    vscode.postMessage({ command: 'READY' });

    return () => {
      window.removeEventListener('message', handleMessage);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const markUserInteraction = useCallback(() => {
    isUserEditRef.current = true;
  }, []);

  const checkSelection = useCallback(() => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setSelectionBubble((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length === 0) {
        setSelectionBubble((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const editorContainer = editorBodyRef.current;
      if (!editorContainer) return;

      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (!anchorNode || !focusNode) return;

      if (!editorContainer.contains(anchorNode) || !editorContainer.contains(focusNode)) {
        setSelectionBubble((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = editorContainer.getBoundingClientRect();

      let top = rect.top - 40;
      if (top < containerRect.top + 8) {
        top = rect.bottom + 8;
      }

      let left = rect.left + rect.width / 2;
      left = Math.max(70, Math.min(window.innerWidth - 70, left));

      setSelectionBubble({
        text,
        top,
        left,
        visible: true
      });
    });
  }, []);

  const handleAddToChat = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectionBubble.text) return;

    vscode.postMessage({
      command: 'ADD_TO_CHAT',
      text: selectionBubble.text,
      filePath
    });

    setSelectionBubble((prev) => ({ ...prev, visible: false }));
  }, [selectionBubble.text, filePath, vscode]);

  const handleContainerPointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (!target.closest('.openspec-selection-bubble')) {
      setSelectionBubble((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }

    if (
      target.closest('button') ||
      target.closest('.mdxeditor-toolbar') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('[role="button"]') ||
      target.closest('[role="menuitem"]')
    ) {
      isUserEditRef.current = true;
    }
  }, []);

  const handleContentChange = useCallback((newMarkdown: string) => {
    // If this change was triggered without user interaction (e.g. initial AST normalization by MDXEditor on mount),
    // update our synced baseline but do NOT mark dirty or send DOCUMENT_EDIT to VS Code.
    if (!isUserEditRef.current) {
      lastSyncedContentRef.current = newMarkdown;
      return;
    }

    if (newMarkdown === lastSyncedContentRef.current) {
      return;
    }

    lastSyncedContentRef.current = newMarkdown;
    setContent(newMarkdown);
    setIsDirty(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      vscode.postMessage({
        command: 'DOCUMENT_EDIT',
        text: newMarkdown
      });
    }, 250);
  }, [vscode]);

  const handleOpenInDefaultEditor = () => {
    vscode.postMessage({
      command: 'OPEN_IN_DEFAULT_EDITOR',
      filePath
    });
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen text-vscode-muted text-xs">
        <span>Loading OpenSpec Markdown Editor...</span>
      </div>
    );
  }

  return (
    <div
      className="openspec-editor-container flex flex-col min-h-screen bg-vscode-editor-bg text-vscode-fg"
      onKeyDown={markUserInteraction}
      onInput={markUserInteraction}
      onPaste={markUserInteraction}
      onCut={markUserInteraction}
      onDrop={markUserInteraction}
      onCompositionStart={markUserInteraction}
      onPointerDown={handleContainerPointerDown}
      onPointerUp={checkSelection}
      onKeyUp={checkSelection}
    >
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-vscode-border bg-vscode-card text-xs">
        <div className="flex items-center gap-2">
          <Icon path={mdiFileDocumentEditOutline} className="w-4 h-4 text-vscode-accent" />
          <span className="font-semibold text-vscode-fg">{fileName}</span>
          {isDirty && <span className="text-[10px] text-amber-400 font-mono">(unsaved)</span>}
          {!isDirty && (
            <span className="text-[10px] text-vscode-muted flex items-center gap-1 font-mono">
              <Icon path={mdiCheckCircleOutline} className="w-3 h-3 text-emerald-400" />
              synced
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInDefaultEditor}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hover transition-colors text-xs font-medium cursor-pointer shadow-xs"
            title="Open this file in VS Code's standard text editor"
          >
            <Icon path={mdiCodeBraces} className="w-3.5 h-3.5" />
            <span>In VS Code Text-Editor öffnen</span>
            <Icon path={mdiOpenInNew} className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* Editor Body with MDXEditor */}
      <div
        ref={editorBodyRef}
        onScroll={() => setSelectionBubble((prev) => (prev.visible ? { ...prev, visible: false } : prev))}
        className="flex-1 p-4 max-w-5xl w-full mx-auto overflow-y-auto"
      >
        <MDXEditor
          ref={editorRef}
          markdown={content}
          onChange={handleContentChange}
          toMarkdownOptions={{
            bullet: '-',
            join: [
              (left: any, right: any) => {
                // Prevent automatic blank lines between headings and subsequent content
                if (left.type === 'heading' && right.type !== 'heading') {
                  return 0;
                }
                return undefined;
              }
            ]
          }}
          className="openspec-mdx-editor"
          contentEditableClassName="openspec-editor-content focus:outline-none"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            tablePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            diffSourcePlugin({
              viewMode: 'rich-text',
              diffMarkdown: initialContentRef.current || content
            }),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper options={['rich-text', 'diff', 'source']}>
                  <UndoRedo />
                  <BlockTypeSelect />
                  <BoldItalicUnderlineToggles />
                  <StrikeThroughSupSubToggles />
                  <ListsToggle />
                  <CodeToggle />
                  <InsertTable />
                  <InsertThematicBreak />
                </DiffSourceToggleWrapper>
              )
            })
          ]}
        />
      </div>

      {/* Floating Add to Chat Bubble */}
      {selectionBubble.visible && (
        <div
          className="openspec-selection-bubble fixed transition-opacity duration-150 z-50 pointer-events-auto"
          style={{
            top: `${selectionBubble.top}px`,
            left: `${selectionBubble.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <button
            onPointerDown={(e) => {
              e.preventDefault();
            }}
            onClick={handleAddToChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-vscode-accent text-white font-medium text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/20"
            title="Add selection to AI Chat"
          >
            <Icon path={mdiChatOutline} className="w-3.5 h-3.5" />
            <span>Add to Chat</span>
          </button>
        </div>
      )}
    </div>
  );
}
