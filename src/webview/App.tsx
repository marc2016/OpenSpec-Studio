import React, { useState } from 'react';
import { useOpenSpecStudio } from './hooks/useVscodeApi';
import { Header } from './components/Header';
import { WorkflowBar } from './components/WorkflowBar';
import { OnboardingView } from './components/OnboardingView';
import { ActiveChangesGrid } from './components/ActiveChangesGrid';
import { SpecsExplorer } from './components/SpecsExplorer';
import { ArchivedHistory } from './components/ArchivedHistory';
import Icon from '@mdi/react';
import {
  mdiSourcePull,
  mdiBookOpenPageVariantOutline,
  mdiArchiveOutline,
  mdiAlert,
  mdiInformation
} from '@mdi/js';

export default function App() {
  const {
    state,
    notification,
    setAiTarget,
    runWorkflow,
    initProject,
    installCli,
    openFile,
    openChangeFolder,
    refreshState
  } = useOpenSpecStudio();

  const [activeTab, setActiveTab] = useState<'changes' | 'specs' | 'archived'>('changes');

  return (
    <div className="min-h-screen bg-vscode-bg text-vscode-fg flex flex-col p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-vscode-card border border-vscode-border shadow-xl text-xs animate-in slide-in-from-bottom-2">
          {notification.level === 'info' && <Icon path={mdiInformation} className="w-4 h-4 text-sky-400" />}
          {notification.level === 'warning' && <Icon path={mdiAlert} className="w-4 h-4 text-amber-400" />}
          {notification.level === 'error' && <Icon path={mdiAlert} className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        cliInfo={state.cliInfo}
        aiTarget={state.aiTarget}
        loading={state.loading}
        onSetAiTarget={setAiTarget}
        onRefresh={refreshState}
      />

      {/* Main Content */}
      {!state.isInitialized ? (
        <OnboardingView
          onInitProject={initProject}
          onInstallCli={installCli}
          loading={state.loading}
        />
      ) : (
        <div className="flex-1 flex flex-col mt-2">
          {/* Action Bar */}
          <WorkflowBar
            onRunWorkflow={runWorkflow}
            activeChangesCount={state.changes.length}
          />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-vscode-border mt-1 mb-4">
            <button
              onClick={() => setActiveTab('changes')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'changes'
                  ? 'border-vscode-accent text-vscode-fg font-semibold'
                  : 'border-transparent text-vscode-muted hover:text-vscode-fg'
              }`}
            >
              <Icon path={mdiSourcePull} className="w-3.5 h-3.5" />
              Active Changes
              <span className={`ml-1 px-1.5 py-0.2 rounded-full bg-vscode-card text-[10px] border border-vscode-border min-w-[20px] text-center font-mono ${
                state.loading && state.changes.length === 0 ? 'animate-pulse text-vscode-accent' : ''
              }`}>
                {state.loading && state.changes.length === 0 ? '···' : state.changes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-vscode-accent text-vscode-fg font-semibold'
                  : 'border-transparent text-vscode-muted hover:text-vscode-fg'
              }`}
            >
              <Icon path={mdiBookOpenPageVariantOutline} className="w-3.5 h-3.5" />
              Durable Specs
              <span className={`ml-1 px-1.5 py-0.2 rounded-full bg-vscode-card text-[10px] border border-vscode-border min-w-[20px] text-center font-mono ${
                state.loading && state.specs.length === 0 ? 'animate-pulse text-vscode-accent' : ''
              }`}>
                {state.loading && state.specs.length === 0 ? '···' : state.specs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'archived'
                  ? 'border-vscode-accent text-vscode-fg font-semibold'
                  : 'border-transparent text-vscode-muted hover:text-vscode-fg'
              }`}
            >
              <Icon path={mdiArchiveOutline} className="w-3.5 h-3.5" />
              Archived History
              <span className={`ml-1 px-1.5 py-0.2 rounded-full bg-vscode-card text-[10px] border border-vscode-border min-w-[20px] text-center font-mono ${
                state.loading && state.archived.length === 0 ? 'animate-pulse text-vscode-accent' : ''
              }`}>
                {state.loading && state.archived.length === 0 ? '···' : state.archived.length}
              </span>
            </button>
          </div>

          {/* Tab Views */}
          <div className="flex-1">
            {activeTab === 'changes' && (
              <ActiveChangesGrid
                changes={state.changes}
                loading={state.loading}
                onRunWorkflow={runWorkflow}
                onOpenFile={openFile}
                onOpenFolder={openChangeFolder}
              />
            )}

            {activeTab === 'specs' && (
              <SpecsExplorer
                specs={state.specs}
                loading={state.loading}
                onOpenFile={openFile}
              />
            )}

            {activeTab === 'archived' && (
              <ArchivedHistory
                archived={state.archived}
                loading={state.loading}
                onOpenFolder={openFile}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
