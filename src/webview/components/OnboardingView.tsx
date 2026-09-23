import React from 'react';
import Icon from '@mdi/react';
import {
  mdiCreation,
  mdiConsole,
  mdiRocketLaunchOutline,
  mdiCheckCircle,
  mdiArrowRight
} from '@mdi/js';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';

interface OnboardingViewProps {
  onInitProject: () => void;
  onInstallCli: () => void;
  loading: boolean;
}

export function OnboardingView({ onInitProject, onInstallCli, loading }: OnboardingViewProps) {
  return (
    <div className="py-12 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-vscode-accent/15 border border-vscode-accent/30 flex items-center justify-center mx-auto mb-6 text-vscode-accent shadow-inner">
        <Icon path={mdiCreation} className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome to OpenSpec Studio</h2>
      <p className="text-vscode-muted text-sm max-w-md mx-auto mb-8">
        This workspace does not currently have an <code className="text-xs font-mono bg-vscode-card px-1.5 py-0.5 rounded border border-vscode-border">openspec/</code> directory.
        Get started with spec-driven development in seconds.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
        <Card className="hover:border-vscode-accent/50 transition-colors">
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <Icon path={mdiRocketLaunchOutline} className="w-4 h-4" />
            </div>
            <CardTitle>Initialize OpenSpec</CardTitle>
            <CardDescription>
              Scaffolds the <code className="font-mono text-xs">openspec/</code> directory with default schema and configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              size="md"
              className="w-full"
              disabled={loading}
              onClick={onInitProject}
            >
              {loading ? 'Initializing...' : 'Initialize OpenSpec'}
              <Icon path={mdiArrowRight} className="w-4 h-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-vscode-accent/50 transition-colors">
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
              <Icon path={mdiConsole} className="w-4 h-4" />
            </div>
            <CardTitle>Install Local CLI</CardTitle>
            <CardDescription>
              Installs OpenSpec CLI as a dev dependency (<code className="font-mono text-xs">npm i -D openspec</code>) for fast execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              disabled={loading}
              onClick={onInstallCli}
            >
              Install openspec CLI
              <Icon path={mdiArrowRight} className="w-4 h-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-vscode-card/50 border border-vscode-border/50 rounded-lg p-4 text-left text-xs text-vscode-muted">
        <div className="font-medium text-vscode-fg mb-1 flex items-center gap-1.5">
          <Icon path={mdiCheckCircle} className="w-3.5 h-3.5 text-emerald-400" /> What OpenSpec gives you:
        </div>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Automated change tracking from proposal to specifications and tasks</li>
          <li>Seamless integration with AI coding assistants like GitHub Copilot</li>
          <li>Durable capability specifications that stay in sync with your codebase</li>
        </ul>
      </div>
    </div>
  );
}
