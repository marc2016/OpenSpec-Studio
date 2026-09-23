import React from 'react';
import Icon from '@mdi/react';
import { mdiArchiveOutline, mdiCalendarOutline, mdiFolderOpenOutline } from '@mdi/js';
import { OpenSpecArchivedChange } from '../../shared/types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface ArchivedHistoryProps {
  archived: OpenSpecArchivedChange[];
  onOpenFolder: (path: string) => void;
}

export function ArchivedHistory({ archived, onOpenFolder }: ArchivedHistoryProps) {
  if (archived.length === 0) {
    return (
      <Card className="border-dashed py-8 text-center">
        <Icon path={mdiArchiveOutline} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-medium">No Archived Changes</h4>
        <p className="text-xs text-vscode-muted mt-1 max-w-xs mx-auto">
          Completed changes archived via <code className="font-mono text-xs">/opsx-archive</code> will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {archived.map((item, index) => (
        <Card key={index} className="overflow-hidden hover:bg-vscode-bg/50 transition-colors">
          <CardHeader className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon path={mdiArchiveOutline} className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  {item.archivedDate && (
                    <div className="flex items-center gap-1 text-[11px] text-vscode-muted mt-0.5">
                      <Icon path={mdiCalendarOutline} className="w-3 h-3" />
                      <span>Archived: {item.archivedDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenFolder(item.path)}
                title="Open archived change folder"
              >
                <Icon path={mdiFolderOpenOutline} className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
