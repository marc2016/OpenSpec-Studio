import React, { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiBookOpenPageVariantOutline,
  mdiChevronRight,
  mdiChevronDown,
  mdiCheckCircle,
  mdiFileCodeOutline,
  mdiFilterOffOutline
} from '@mdi/js';
import { OpenSpecCapability } from '../../shared/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { FilterSortToolbar } from './ui/FilterSortToolbar';
import { SkeletonCard } from './ui/SkeletonCard';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useTranslation } from '../i18n';

interface SpecsExplorerProps {
  specs: OpenSpecCapability[];
  loading?: boolean;
  onOpenFile: (path: string) => void;
}

export function SpecsExplorer({ specs, loading, onOpenFile }: SpecsExplorerProps) {
  const { t } = useTranslation();
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useLocalStorageState('openspec.specs.sort', 'name-asc');

  const sortOptions = useMemo(() => [
    { label: t('filterSort.sortNameAsc'), value: 'name-asc' },
    { label: t('filterSort.sortNameDesc'), value: 'name-desc' },
    { label: t('filterSort.sortReqDesc'), value: 'reqs-desc' },
    { label: t('filterSort.sortReqAsc'), value: 'reqs-asc' }
  ], [t]);

  const toggleExpand = (id: string) => {
    setExpandedSpec((prev) => (prev === id ? null : id));
  };

  const filteredAndSortedSpecs = useMemo(() => {
    let result = specs.slice();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.purpose && s.purpose.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'reqs-desc':
          return b.requirementsCount - a.requirementsCount;
        case 'reqs-asc':
          return a.requirementsCount - b.requirementsCount;
        default:
          return 0;
      }
    });

    return result;
  }, [specs, searchQuery, sortBy]);

  if (loading && specs.length === 0) {
    return <SkeletonCard type="specs" count={4} />;
  }

  if (specs.length === 0) {
    return (
      <Card className="border-dashed py-8 text-center">
        <Icon path={mdiBookOpenPageVariantOutline} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-medium">{t('specs.emptyTitle')}</h4>
        <p className="text-xs text-vscode-muted mt-1 max-w-xs mx-auto">
          {t('specs.emptyDesc')}
        </p>
      </Card>
    );
  }

  return (
    <div>
      <FilterSortToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('specs.filterPlaceholder')}
        sortValue={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
        totalCount={specs.length}
        filteredCount={filteredAndSortedSpecs.length}
      />

      {filteredAndSortedSpecs.length === 0 ? (
        <Card className="border-dashed py-8 text-center bg-vscode-bg/30">
          <Icon path={mdiFilterOffOutline} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-medium">{t('specs.noMatchTitle')}</h4>
          <p className="text-xs text-vscode-muted mt-1 max-w-sm mx-auto">
            {t('specs.noMatchDesc')}
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              {t('filterSort.clearSearch')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedSpecs.map((spec) => {
            const isExpanded = expandedSpec === spec.id;

            return (
              <Card key={spec.id} className="overflow-hidden">
                <CardHeader
                  className="p-3.5 cursor-pointer hover:bg-vscode-bg/50 transition-colors"
                  onClick={() => toggleExpand(spec.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button className="text-vscode-muted hover:text-vscode-fg p-0.5">
                        {isExpanded ? (
                          <Icon path={mdiChevronDown} className="w-4 h-4" />
                        ) : (
                          <Icon path={mdiChevronRight} className="w-4 h-4" />
                        )}
                      </button>
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <Icon path={mdiBookOpenPageVariantOutline} className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold hover:text-vscode-accent transition-colors">
                          {spec.name}
                        </CardTitle>
                        <div className="text-xs text-vscode-muted mt-0.5 line-clamp-1">
                          {spec.purpose}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Badge variant="secondary">
                        {t('specs.requirementsCount', { count: spec.requirementsCount })}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenFile(spec.path)}
                        title={t('specs.openSpec')}
                      >
                        <Icon path={mdiFileCodeOutline} className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && spec.requirements && spec.requirements.length > 0 && (
                  <CardContent className="p-4 pt-3 border-t border-vscode-border/50 bg-vscode-bg/20 space-y-3.5">
                    {spec.requirements.map((req, idx) => (
                      <div key={idx} className="bg-vscode-card p-3.5 rounded-lg border border-vscode-border/60 shadow-xs">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="font-semibold text-sm text-vscode-fg flex items-center gap-2">
                            <Icon path={mdiCheckCircle} className="w-4 h-4 text-vscode-accent shrink-0" />
                            <span>{req.name}</span>
                          </div>
                          {req.scenarios.length > 0 && (
                            <Badge variant="secondary" className="text-[11px] px-2 py-0.5 shrink-0 font-normal">
                              {t('specs.scenariosCount', { count: req.scenarios.length })}
                            </Badge>
                          )}
                        </div>

                        {req.description && (
                          <p className="text-vscode-muted text-xs leading-relaxed mb-3 whitespace-pre-wrap">
                            {req.description}
                          </p>
                        )}

                        {req.scenarios.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {req.scenarios.map((sc, sIdx) => (
                              <div
                                key={sIdx}
                                className="bg-vscode-bg/50 rounded-md border border-vscode-border/50 p-3 space-y-2 transition-colors hover:border-vscode-border/80"
                              >
                                <div className="font-medium text-xs text-vscode-fg flex items-center gap-1.5">
                                  <span className="text-vscode-muted font-normal text-[11px]">Scenario:</span>
                                  <span>{sc.name}</span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                  {sc.when && (
                                    <div className="flex items-baseline gap-2">
                                      <span className="bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 select-none">
                                        WHEN
                                      </span>
                                      <span className="text-vscode-fg/90 leading-snug">
                                        {sc.when}
                                      </span>
                                    </div>
                                  )}
                                  {sc.then && (
                                    <div className="flex items-baseline gap-2">
                                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 select-none">
                                        THEN
                                      </span>
                                      <span className="text-vscode-fg/90 leading-snug">
                                        {sc.then}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
