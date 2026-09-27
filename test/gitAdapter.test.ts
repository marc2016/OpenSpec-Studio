import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitAdapter } from '../src/core/GitAdapter';

describe('GitAdapter', () => {
  let adapter: GitAdapter;

  beforeEach(() => {
    adapter = new GitAdapter();
  });

  describe('sanitizeGitError', () => {
    it('translates remote rejected / non-fast-forward error into non-technical guidance', () => {
      const raw = 'To github.com:org/repo.git\n ! [rejected] change/foo -> change/foo (non-fast-forward)\nerror: failed to push some refs';
      const clean = adapter.sanitizeGitError(raw);
      expect(clean).toContain('Someone else on your team has pushed newer changes');
    });

    it('translates authentication failure', () => {
      const raw = 'fatal: Authentication failed for https://github.com/org/repo.git/';
      const clean = adapter.sanitizeGitError(raw);
      expect(clean).toContain('Could not authenticate with the remote repository');
    });

    it('translates missing remote origin', () => {
      const raw = "fatal: 'origin' does not appear to be a git repository";
      const clean = adapter.sanitizeGitError(raw);
      expect(clean).toContain('No remote repository (origin) is configured');
    });

    it('translates already exists error', () => {
      const raw = "fatal: A branch named 'change/specs' already exists.";
      const clean = adapter.sanitizeGitError(raw);
      expect(clean).toBe('A branch with this name already exists. Please choose a different branch name.');
    });

    it('cleans general fatal or error prefix', () => {
      const raw = 'fatal: pathspec did not match';
      expect(adapter.sanitizeGitError(raw)).toBe('pathspec did not match');
    });
  });

  describe('getGitState', () => {
    it('returns isGitRepo: false when workspace is empty or does not exist', async () => {
      const state = await adapter.getGitState('/non/existent/path/for/sure/12345');
      expect(state.isGitRepo).toBe(false);
      expect(state.uncommittedCount).toBe(0);
    });

    it('parses branch, uncommitted count, and remote when git succeeds', async () => {
      vi.spyOn(adapter, 'execGit').mockImplementation(async (args: string[]) => {
        if (args[0] === 'rev-parse' && args[1] === '--is-inside-work-tree') {
          return { stdout: 'true\n', stderr: '' };
        }
        if (args[0] === 'rev-parse' && args[1] === '--abbrev-ref') {
          return { stdout: 'change/git-workflow\n', stderr: '' };
        }
        if (args[0] === 'status') {
          return { stdout: ' M file1.ts\n?? file2.md\n', stderr: '' };
        }
        if (args[0] === 'config') {
          return { stdout: 'git@github.com:marc2016/OpenSpec-Studio.git\n', stderr: '' };
        }
        return { stdout: '', stderr: '' };
      });

      const state = await adapter.getGitState(process.cwd());
      expect(state.isGitRepo).toBe(true);
      expect(state.branch).toBe('change/git-workflow');
      expect(state.uncommittedCount).toBe(2);
      expect(state.remoteUrl).toBe('git@github.com:marc2016/OpenSpec-Studio.git');
      expect(state.compareUrl).toBe('https://github.com/marc2016/OpenSpec-Studio/compare/change/git-workflow?expand=1');
    });
  });

  describe('createBranch', () => {
    it('rejects invalid branch names with spaces or symbols', async () => {
      const res = await adapter.createBranch('/test', 'bad branch name with spaces');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Branch name contains invalid characters');
    });

    it('rejects empty branch name', async () => {
      const res = await adapter.createBranch('/test', '   ');
      expect(res.success).toBe(false);
      expect(res.error).toContain('cannot be empty');
    });

    it('executes checkout -b on valid branch name', async () => {
      const execSpy = vi.spyOn(adapter, 'execGit').mockResolvedValue({ stdout: '', stderr: '' });
      const res = await adapter.createBranch('/test', 'change/cool-feature');
      expect(execSpy).toHaveBeenCalledWith(['checkout', '-b', 'change/cool-feature'], '/test');
      expect(res.success).toBe(true);
      expect(res.branch).toBe('change/cool-feature');
    });
  });

  describe('switchBranch', () => {
    it('switches to an existing branch', async () => {
      const execSpy = vi.spyOn(adapter, 'execGit').mockResolvedValue({ stdout: '', stderr: '' });
      const res = await adapter.switchBranch('/test', 'main');
      expect(execSpy).toHaveBeenCalledWith(['checkout', 'main'], '/test');
      expect(res.success).toBe(true);
      expect(res.branch).toBe('main');
    });
  });

  describe('commitAndPush', () => {
    it('handles staging, committing, and pushing with generated share link', async () => {
      vi.spyOn(adapter, 'getGitState').mockResolvedValue({
        isGitRepo: true,
        branch: 'change/docs-update',
        uncommittedCount: 1,
        remoteUrl: 'git@github.com:marc2016/OpenSpec-Studio.git'
      });

      const execSpy = vi.spyOn(adapter, 'execGit').mockImplementation(async (args: string[]) => {
        if (args[0] === 'status') {
          return { stdout: ' M spec.md\n', stderr: '' };
        }
        return { stdout: '', stderr: '' };
      });

      const res = await adapter.commitAndPush('/test', 'Refine requirements');
      expect(res.success).toBe(true);
      expect(res.branch).toBe('change/docs-update');
      expect(res.shareUrl).toBe('https://github.com/marc2016/OpenSpec-Studio/compare/change/docs-update?expand=1');
      expect(execSpy).toHaveBeenCalledWith(['add', '-A'], '/test');
      expect(execSpy).toHaveBeenCalledWith(['commit', '-m', 'Refine requirements'], '/test');
      expect(execSpy).toHaveBeenCalledWith(['push', '-u', 'origin', 'change/docs-update'], '/test');
    });

    it('translates push errors cleanly', async () => {
      vi.spyOn(adapter, 'getGitState').mockResolvedValue({
        isGitRepo: true,
        branch: 'change/docs-update',
        uncommittedCount: 0,
        remoteUrl: 'git@github.com:marc2016/OpenSpec-Studio.git'
      });

      vi.spyOn(adapter, 'execGit').mockImplementation(async (args: string[]) => {
        if (args[0] === 'push') {
          throw { stderr: 'error: failed to push some refs (non-fast-forward)' };
        }
        return { stdout: '', stderr: '' };
      });

      const res = await adapter.commitAndPush('/test');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Someone else on your team has pushed newer changes');
    });
  });
});
