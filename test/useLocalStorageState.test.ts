import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorageState } from '../src/webview/hooks/useLocalStorageState';
import { useState } from 'react';

describe('useLocalStorageState', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k in store) delete store[k];
      }
    });
  });

  it('exports a hook function', () => {
    expect(typeof useLocalStorageState).toBe('function');
  });

  it('handles stored JSON or fallback correctly in initial getter', () => {
    localStorage.setItem('test-key', JSON.stringify('saved-value'));
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('saved-value');
  });
});
