import React, { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiArchiveOutline,
  mdiCalendarOutline,
  mdiFolderOpenOutline,
  mdiFilterOffOutline
} from '@mdi/js';
import { OpenSpecArchivedChange } from '../../shared/types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FilterSortToolbar } from './ui/FilterSortToolbar';
import { SkeletonCard } from './ui/SkeletonCard';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useTranslation } from '../i18n';

interface ArchivedHistoryProps {
  archived: OpenSpecArchivedChange[];
  loading?: boolean;
  onOpenFolder: (path: string) => void;
}

export function ArchivedHistory({ archived, loading, onOpenFolder }: ArchivedHistoryProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useLocalStorageState('openspec.archived.sort', 'date-desc');

  const sortOptions = useMemo(() => [
    { label: t('filterSort.sortDateDesc'), value: 'date-desc' },
    { label: t('filterSort.sortDateAsc'), value: 'date-asc' },
    { label: t('filterSort.sortNameAsc'), value: 'name-asc' },
    { label: t('filterSort.sortNameDesc'), value: 'name-desc' }
  ], [t]);

  const filteredAndSortedArchived = useMemo(() => {
    let result = archived.slice();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (b.archivedDate || '').localeCompare(a.archivedDate || '');
        case 'date-asc':
          return (a.archivedDate || '').localeCompare(b.archivedDate || '');
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [archived, searchQuery, sortBy]);

  if (loading && archived.length === 0) {
    return <SkeletonCard type="archived" count={3} />;
  }

  if (archived.length === 0) {
    return (
      <Card className="border-dashed py-8 text-center">
        <Icon path={mdiArchiveOutline} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-medium">{t('archived.emptyTitle')}</h4>
        <p className="text-xs text-vscode-muted mt-1 max-w-xs mx-auto">
          {t('archived.emptyDesc')}
        </p>
      </Card>
    );
  }

  return (
    <div>
      <FilterSortToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('archived.filterPlaceholder')}
        sortValue={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
        totalCount={archived.length}
        filteredCount={filteredAndSortedArchived.length}
      />

      {filteredAndSortedArchived.length === 0 ? (
        <Card className="border-dashed py-8 text-center bg-vscode-bg/30">
          <Icon path={mdiFilterOffOutline} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-medium">{t('archived.noMatchTitle')}</h4>
          <p className="text-xs text-vscode-muted mt-1 max-w-sm mx-auto">
            {t('archived.noMatchDesc')}
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              {t('filterSort.clearSearch')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedArchived.map((item, index) => (
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
                          <span>{t('archived.archivedOn', { date: item.archivedDate })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenFolder(item.path)}
                    title={t('archived.openFolder')}
                  >
                    <Icon path={mdiFolderOpenOutline} className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
