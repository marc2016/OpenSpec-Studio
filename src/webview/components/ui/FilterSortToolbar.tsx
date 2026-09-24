import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiSortVariant, mdiFilterVariant, mdiClose } from '@mdi/js';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FilterSortToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (val: string) => void;
  filterOptions?: SelectOption[];
  filterLabel?: string;
  sortValue?: string;
  onSortChange?: (val: string) => void;
  sortOptions?: SelectOption[];
  toggleLabel?: string;
  toggleChecked?: boolean;
  onToggleChange?: (checked: boolean) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterSortToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = 'Status',
  sortValue,
  onSortChange,
  sortOptions,
  toggleLabel,
  toggleChecked,
  onToggleChange,
  totalCount,
  filteredCount
}: FilterSortToolbarProps) {
  const isFiltered = filteredCount !== totalCount || searchQuery.trim().length > 0 || (toggleChecked ?? false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-lg bg-vscode-card/70 border border-vscode-border/80 mb-3 text-xs">
      {/* Left: Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Icon
          path={mdiMagnify}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vscode-muted pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-8 pr-7 py-1.5 rounded-md bg-vscode-bg border border-vscode-border text-vscode-fg placeholder:text-vscode-muted/70 focus:outline-none focus:border-vscode-accent text-xs transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-vscode-muted hover:text-vscode-fg p-0.5 rounded cursor-pointer"
            title="Clear search"
          >
            <Icon path={mdiClose} className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right controls: Filters, Sort, Toggle, and Count */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status / Category Filter */}
        {filterOptions && onFilterChange && (
          <div className="flex items-center gap-1.5 bg-vscode-bg border border-vscode-border rounded-md px-2 py-1">
            <Icon path={mdiFilterVariant} className="w-3.5 h-3.5 text-vscode-muted" />
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="bg-transparent text-vscode-fg focus:outline-none cursor-pointer text-xs pr-1"
              aria-label={filterLabel}
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-vscode-card text-vscode-fg">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Select */}
        {sortOptions && onSortChange && (
          <div className="flex items-center gap-1.5 bg-vscode-bg border border-vscode-border rounded-md px-2 py-1">
            <Icon path={mdiSortVariant} className="w-3.5 h-3.5 text-vscode-muted" />
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-vscode-fg focus:outline-none cursor-pointer text-xs pr-1"
              aria-label="Sort order"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-vscode-card text-vscode-fg">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Toggle (e.g. Hide Completed) */}
        {toggleLabel && onToggleChange !== undefined && (
          <label className="flex items-center gap-1.5 bg-vscode-bg border border-vscode-border rounded-md px-2 py-1 cursor-pointer select-none text-vscode-muted hover:text-vscode-fg transition-colors">
            <input
              type="checkbox"
              checked={toggleChecked || false}
              onChange={(e) => onToggleChange(e.target.checked)}
              className="rounded border-vscode-border text-vscode-accent focus:ring-0 cursor-pointer"
            />
            <span className="text-xs">{toggleLabel}</span>
          </label>
        )}

        {/* Count Badge */}
        <span className="text-[11px] font-mono text-vscode-muted px-2 py-1 rounded bg-vscode-bg/80 border border-vscode-border/50 shrink-0">
          {isFiltered ? `${filteredCount} / ${totalCount}` : `${totalCount}`}
        </span>
      </div>
    </div>
  );
}
