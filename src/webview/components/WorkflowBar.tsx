import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlusCircleOutline,
  mdiCompassOutline,
  mdiPlayCircleOutline,
  mdiSync,
  mdiArchiveArrowDownOutline,
  mdiCreation
} from '@mdi/js';
import { Button } from './ui/Button';
import { useTranslation } from '../i18n';

interface WorkflowBarProps {
  onRunWorkflow: (action: 'propose' | 'explore' | 'apply' | 'sync' | 'archive', changeName?: string, input?: string) => void;
  activeChangesCount: number;
}

export function WorkflowBar({ onRunWorkflow }: WorkflowBarProps) {
  const { t } = useTranslation();
  const [modalAction, setModalAction] = useState<'propose' | 'explore' | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAction) return;
    onRunWorkflow(modalAction, undefined, inputValue.trim() || undefined);
    setModalAction(null);
    setInputValue('');
  };

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="default"
          size="md"
          className="shadow-sm"
          onClick={() => setModalAction('propose')}
        >
          <Icon path={mdiPlusCircleOutline} className="w-4 h-4 mr-1.5" />
          {t('workflows.propose')}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setModalAction('explore')}
        >
          <Icon path={mdiCompassOutline} className="w-4 h-4 mr-1.5 text-sky-400" />
          {t('workflows.explore')}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => onRunWorkflow('apply')}
        >
          <Icon path={mdiPlayCircleOutline} className="w-4 h-4 mr-1.5 text-emerald-400" />
          {t('workflows.apply')}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => onRunWorkflow('sync')}
        >
          <Icon path={mdiSync} className="w-4 h-4 mr-1.5 text-amber-400" />
          {t('workflows.sync')}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => onRunWorkflow('archive')}
        >
          <Icon path={mdiArchiveArrowDownOutline} className="w-4 h-4 mr-1.5 text-indigo-400" />
          {t('workflows.archive')}
        </Button>
      </div>

      {/* Input Modal for Propose or Explore */}
      {modalAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-vscode-card border border-vscode-border rounded-xl p-5 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-2">
              <Icon path={mdiCreation} className="w-4 h-4 text-vscode-accent" />
              <h2 className="font-semibold text-base">
                {modalAction === 'propose' ? t('workflows.proposeModalTitle') : t('workflows.exploreModalTitle')}
              </h2>
            </div>
            <p className="text-xs text-vscode-muted mb-4">
              {modalAction === 'propose'
                ? t('workflows.proposeModalDesc')
                : t('workflows.exploreModalDesc')}
            </p>

            <form onSubmit={handleSubmit}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  modalAction === 'propose'
                    ? t('workflows.proposePlaceholder')
                    : t('workflows.explorePlaceholder')
                }
                rows={3}
                autoFocus
                className="w-full bg-vscode-bg border border-vscode-border rounded-md p-2.5 text-sm text-vscode-fg placeholder-vscode-muted/60 focus:outline-none focus:ring-1 focus:ring-vscode-accent resize-none mb-4"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModalAction(null);
                    setInputValue('');
                  }}
                >
                  {t('workflows.cancel')}
                </Button>
                <Button type="submit" variant="default" size="sm">
                  {modalAction === 'propose' ? t('workflows.submitPropose') : t('workflows.submitExplore')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
