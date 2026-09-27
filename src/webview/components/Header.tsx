import React from 'react';
import Icon from '@mdi/react';
import {
  mdiRobotOutline,
  mdiRefresh,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiSourceBranch,
  mdiUpload
} from '@mdi/js';
import { AiTarget, CliInfo, GitState } from '../../shared/types';
import { Button } from './ui/Button';
import { OpenSpecLogo } from './ui/OpenSpecLogo';
import { useTranslation } from '../i18n';

interface HeaderProps {
  cliInfo: CliInfo;
  aiTarget: AiTarget;
  loading?: boolean;
  onSetAiTarget: (target: AiTarget) => void;
  onRefresh: () => void;
  gitState?: GitState;
  onOpenShareModal?: () => void;
  onOpenBranchModal?: () => void;
}

export function Header({
  cliInfo,
  aiTarget,
  loading,
  onSetAiTarget,
  onRefresh,
  gitState,
  onOpenShareModal,
  onOpenBranchModal
}: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-vscode-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-vscode-accent/20 border border-vscode-accent/40 flex items-center justify-center text-vscode-accent">
          <OpenSpecLogo className="w-6 h-6 text-vscode-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{t('header.title')}</h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-vscode-accent/15 text-vscode-accent border border-vscode-accent/30">
              {t('header.version')}
            </span>
          </div>
          <p className="text-xs text-vscode-muted mt-0.5">
            {t('header.subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* CLI Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-vscode-card border border-vscode-border text-xs">
          {cliInfo.isAvailable ? (
            <Icon path={mdiCheckCircle} className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Icon path={mdiAlertCircle} className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-vscode-muted">{t('header.cli')}</span>
          <span className="font-mono font-medium">
            {cliInfo.mode} {cliInfo.version ? `(${cliInfo.version})` : ''}
          </span>
        </div>

        {/* AI Target Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-vscode-card border border-vscode-border text-xs">
          <span className="text-vscode-muted flex items-center gap-1">
            <Icon path={mdiRobotOutline} className="w-3.5 h-3.5" /> {t('header.ai')}
          </span>
          <select
            value={aiTarget}
            onChange={(e) => onSetAiTarget(e.target.value as AiTarget)}
            className="bg-transparent border-none text-xs font-medium text-vscode-fg focus:outline-none cursor-pointer"
          >
            <option value="copilot" className="bg-vscode-card">{t('aiTargets.copilot')}</option>
            <option value="cursor" className="bg-vscode-card">{t('aiTargets.cursor')}</option>
            <option value="antigravity" className="bg-vscode-card">{t('aiTargets.antigravity')}</option>
            <option value="terminal" className="bg-vscode-card">{t('aiTargets.terminal')}</option>
            <option value="clipboard" className="bg-vscode-card">{t('aiTargets.clipboard')}</option>
          </select>
        </div>

        {/* Git Branch Badge */}
        {gitState?.isGitRepo && (
          <div
            onClick={onOpenBranchModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-vscode-card border border-vscode-border hover:border-vscode-accent/50 text-xs cursor-pointer transition-colors"
            title={t('header.branchTooltip')}
          >
            <Icon path={mdiSourceBranch} className="w-3.5 h-3.5 text-vscode-accent" />
            <span className="font-mono font-medium truncate max-w-[130px] text-vscode-fg">
              {gitState.branch || 'HEAD'}
            </span>
            {gitState.uncommittedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-mono border border-amber-500/30 font-semibold" title={t('header.uncommittedTooltip', { count: gitState.uncommittedCount })}>
                {gitState.uncommittedCount}
              </span>
            )}
          </div>
        )}

        {/* Git Save & Share */}
        {gitState?.isGitRepo && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenShareModal}
            title={t('header.saveAndShare')}
          >
            <Icon path={mdiUpload} className="w-3.5 h-3.5 mr-1" />
            {t('header.saveAndShare')}
          </Button>
        )}

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          title={t('header.refreshTooltip')}
        >
          <Icon path={mdiRefresh} className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-vscode-accent' : ''}`} />
        </Button>
      </div>
    </header>
  );
}
