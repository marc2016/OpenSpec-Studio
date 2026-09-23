import React from 'react';
import Icon from '@mdi/react';
import {
  mdiLayers,
  mdiRobotOutline,
  mdiRefresh,
  mdiCheckCircle,
  mdiAlertCircle
} from '@mdi/js';
import { AiTarget, CliInfo } from '../../shared/types';
import { Button } from './ui/Button';

interface HeaderProps {
  cliInfo: CliInfo;
  aiTarget: AiTarget;
  onSetAiTarget: (target: AiTarget) => void;
  onRefresh: () => void;
}

export function Header({ cliInfo, aiTarget, onSetAiTarget, onRefresh }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-vscode-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-vscode-accent/20 border border-vscode-accent/40 flex items-center justify-center text-vscode-accent">
          <Icon path={mdiLayers} className="w-5 h-5 text-vscode-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">OpenSpec Studio</h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-vscode-accent/15 text-vscode-accent border border-vscode-accent/30">
              v0.1.0
            </span>
          </div>
          <p className="text-xs text-vscode-muted mt-0.5">
            Spec-driven engineering, changes & autonomous AI workflows
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
          <span className="text-vscode-muted">CLI:</span>
          <span className="font-mono font-medium">
            {cliInfo.mode} {cliInfo.version ? `(${cliInfo.version})` : ''}
          </span>
        </div>

        {/* AI Target Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-vscode-card border border-vscode-border text-xs">
          <span className="text-vscode-muted flex items-center gap-1">
            <Icon path={mdiRobotOutline} className="w-3.5 h-3.5" /> AI:
          </span>
          <select
            value={aiTarget}
            onChange={(e) => onSetAiTarget(e.target.value as AiTarget)}
            className="bg-transparent border-none text-xs font-medium text-vscode-fg focus:outline-none cursor-pointer"
          >
            <option value="copilot" className="bg-vscode-card">GitHub Copilot Chat</option>
            <option value="terminal" className="bg-vscode-card">Integrated Terminal</option>
            <option value="clipboard" className="bg-vscode-card">Copy to Clipboard</option>
          </select>
        </div>

        {/* Refresh */}
        <Button variant="outline" size="sm" onClick={onRefresh} title="Refresh OpenSpec state">
          <Icon path={mdiRefresh} className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}
