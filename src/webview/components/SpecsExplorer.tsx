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

interface SpecsExplorerProps {
  specs: OpenSpecCapability[];
  loading?: boolean;
  onOpenFile: (path: string) => void;
}

const SORT_OPTIONS = [
  { label: 'Name (A → Z)', value: 'name-asc' },
  { label: 'Name (Z → A)', value: 'name-desc' },
  { label: 'Most requirements first', value: 'reqs-desc' },
  { label: 'Least requirements first', value: 'reqs-asc' }
];

export function SpecsExplorer({ specs, loading, onOpenFile }: SpecsExplorerProps) {
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useLocalStorageState('openspec.specs.sort', 'name-asc');

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
        <h4 className="text-sm font-medium">No Durable Specs Found</h4>
        <p className="text-xs text-vscode-muted mt-1 max-w-xs mx-auto">
          Durable specifications live in <code className="font-mono text-xs">openspec/specs/</code> and represent completed, persistent system capabilities.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <FilterSortToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search specs by name or purpose..."
        sortValue={sortBy}
        onSortChange={setSortBy}
        sortOptions={SORT_OPTIONS}
        totalCount={specs.length}
        filteredCount={filteredAndSortedSpecs.length}
      />

      {filteredAndSortedSpecs.length === 0 ? (
        <Card className="border-dashed py-8 text-center bg-vscode-bg/30">
          <Icon path={mdiFilterOffOutline} className="w-8 h-8 text-vscode-muted mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-medium">No Matching Specifications</h4>
          <p className="text-xs text-vscode-muted mt-1 max-w-sm mx-auto">
            No durable specifications match your current search query.
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Clear Search
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
                        {spec.requirementsCount} reqs
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenFile(spec.path)}
                        title="Open spec.md"
                      >
                        <Icon path={mdiFileCodeOutline} className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && spec.requirements && spec.requirements.length > 0 && (
                  <CardContent className="p-4 pt-2 border-t border-vscode-border/50 bg-vscode-bg/20 space-y-3">
                    {spec.requirements.map((req, idx) => (
                      <div key={idx} className="bg-vscode-card p-3 rounded-md border border-vscode-border/60 text-xs">
                        <div className="font-semibold text-vscode-fg flex items-center gap-1.5 mb-1">
                          <Icon path={mdiCheckCircle} className="w-3.5 h-3.5 text-vscode-accent" />
                          {req.name}
                        </div>
                        {req.description && (
                          <p className="text-vscode-muted mb-2 text-[11px] whitespace-pre-wrap">
                            {req.description}
                          </p>
                        )}
                        {req.scenarios.length > 0 && (
                          <div className="space-y-1.5 pl-3 border-l-2 border-vscode-accent/30 mt-2">
                            {req.scenarios.map((sc, sIdx) => (
                              <div key={sIdx} className="text-[11px]">
                                <div className="font-medium text-vscode-fg">Scenario: {sc.name}</div>
                                {sc.when && (
                                  <div className="text-vscode-muted font-mono">
                                    <strong className="text-sky-400">WHEN</strong> {sc.when}
                                  </div>
                                )}
                                {sc.then && (
                                  <div className="text-vscode-muted font-mono">
                                    <strong className="text-emerald-400">THEN</strong> {sc.then}
                                  </div>
                                )}
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
