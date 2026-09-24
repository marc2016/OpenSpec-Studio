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

interface ArchivedHistoryProps {
  archived: OpenSpecArchivedChange[];
  loading?: boolean;
  onOpenFolder: (path: string) => void;
}

const SORT_OPTIONS = [
  { label: 'Archived date (Newest first)', value: 'date-desc' },
  { label: 'Archived date (Oldest first)', value: 'date-asc' },
  { label: 'Name (A → Z)', value: 'name-asc' },
  { label: 'Name (Z → A)', value: 'name-desc' }
];

export function ArchivedHistory({ archived, loading, onOpenFolder }: ArchivedHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useLocalStorageState('openspec.archived.sort', 'date-desc');

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
        <h4 className="text-sm font-medium">No Archived Changes</h4>
        <p className="text-xs text-vscode-muted mt-1 max-w-xs mx-auto">
          Completed changes archived via <code className="font-mono text-xs">/opsx-archive</code> will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <FilterSortToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search archived changes..."
        sortValue={sortBy}
        onSortChange={setSortBy}
        sortOptions={SORT_OPTIONS}
        totalCount={archived.length}
        filteredCount={filteredAndSortedArchived.length}
      />

      {filteredAndSortedArchived.length === 0 ? (
        <Card className="border-dashed py-8 text-center bg-vscode-bg/30">
          <Icon path={mdiFilterOffOutline} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-medium">No Matching Archived Changes</h4>
          <p className="text-xs text-vscode-muted mt-1 max-w-sm mx-auto">
            No archived changes match your current search query.
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Clear Search
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
      )}
    </div>
  );
}
