import { useState, useEffect } from 'react';

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(key);
        if (stored !== null) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn(`Failed to read key "${key}" from localStorage:`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (e) {
      console.warn(`Failed to write key "${key}" to localStorage:`, e);
    }
  }, [key, state]);

  return [state, setState];
}
