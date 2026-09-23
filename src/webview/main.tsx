import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MarkdownEditorApp } from './editor/MarkdownEditorApp';
import './index.css';
import '@mdxeditor/editor/style.css';

function Root() {
  const [isEditorMode, setIsEditorMode] = useState<boolean>(() => {
    return (
      (window as any).OPENSPEC_DATA?.mode === 'editor' ||
      (window as any).OPENSPEC_MODE === 'editor' ||
      window.location.search.includes('mode=editor')
    );
  });

  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      const msg = event.data;
      if (msg?.type === 'INIT_EDITOR') {
        setIsEditorMode(true);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  if (isEditorMode) {
    return <MarkdownEditorApp />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
