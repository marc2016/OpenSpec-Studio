import { useEffect, useState, useCallback, useRef } from 'react';
import { OpenSpecState, ToWebviewMessage, FromWebviewMessage, AiTarget } from '../../shared/types';

interface VsCodeApi {
  postMessage(msg: FromWebviewMessage): void;
  getState(): any;
  setState(state: any): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

let vscodeApi: VsCodeApi | undefined;

export function getVsCodeApi(): VsCodeApi {
  if (!vscodeApi) {
    if (typeof acquireVsCodeApi === 'function') {
      vscodeApi = acquireVsCodeApi();
    } else {
      // In-browser mock for development/testing
      vscodeApi = {
        postMessage: (msg: FromWebviewMessage) => console.log('[Mock PostMessage]', msg),
        getState: () => ({}),
        setState: () => {}
      };
    }
  }
  return vscodeApi;
}

const defaultInitialState: OpenSpecState = {
  isInitialized: true,
  loading: true,
  aiTarget: 'copilot',
  cliInfo: {
    mode: 'auto',
    resolvedPath: 'openspec',
    isAvailable: true
  },
  changes: [],
  specs: [],
  archived: []
};

export function useOpenSpecStudio() {
  const [state, setState] = useState<OpenSpecState>(defaultInitialState);
  const [notification, setNotification] = useState<{ message: string; level: string } | null>(null);
  const api = useRef(getVsCodeApi()).current;

  useEffect(() => {
    const handleMessage = (event: MessageEvent<ToWebviewMessage>) => {
      const msg = event.data;
      if (msg.type === 'STATE_UPDATE') {
        setState({ ...msg.state, loading: false });
      } else if (msg.type === 'NOTIFICATION') {
        setNotification({ message: msg.message, level: msg.level });
        setTimeout(() => setNotification(null), 4000);
      }
    };

    window.addEventListener('message', handleMessage);
    // Request initial state on mount
    api.postMessage({ type: 'REQUEST_STATE' });

    return () => window.removeEventListener('message', handleMessage);
  }, [api]);

  const setAiTarget = useCallback((target: AiTarget) => {
    setState((prev) => ({ ...prev, aiTarget: target }));
    api.postMessage({ type: 'SET_AI_TARGET', aiTarget: target });
  }, [api]);

  const runWorkflow = useCallback(
    (action: 'propose' | 'explore' | 'apply' | 'sync' | 'archive', changeName?: string, input?: string) => {
      api.postMessage({ type: 'RUN_WORKFLOW', action, changeName, input });
    },
    [api]
  );

  const initProject = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    api.postMessage({ type: 'INIT_PROJECT' });
  }, [api]);

  const installCli = useCallback(() => {
    api.postMessage({ type: 'INSTALL_CLI' });
  }, [api]);

  const openFile = useCallback(
    (filePath: string) => {
      api.postMessage({ type: 'OPEN_FILE', filePath });
    },
    [api]
  );

  const openChangeFolder = useCallback(
    (changeName: string) => {
      api.postMessage({ type: 'OPEN_CHANGE_FOLDER', changeName });
    },
    [api]
  );

  return {
    state,
    notification,
    setAiTarget,
    runWorkflow,
    initProject,
    installCli,
    openFile,
    openChangeFolder
  };
}
