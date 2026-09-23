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
  mdiOpenInNew
} from '@mdi/js';
import { getVsCodeApi } from '../hooks/useVscodeApi';

const initialData = typeof window !== 'undefined' ? (window as any).OPENSPEC_DATA : undefined;

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

  const editorRef = useRef<MDXEditorMethods | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vscode = getVsCodeApi();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'INIT_EDITOR') {
        const text = msg.content ?? '';
        setContent(text);
        if (msg.filePath) {
          setFilePath(msg.filePath);
          const parts = msg.filePath.split(/[\\/]/);
          setFileName(parts[parts.length - 1] || 'Document.md');
        }
        setIsReady(true);
        setIsDirty(false);
      } else if (msg.type === 'DOCUMENT_UPDATE') {
        const newText = msg.content ?? '';
        setContent(newText);
        if (editorRef.current) {
          editorRef.current.setMarkdown(newText);
        }
        setIsDirty(false);
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

  const handleContentChange = useCallback((newMarkdown: string) => {
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
      setIsDirty(false);
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
    <div className="openspec-editor-container flex flex-col min-h-screen bg-vscode-editor-bg text-vscode-fg">
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
      <div className="flex-1 p-4 max-w-5xl w-full mx-auto overflow-y-auto">
        <MDXEditor
          ref={editorRef}
          markdown={content}
          onChange={handleContentChange}
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
              diffMarkdown: content
            }),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper options={['rich-text', 'source']}>
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
    </div>
  );
}
