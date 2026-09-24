import React from 'react';
import { Card, CardHeader } from './Card';

export interface SkeletonCardProps {
  type?: 'specs' | 'changes' | 'archived';
  count?: number;
}

export function SkeletonCard({ type = 'specs', count = 3 }: SkeletonCardProps) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading content">
      {items.map((_, index) => (
        <Card key={index} className="overflow-hidden border border-vscode-border/60 bg-vscode-card/40">
          <CardHeader className="p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                {/* Expand / chevron placeholder */}
                <div className="w-4 h-4 rounded bg-vscode-border/50 shrink-0" />

                {/* Icon box placeholder */}
                <div className="w-7 h-7 rounded-lg bg-vscode-border/60 shrink-0" />

                {/* Text lines */}
                <div className="space-y-1.5 flex-1 max-w-md">
                  <div
                    className="h-3.5 bg-vscode-fg/15 rounded"
                    style={{ width: `${Math.min(90, 45 + (index * 20) % 45)}%` }}
                  />
                  <div
                    className="h-2.5 bg-vscode-muted/20 rounded"
                    style={{ width: `${Math.min(95, 60 + (index * 15) % 35)}%` }}
                  />
                </div>
              </div>

              {/* Right side badge / button placeholder */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-14 h-5 rounded-full bg-vscode-border/40" />
                <div className="w-7 h-7 rounded bg-vscode-border/40" />
              </div>
            </div>

            {/* Optional progress bar for changes */}
            {type === 'changes' && (
              <div className="mt-3">
                <div className="h-1.5 w-full bg-vscode-border/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-vscode-accent/30 rounded-full"
                    style={{ width: `${(index + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
