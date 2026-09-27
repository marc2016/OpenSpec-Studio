import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { GitState, GitOperationResult } from '../shared/types';
import { getBranchCompareUrl } from './gitUrlHelper';

const execFileAsync = promisify(execFile);

export class GitAdapter {
  private timeoutMs = 25000;

  /**
   * Helper to execute a git command in the workspace directory.
   */
  public async execGit(args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
    return execFileAsync('git', args, { cwd, timeout: this.timeoutMs });
  }

  /**
   * Translates raw Git error messages into user-friendly guidance for non-technical users.
   */
  public sanitizeGitError(rawError: string): string {
    const lower = rawError.toLowerCase();

    if (
      lower.includes('[rejected]') ||
      lower.includes('non-fast-forward') ||
      lower.includes('fetch first') ||
      lower.includes('updates were rejected')
    ) {
      return 'Someone else on your team has pushed newer changes to this branch. Please ask a teammate or developer to help merge the latest updates.';
    }

    if (
      lower.includes('permission to') && lower.includes('denied') ||
      lower.includes('could not read from remote') ||
      lower.includes('authentication failed') ||
      lower.includes('fatal: authentication')
    ) {
      return 'Could not authenticate with the remote repository. Please verify your Git credentials or network connection in VS Code.';
    }

    if (lower.includes('no remote repository') || lower.includes("fatal: 'origin' does not appear to be a git repository")) {
      return 'No remote repository (origin) is configured for this project. Please configure a remote origin first.';
    }

    if (lower.includes('already exists')) {
      return 'A branch with this name already exists. Please choose a different branch name.';
    }

    if (lower.includes('not a valid object name') || lower.includes('did not match any file(s) known to git')) {
      return 'The specified branch or reference could not be found.';
    }

    // Strip leading "fatal: " or "error: "
    return rawError.replace(/^(fatal|error):\s*/i, '').trim();
  }

  /**
   * Inspects the current workspace and returns the Git state.
   */
  public async getGitState(workspaceRoot: string): Promise<GitState> {
    if (!workspaceRoot || !fs.existsSync(workspaceRoot)) {
      return { isGitRepo: false, uncommittedCount: 0 };
    }

    try {
      // Check if inside a git work tree
      const { stdout: isRepo } = await this.execGit(['rev-parse', '--is-inside-work-tree'], workspaceRoot);
      if (isRepo.trim() !== 'true') {
        return { isGitRepo: false, uncommittedCount: 0 };
      }
    } catch {
      return { isGitRepo: false, uncommittedCount: 0 };
    }

    let branch = '';
    try {
      const { stdout: branchOut } = await this.execGit(['rev-parse', '--abbrev-ref', 'HEAD'], workspaceRoot);
      branch = branchOut.trim();
    } catch {
      branch = 'HEAD';
    }

    let uncommittedCount = 0;
    try {
      const { stdout: statusOut } = await this.execGit(['status', '--porcelain'], workspaceRoot);
      uncommittedCount = statusOut.split('\n').filter(line => line.trim().length > 0).length;
    } catch {
      uncommittedCount = 0;
    }

    let remoteUrl: string | undefined;
    try {
      const { stdout: remoteOut } = await this.execGit(['config', '--get', 'remote.origin.url'], workspaceRoot);
      if (remoteOut.trim()) {
        remoteUrl = remoteOut.trim();
      }
    } catch {
      // No remote origin configured
    }

    const compareUrl = remoteUrl && branch ? getBranchCompareUrl(remoteUrl, branch) ?? undefined : undefined;

    return {
      isGitRepo: true,
      branch,
      uncommittedCount,
      remoteUrl,
      compareUrl
    };
  }

  /**
   * Creates a new branch and switches to it.
   */
  public async createBranch(workspaceRoot: string, branchName: string): Promise<GitOperationResult> {
    const cleanBranch = branchName.trim();
    if (!cleanBranch) {
      return {
        success: false,
        operation: 'create_branch',
        error: 'Branch name cannot be empty.'
      };
    }

    // Basic branch name sanity check
    if (/[\s~^:?*\[\\]/.test(cleanBranch)) {
      return {
        success: false,
        operation: 'create_branch',
        error: 'Branch name contains invalid characters. Use letters, numbers, hyphens, and slashes.'
      };
    }

    try {
      await this.execGit(['checkout', '-b', cleanBranch], workspaceRoot);
      return {
        success: true,
        operation: 'create_branch',
        branch: cleanBranch,
        message: `Switched to new branch '${cleanBranch}'.`
      };
    } catch (err: any) {
      const rawError = err.stderr || err.message || String(err);
      return {
        success: false,
        operation: 'create_branch',
        error: this.sanitizeGitError(rawError)
      };
    }
  }

  /**
   * Switches to an existing branch.
   */
  public async switchBranch(workspaceRoot: string, branchName: string): Promise<GitOperationResult> {
    const cleanBranch = branchName.trim();
    if (!cleanBranch) {
      return {
        success: false,
        operation: 'switch_branch',
        error: 'Branch name cannot be empty.'
      };
    }

    try {
      await this.execGit(['checkout', cleanBranch], workspaceRoot);
      return {
        success: true,
        operation: 'switch_branch',
        branch: cleanBranch,
        message: `Switched to branch '${cleanBranch}'.`
      };
    } catch (err: any) {
      const rawError = err.stderr || err.message || String(err);
      return {
        success: false,
        operation: 'switch_branch',
        error: this.sanitizeGitError(rawError)
      };
    }
  }

  /**
   * Stages all changes, creates a commit, and pushes the current branch to origin.
   */
  public async commitAndPush(workspaceRoot: string, customMessage?: string): Promise<GitOperationResult> {
    try {
      // 1. Get current branch and remote
      const state = await this.getGitState(workspaceRoot);
      if (!state.isGitRepo || !state.branch) {
        return {
          success: false,
          operation: 'commit_and_push',
          error: 'Workspace is not a valid Git repository.'
        };
      }

      const branch = state.branch;
      const remoteUrl = state.remoteUrl;

      // 2. Stage all changes
      await this.execGit(['add', '-A'], workspaceRoot);

      // Check if there are changes to commit
      let hasChangesToCommit = false;
      try {
        const { stdout: diffOut } = await this.execGit(['status', '--porcelain'], workspaceRoot);
        hasChangesToCommit = diffOut.trim().length > 0;
      } catch {
        hasChangesToCommit = false;
      }

      // 3. Commit if there are changes
      if (hasChangesToCommit) {
        const commitMsg = customMessage && customMessage.trim().length > 0
          ? customMessage.trim()
          : `Update specifications: ${branch}`;
        await this.execGit(['commit', '-m', commitMsg], workspaceRoot);
      }

      // 4. Push to remote
      if (remoteUrl) {
        await this.execGit(['push', '-u', 'origin', branch], workspaceRoot);
      } else {
        return {
          success: false,
          operation: 'commit_and_push',
          error: 'No remote repository (origin) is configured. Please configure a remote origin to push and share.'
        };
      }

      // 5. Generate share URL
      const shareUrl = getBranchCompareUrl(remoteUrl, branch) ?? undefined;

      return {
        success: true,
        operation: 'commit_and_push',
        branch,
        shareUrl,
        message: hasChangesToCommit
          ? `Changes saved and pushed to ${branch}!`
          : `Branch ${branch} is up to date and pushed.`
      };
    } catch (err: any) {
      const rawError = err.stderr || err.message || String(err);
      return {
        success: false,
        operation: 'commit_and_push',
        error: this.sanitizeGitError(rawError)
      };
    }
  }
}
