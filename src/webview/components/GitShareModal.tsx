import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiSourceBranch,
  mdiUpload,
  mdiCheck,
  mdiContentCopy,
  mdiOpenInNew,
  mdiClose,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiLoading
} from '@mdi/js';
import { GitState, GitOperationResult } from '../../shared/types';
import { Button } from './ui/Button';
import { useTranslation } from '../i18n';

export interface GitShareModalProps {
  isOpen: boolean;
  mode: 'share' | 'branch';
  onClose: () => void;
  gitState?: GitState;
  isOperating: boolean;
  result: GitOperationResult | null;
  onCommitAndPush: (message?: string) => void;
  onCreateBranch: (branchName: string) => void;
  defaultBranchName?: string;
  defaultNote?: string;
}

export function GitShareModal({
  isOpen,
  mode,
  onClose,
  gitState,
  isOperating,
  result,
  onCommitAndPush,
  onCreateBranch,
  defaultBranchName = '',
  defaultNote = ''
}: GitShareModalProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [branchName, setBranchName] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNote(defaultNote);
      setBranchName(defaultBranchName);
      setCopied(false);
      setValidationError(null);
    }
  }, [isOpen, defaultBranchName, defaultNote]);

  if (!isOpen) return null;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = branchName.trim();
    if (!clean) {
      setValidationError(t('gitModal.validationEmpty'));
      return;
    }
    if (/[\s~^:?*\[\\]/.test(clean)) {
      setValidationError(t('gitModal.validationInvalid'));
      return;
    }
    setValidationError(null);
    onCreateBranch(clean);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCommitAndPush(note.trim() || undefined);
  };

  const currentBranch = gitState?.branch || 'HEAD';
  const uncommittedCount = gitState?.uncommittedCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0">
      <div 
        className="w-full max-w-md rounded-xl bg-vscode-card border border-vscode-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-vscode-border bg-vscode-accent/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-vscode-accent/15 flex items-center justify-center text-vscode-accent">
              <Icon 
                path={mode === 'branch' ? mdiSourceBranch : mdiUpload} 
                className="w-4 h-4" 
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vscode-fg">
                {mode === 'branch' ? t('gitModal.createBranchTitle') : t('gitModal.saveAndShareTitle')}
              </h3>
              <p className="text-[11px] text-vscode-muted">
                {mode === 'branch' 
                  ? t('gitModal.createBranchDesc') 
                  : t('gitModal.saveAndShareDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isOperating}
            className="p-1 rounded-md text-vscode-muted hover:text-vscode-fg hover:bg-vscode-bg transition-colors cursor-pointer"
            title={t('gitModal.cancel')}
          >
            <Icon path={mdiClose} className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Ongoing Operation Spinner */}
          {isOperating ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Icon path={mdiLoading} className="w-8 h-8 text-vscode-accent animate-spin" />
              <p className="text-sm font-medium text-vscode-fg">
                {mode === 'branch' ? t('gitModal.operatingBranch') : t('gitModal.operatingShare')}
              </p>
              <p className="text-xs text-vscode-muted max-w-xs">
                {t('gitModal.operatingHint')}
              </p>
            </div>
          ) : result?.success ? (
            /* Success State */
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Icon path={mdiCheckCircle} className="w-5 h-5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold">{result.message || t('gitModal.successTitle')}</div>
                  {result.branch && (
                    <div className="text-emerald-300/80 font-mono mt-0.5">
                      {t('gitModal.branchResult', { branch: result.branch })}
                    </div>
                  )}
                </div>
              </div>

              {result.shareUrl ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-vscode-muted uppercase tracking-wider">
                    {t('gitModal.shareUrlLabel')}
                  </label>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-vscode-bg border border-vscode-border">
                    <span className="text-xs font-mono text-vscode-fg truncate flex-1 select-all">
                      {result.shareUrl}
                    </span>
                    <button
                      onClick={() => handleCopyLink(result.shareUrl!)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-vscode-accent/20 hover:bg-vscode-accent/30 text-vscode-accent flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Icon path={copied ? mdiCheck : mdiContentCopy} className="w-3.5 h-3.5" />
                      {copied ? t('gitModal.copied') : t('gitModal.copy')}
                    </button>
                    <a
                      href={result.shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card transition-colors"
                      title={t('gitModal.openInBrowser')}
                    >
                      <Icon path={mdiOpenInNew} className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* Input / Confirmation Form */
            <>
              {/* Error banner if previous attempt failed */}
              {result?.error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                  <Icon path={mdiAlertCircle} className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-semibold">{t('gitModal.unableToComplete')} </span>
                    {result.error}
                  </div>
                </div>
              )}

              {validationError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                  <Icon path={mdiAlertCircle} className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {mode === 'branch' ? (
                /* Create Branch Form */
                <form onSubmit={handleCreateBranchSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-vscode-fg mb-1.5">
                      {t('gitModal.newBranchLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder={t('gitModal.newBranchPlaceholder')}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-vscode-bg border border-vscode-border focus:border-vscode-accent focus:outline-none text-vscode-fg"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-vscode-muted mt-1.5">
                      {t('gitModal.newBranchExplanation', { branch: currentBranch })}
                    </p>
                  </div>
                </form>
              ) : (
                /* Save & Share Form */
                <form onSubmit={handleShareSubmit} className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-vscode-bg border border-vscode-border text-xs">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiSourceBranch} className="w-4 h-4 text-vscode-muted" />
                      <span className="text-vscode-muted">{t('gitModal.branchLabel')}</span>
                      <span className="font-mono font-medium text-vscode-fg">{currentBranch}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${uncommittedCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span className="font-medium text-vscode-fg">
                        {uncommittedCount > 0 ? t('gitModal.modifiedFiles', { count: uncommittedCount }) : t('gitModal.upToDate')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-vscode-fg mb-1.5">
                      {t('gitModal.noteLabel')} <span className="text-vscode-muted font-normal">{t('gitModal.noteOptional')}</span>
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('gitModal.notePlaceholder')}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-vscode-bg border border-vscode-border focus:border-vscode-accent focus:outline-none text-vscode-fg"
                    />
                    <p className="text-[11px] text-vscode-muted mt-1.5">
                      {t('gitModal.noteExplanation')}
                    </p>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-vscode-border bg-vscode-card/50">
          {result?.success ? (
            <Button variant="primary" size="sm" onClick={onClose}>
              {t('gitModal.done')}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose} 
                disabled={isOperating}
              >
                {t('gitModal.cancel')}
              </Button>
              {mode === 'branch' ? (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleCreateBranchSubmit}
                  disabled={isOperating}
                >
                  {t('gitModal.createAndSwitch')}
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleShareSubmit}
                  disabled={isOperating}
                >
                  <Icon path={mdiUpload} className="w-3.5 h-3.5 mr-1" />
                  {t('gitModal.saveAndShare')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
