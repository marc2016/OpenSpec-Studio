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
  mdiChatOutline,
  mdiViewDashboardOutline,
  mdiLightbulbOutline,
  mdiBookOpenPageVariantOutline,
  mdiCompassOutline,
  mdiFormatListCheckbox,
  mdiChevronDown,
  mdiCheck
} from '@mdi/js';
import { getVsCodeApi } from '../hooks/useVscodeApi';
import { I18nProvider, useTranslation } from '../i18n';
import { RelatedFileItem } from '../../shared/types';

const initialData = typeof window !== 'undefined' ? (window as any).OPENSPEC_DATA : undefined;

function getArtifactIcon(kind: RelatedFileItem['kind']) {
  switch (kind) {
    case 'proposal':
      return mdiLightbulbOutline;
    case 'spec':
      return mdiBookOpenPageVariantOutline;
    case 'design':
      return mdiCompassOutline;
    case 'tasks':
      return mdiFormatListCheckbox;
    default:
      return mdiFileDocumentEditOutline;
  }
}

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

function MarkdownEditorAppContent({ onLocaleChange }: { onLocaleChange?: (locale: string) => void }) {
  const { t } = useTranslation();
  const [content, setContent] = useState<string>(() => initialData?.content ?? '');
  const [filePath, setFilePath] = useState<string>(() => initialData?.filePath ?? '');
  const [fileName, setFileName] = useState<string>(() => {
    if (initialData?.filePath) {
      const parts = initialData.filePath.split(/[\\/]/);
      return parts[parts.length - 1] || 'Document.md';
    }
    return 'Document.md';
  });
  const [relatedFiles, setRelatedFiles] = useState<RelatedFileItem[]>(() => initialData?.relatedFiles ?? []);
  const [isSpecsDropdownOpen, setIsSpecsDropdownOpen] = useState<boolean>(false);
  const specsDropdownRef = useRef<HTMLDivElement | null>(null);
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
    const handleClickOutside = (e: MouseEvent) => {
      if (specsDropdownRef.current && !specsDropdownRef.current.contains(e.target as Node)) {
        setIsSpecsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSpecsDropdownOpen(false);
      }
    };
    if (isSpecsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSpecsDropdownOpen]);

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
        if (msg.relatedFiles) {
          setRelatedFiles(msg.relatedFiles);
        }
        if (msg.locale && onLocaleChange) {
          onLocaleChange(msg.locale);
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
  }, [vscode, onLocaleChange]);

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

  const handleOpenDashboard = () => {
    vscode.postMessage({
      command: 'OPEN_DASHBOARD'
    });
  };

  const handleOpenFile = (targetPath: string) => {
    if (targetPath === filePath) return;
    vscode.postMessage({
      command: 'OPEN_FILE',
      filePath: targetPath
    });
  };

  const handleOpenInDefaultEditor = () => {
    vscode.postMessage({
      command: 'OPEN_IN_DEFAULT_EDITOR',
      filePath
    });
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen text-vscode-muted text-xs">
        <span>{t('editor.loading')}</span>
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
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-vscode-border bg-vscode-card text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dashboard Button */}
          <button
            onClick={handleOpenDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-vscode-card border border-vscode-border hover:bg-vscode-hover hover:border-vscode-accent text-vscode-fg transition-colors text-xs font-medium cursor-pointer shadow-xs"
            title={t('editor.dashboardTooltip')}
          >
            <Icon path={mdiViewDashboardOutline} className="w-3.5 h-3.5 text-vscode-accent" />
            <span>{t('editor.dashboard')}</span>
          </button>

          <div className="h-4 w-px bg-vscode-border mx-1" />

          {/* Current File indicator */}
          <div className="flex items-center gap-1.5">
            <Icon path={mdiFileDocumentEditOutline} className="w-4 h-4 text-vscode-accent" />
            <span className="font-semibold text-vscode-fg">{fileName}</span>
            {isDirty && <span className="text-[10px] text-amber-400 font-mono">{t('editor.unsaved')}</span>}
            {!isDirty && (
              <span className="text-[10px] text-vscode-muted flex items-center gap-1 font-mono">
                <Icon path={mdiCheckCircleOutline} className="w-3 h-3 text-emerald-400" />
                {t('editor.synced')}
              </span>
            )}
          </div>

          {/* Related change files switcher */}
          {relatedFiles.length > 1 && (() => {
            const proposalFile = relatedFiles.find((f) => f.kind === 'proposal');
            const specFiles = relatedFiles.filter((f) => f.kind === 'spec');
            const designFile = relatedFiles.find((f) => f.kind === 'design');
            const tasksFile = relatedFiles.find((f) => f.kind === 'tasks');
            const otherFiles = relatedFiles.filter((f) => f.kind === 'other');
            const activeSpec = specFiles.find((f) => f.active || f.filePath === filePath);
            const isSpecActive = Boolean(activeSpec);

            return (
              <>
                <div className="h-4 w-px bg-vscode-border mx-1" />
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {/* Proposal Button */}
                  {proposalFile && (
                    <button
                      key={proposalFile.filePath}
                      onClick={() => handleOpenFile(proposalFile.filePath)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        proposalFile.active || proposalFile.filePath === filePath
                          ? 'bg-vscode-accent/20 text-vscode-accent border border-vscode-accent/40 font-semibold shadow-2xs'
                          : 'bg-vscode-bg/80 text-vscode-muted hover:text-vscode-fg hover:bg-vscode-hover border border-vscode-border/50'
                      }`}
                      title={t('editor.openFileTooltip', { label: proposalFile.label })}
                    >
                      <Icon path={mdiLightbulbOutline} className="w-3 h-3 opacity-90" />
                      <span>{proposalFile.label}</span>
                    </button>
                  )}

                  {/* Single Spec Direct Button */}
                  {specFiles.length === 1 && (
                    <button
                      key={specFiles[0].filePath}
                      onClick={() => handleOpenFile(specFiles[0].filePath)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        specFiles[0].active || specFiles[0].filePath === filePath
                          ? 'bg-vscode-accent/20 text-vscode-accent border border-vscode-accent/40 font-semibold shadow-2xs'
                          : 'bg-vscode-bg/80 text-vscode-muted hover:text-vscode-fg hover:bg-vscode-hover border border-vscode-border/50'
                      }`}
                      title={t('editor.openFileTooltip', { label: specFiles[0].label })}
                    >
                      <Icon path={mdiBookOpenPageVariantOutline} className="w-3 h-3 opacity-90" />
                      <span>{specFiles[0].label}</span>
                    </button>
                  )}

                  {/* Multiple Specs Dropdown Menu */}
                  {specFiles.length > 1 && (
                    <div className="relative inline-block" ref={specsDropdownRef}>
                      <button
                        onClick={() => setIsSpecsDropdownOpen((prev) => !prev)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          isSpecActive
                            ? 'bg-vscode-accent/20 text-vscode-accent border border-vscode-accent/40 font-semibold shadow-2xs'
                            : 'bg-vscode-bg/80 text-vscode-muted hover:text-vscode-fg hover:bg-vscode-hover border border-vscode-border/50'
                        }`}
                        title={t('editor.specsDropdownTooltip')}
                        aria-expanded={isSpecsDropdownOpen}
                        aria-haspopup="true"
                      >
                        <Icon path={mdiBookOpenPageVariantOutline} className="w-3 h-3 opacity-90" />
                        <span>
                          {isSpecActive && activeSpec
                            ? activeSpec.label
                            : t('editor.specsDropdownCount', { count: specFiles.length })}
                        </span>
                        <Icon
                          path={mdiChevronDown}
                          className={`w-3 h-3 opacity-70 transition-transform duration-150 ${
                            isSpecsDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isSpecsDropdownOpen && (
                        <div className="absolute left-0 mt-1 min-w-[220px] max-w-[340px] max-h-72 overflow-y-auto rounded-md bg-vscode-card border border-vscode-border shadow-2xl z-50 p-1 flex flex-col gap-0.5 animate-in fade-in-50 zoom-in-95">
                          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-vscode-muted border-b border-vscode-border/50 mb-0.5">
                            {t('editor.specsDropdown')} ({specFiles.length})
                          </div>
                          {specFiles.map((spec) => {
                            const isSelected = spec.active || spec.filePath === filePath;
                            return (
                              <button
                                key={spec.filePath}
                                onClick={() => {
                                  setIsSpecsDropdownOpen(false);
                                  handleOpenFile(spec.filePath);
                                }}
                                className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded text-[11px] text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-vscode-accent/20 text-vscode-accent font-semibold'
                                    : 'text-vscode-fg hover:bg-vscode-hover hover:text-vscode-fg'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Icon path={mdiBookOpenPageVariantOutline} className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                  <span className="truncate">{spec.label.replace(/^Spec:\s*/, '')}</span>
                                </div>
                                {isSelected && <Icon path={mdiCheck} className="w-3.5 h-3.5 shrink-0 text-vscode-accent" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Design Button */}
                  {designFile && (
                    <button
                      key={designFile.filePath}
                      onClick={() => handleOpenFile(designFile.filePath)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        designFile.active || designFile.filePath === filePath
                          ? 'bg-vscode-accent/20 text-vscode-accent border border-vscode-accent/40 font-semibold shadow-2xs'
                          : 'bg-vscode-bg/80 text-vscode-muted hover:text-vscode-fg hover:bg-vscode-hover border border-vscode-border/50'
                      }`}
                      title={t('editor.openFileTooltip', { label: designFile.label })}
                    >
                      <Icon path={mdiCompassOutline} className="w-3 h-3 opacity-90" />
                      <span>{designFile.label}</span>
                    </button>
                  )}

                  {/* Tasks Button */}
                  {tasksFile && (
                    <button
                      key={tasksFile.filePath}
                      onClick={() => handleOpenFile(tasksFile.filePath)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        tasksFile.active || tasksFile.filePath === filePath
                          ? 'bg-vscode-accent/20 text-vscode-accent border border-vscode-accent/40 font-semibold shadow-2xs'
                          : 'bg-vscode-bg/80 text-vscode-muted hover:text-vscode-fg hover:bg-vscode-hover border border-vscode-border/50'
                      }`}
                      title={t('editor.openFileTooltip', { label: tasksFile.label })}
                    >
                      <Icon path={mdiFormatListCheckbox} className="w-3 h-3 opacity-90" />
                      <span>{tasksFile.label}</span>
                    </button>
                  )}

                  {/* Other Files */}
                  {otherFiles.map((file) => {
                    const isActive = file.active || file.filePath === filePath;
                    return (
                      <button
                        key={file.filePath}
                        onClick={() => handleOpenFile(file.filePath)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-vscode-accent/20 text-vscode-accent border border-vscode-accent/40 font-semibold shadow-2xs'
                            : 'bg-vscode-bg/80 text-vscode-muted hover:text-vscode-fg hover:bg-vscode-hover border border-vscode-border/50'
                        }`}
                        title={t('editor.openFileTooltip', { label: file.label })}
                      >
                        <Icon path={getArtifactIcon(file.kind)} className="w-3 h-3 opacity-90" />
                        <span>{file.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>

        {/* Action to switch to default text editor */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInDefaultEditor}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hover transition-colors text-xs font-medium cursor-pointer shadow-xs"
            title={t('editor.openDefaultEditorTooltip')}
          >
            <Icon path={mdiCodeBraces} className="w-3.5 h-3.5" />
            <span>{t('editor.openDefaultEditor')}</span>
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

export function MarkdownEditorApp() {
  const [locale, setLocale] = useState<string>(() => initialData?.locale ?? 'en');

  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      if (event.data?.type === 'INIT_EDITOR' && event.data.locale) {
        setLocale(event.data.locale);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  return (
    <I18nProvider locale={locale}>
      <MarkdownEditorAppContent onLocaleChange={setLocale} />
    </I18nProvider>
  );
}

