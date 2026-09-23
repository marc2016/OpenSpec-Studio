import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiSourcePull,
  mdiCheckCircle,
  mdiChevronRight,
  mdiChevronDown,
  mdiPlay,
  mdiFileDocumentOutline,
  mdiFolderOpenOutline
} from '@mdi/js';
import { OpenSpecChange } from '../../shared/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';

interface ActiveChangesGridProps {
  changes: OpenSpecChange[];
  onRunWorkflow: (action: 'propose' | 'explore' | 'apply' | 'sync' | 'archive', changeName?: string) => void;
  onOpenFile: (path: string) => void;
  onOpenFolder: (changeName: string) => void;
}

export function ActiveChangesGrid({ changes, onRunWorkflow, onOpenFile, onOpenFolder }: ActiveChangesGridProps) {
  const [expandedChange, setExpandedChange] = useState<string | null>(changes[0]?.name || null);

  const toggleExpand = (name: string) => {
    setExpandedChange((prev) => (prev === name ? null : name));
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'info';
      case 'ready':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (changes.length === 0) {
    return (
      <Card className="border-dashed py-8 text-center">
        <Icon path={mdiSourcePull} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-medium">No Active Changes</h4>
        <p className="text-xs text-vscode-muted mt-1 max-w-sm mx-auto">
          Start your next feature or refactor by clicking <strong className="text-vscode-fg">Propose Change</strong> above.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {changes.map((change) => {
        const isExpanded = expandedChange === change.name;
        const progressPercent =
          change.totalTasks > 0 ? Math.round((change.completedTasks / change.totalTasks) * 100) : 0;

        return (
          <Card key={change.name} className="overflow-hidden">
            <CardHeader className="p-4 cursor-pointer hover:bg-vscode-bg/50 transition-colors" onClick={() => toggleExpand(change.name)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button className="text-vscode-muted hover:text-vscode-fg p-0.5">
                    {isExpanded ? (
                      <Icon path={mdiChevronDown} className="w-4 h-4" />
                    ) : (
                      <Icon path={mdiChevronRight} className="w-4 h-4" />
                    )}
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-vscode-accent/10 border border-vscode-accent/20 flex items-center justify-center text-vscode-accent">
                    <Icon path={mdiSourcePull} className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold hover:text-vscode-accent transition-colors">
                      {change.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusVariant(change.status)}>
                        {change.status}
                      </Badge>
                      <span className="text-xs text-vscode-muted font-mono">
                        {change.completedTasks} / {change.totalTasks} tasks ({progressPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onRunWorkflow('apply', change.name)}
                    className="gap-1.5"
                  >
                    <Icon path={mdiPlay} className="w-3.5 h-3.5" />
                    Run AI Apply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenFolder(change.name)}
                    title="Open change folder"
                  >
                    <Icon path={mdiFolderOpenOutline} className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <Progress value={progressPercent} />
              </div>
            </CardHeader>

            {/* Expanded Details */}
            {isExpanded && (
              <CardContent className="p-4 pt-2 border-t border-vscode-border/50 bg-vscode-bg/20 space-y-4">
                {/* Artifacts pills */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-vscode-muted mb-2">
                    Planning Artifacts
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {change.artifacts.map((art) => (
                      <button
                        key={art.id}
                        disabled={!art.exists}
                        onClick={() => art.path && onOpenFile(art.path)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                          art.exists
                            ? 'bg-vscode-card text-vscode-fg border-vscode-border hover:border-vscode-accent cursor-pointer'
                            : 'bg-vscode-bg/50 text-vscode-muted/40 border-vscode-border/40 cursor-not-allowed'
                        }`}
                      >
                        <Icon path={mdiFileDocumentOutline} className="w-3 h-3 text-vscode-muted" />
                        <span>{art.id}</span>
                        {art.exists ? (
                          <Icon path={mdiCheckCircle} className="w-3 h-3 text-emerald-400 ml-0.5" />
                        ) : (
                          <span className="text-[10px] text-vscode-muted ml-0.5">(missing)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasks Checklist */}
                {change.tasks.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-vscode-muted mb-2">
                      Tasks Breakdown
                    </div>
                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                      {change.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-start gap-2 p-2 rounded text-xs transition-colors ${
                            task.done
                              ? 'bg-emerald-500/5 text-vscode-muted line-through'
                              : 'bg-vscode-card border border-vscode-border/60 text-vscode-fg'
                          }`}
                        >
                          <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            task.done
                              ? 'border-emerald-500 bg-emerald-500 text-black'
                              : 'border-vscode-border'
                          }`}>
                            {task.done && <Icon path={mdiCheckCircle} className="w-3 h-3 text-white" />}
                          </div>
                          <span className="break-all">{task.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
