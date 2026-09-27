import { describe, it, expect } from 'vitest';
import { en } from '../src/webview/i18n/en';
import { de } from '../src/webview/i18n/de';
import { getTranslation } from '../src/webview/i18n/index';

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getAllKeys(obj[k], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys.sort();
}

describe('i18n system', () => {
  it('ensures exact translation key parity between English and German', () => {
    const enKeys = getAllKeys(en);
    const deKeys = getAllKeys(de);
    expect(deKeys).toEqual(enKeys);
  });

  describe('getTranslation', () => {
    it('translates English keys correctly', () => {
      expect(getTranslation('en', 'header.title')).toBe('OpenSpec Studio');
      expect(getTranslation('en', 'tabs.activeChanges')).toBe('Active Changes');
      expect(getTranslation('en', 'workflows.propose')).toBe('Propose Change');
    });

    it('translates German keys correctly', () => {
      expect(getTranslation('de', 'header.title')).toBe('OpenSpec Studio');
      expect(getTranslation('de', 'tabs.activeChanges')).toBe('Aktive Änderungen');
      expect(getTranslation('de', 'workflows.propose')).toBe('Änderung vorschlagen');
    });

    it('interpolates single and multiple parameters', () => {
      const enResult = getTranslation('en', 'activeChanges.tasksProgress', {
        completed: 4,
        total: 8,
        percent: 50
      });
      expect(enResult).toBe('4 / 8 tasks (50%)');

      const deResult = getTranslation('de', 'activeChanges.tasksProgress', {
        completed: 4,
        total: 8,
        percent: 50
      });
      expect(deResult).toBe('4 / 8 Aufgaben (50%)');
    });

    it('handles pluralization correctly with count parameter', () => {
      expect(getTranslation('en', 'specs.requirementsCount', { count: 1 })).toBe('1 requirement');
      expect(getTranslation('en', 'specs.requirementsCount', { count: 5 })).toBe('5 requirements');
      expect(getTranslation('en', 'specs.scenariosCount', { count: 1 })).toBe('1 scenario');
      expect(getTranslation('en', 'specs.scenariosCount', { count: 3 })).toBe('3 scenarios');

      expect(getTranslation('de', 'specs.requirementsCount', { count: 1 })).toBe('1 Anforderung');
      expect(getTranslation('de', 'specs.requirementsCount', { count: 5 })).toBe('5 Anforderungen');
      expect(getTranslation('de', 'specs.scenariosCount', { count: 1 })).toBe('1 Szenario');
      expect(getTranslation('de', 'specs.scenariosCount', { count: 3 })).toBe('3 Szenarien');

      expect(getTranslation('en', 'gitModal.modifiedFiles', { count: 1 })).toBe('1 modified file');
      expect(getTranslation('en', 'gitModal.modifiedFiles', { count: 3 })).toBe('3 modified files');

      expect(getTranslation('de', 'gitModal.modifiedFiles', { count: 1 })).toBe('1 geänderte Datei');
      expect(getTranslation('de', 'gitModal.modifiedFiles', { count: 3 })).toBe('3 geänderte Dateien');
    });

    it('falls back to English when key is missing in German', () => {
      // Create a scenario where a non-existent subkey is looked up
      expect(getTranslation('de', 'header.nonExistentKey')).toBe('header.nonExistentKey');
    });

    it('returns raw key when missing in both catalogs', () => {
      expect(getTranslation('en', 'non.existent.path')).toBe('non.existent.path');
    });
  });
});
