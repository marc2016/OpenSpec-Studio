export type AiTarget = 'copilot' | 'cursor' | 'antigravity' | 'terminal' | 'clipboard';

export type CliMode = 'auto' | 'local' | 'global' | 'npx';

export interface CliInfo {
  mode: CliMode;
  resolvedPath: string;
  version?: string;
  isAvailable: boolean;
}

export interface ChangeTask {
  id: string;
  description: string;
  done: boolean;
}

export interface OpenSpecChange {
  name: string;
  path: string;
  status: string;
  isPlanningComplete?: boolean;
  totalTasks: number;
  completedTasks: number;
  tasks: ChangeTask[];
  artifacts: {
    id: string;
    exists: boolean;
    path?: string;
  }[];
  lastModified?: number;
}

export interface SpecScenario {
  name: string;
  when: string;
  then: string;
}

export interface SpecRequirement {
  name: string;
  description: string;
  scenarios: SpecScenario[];
  startLine?: number;
  endLine?: number;
}

export interface OpenSpecCapability {
  id: string;
  name: string;
  path: string;
  purpose: string;
  requirementsCount: number;
  requirements?: SpecRequirement[];
}

export interface OpenSpecArchivedChange {
  name: string;
  path: string;
  archivedDate?: string;
}

export interface GitState {
  isGitRepo: boolean;
  branch?: string;
  uncommittedCount: number;
  remoteUrl?: string;
  compareUrl?: string;
}

export interface GitOperationResult {
  success: boolean;
  operation: 'create_branch' | 'switch_branch' | 'commit_and_push';
  message?: string;
  branch?: string;
  shareUrl?: string;
  error?: string;
}

export interface OpenSpecState {
  isInitialized: boolean;
  rootPath?: string;
  cliInfo: CliInfo;
  aiTarget: AiTarget;
  changes: OpenSpecChange[];
  specs: OpenSpecCapability[];
  archived: OpenSpecArchivedChange[];
  loading: boolean;
  error?: string;
  git?: GitState;
  locale?: 'en' | 'de';
}

// Host -> Webview messages
export type ToWebviewMessage =
  | { type: 'STATE_UPDATE'; state: OpenSpecState }
  | { type: 'NOTIFICATION'; message: string; level: 'info' | 'warning' | 'error' }
  | { type: 'GIT_OPERATION_RESULT'; result: GitOperationResult };

// Webview -> Host messages
export type FromWebviewMessage =
  | { type: 'REQUEST_STATE' }
  | { type: 'INIT_PROJECT' }
  | { type: 'INSTALL_CLI' }
  | { type: 'SET_AI_TARGET'; aiTarget: AiTarget }
  | { type: 'RUN_WORKFLOW'; action: 'propose' | 'explore' | 'apply' | 'sync' | 'archive'; changeName?: string; input?: string }
  | { type: 'OPEN_FILE'; filePath: string }
  | { type: 'OPEN_CHANGE_FOLDER'; changeName: string }
  | { type: 'CREATE_BRANCH'; branchName: string }
  | { type: 'SWITCH_BRANCH'; branchName: string }
  | { type: 'COMMIT_AND_PUSH'; message?: string };

export interface RelatedFileItem {
  label: string;
  filePath: string;
  kind: 'proposal' | 'design' | 'tasks' | 'spec' | 'other';
  active?: boolean;
}

