import { describe, it, expect } from 'vitest';
import { parseGitRemoteUrl, getBranchCompareUrl, getBranchWebUrl } from '../src/core/gitUrlHelper';

describe('gitUrlHelper', () => {
  describe('parseGitRemoteUrl', () => {
    it('parses GitHub SSH remote url', () => {
      const parsed = parseGitRemoteUrl('git@github.com:owner/repo.git');
      expect(parsed).toEqual({
        host: 'github.com',
        owner: 'owner',
        repo: 'repo',
        platform: 'github',
        webBaseUrl: 'https://github.com/owner/repo'
      });
    });

    it('parses GitHub HTTPS remote url without .git', () => {
      const parsed = parseGitRemoteUrl('https://github.com/acme/project');
      expect(parsed).toEqual({
        host: 'github.com',
        owner: 'acme',
        repo: 'project',
        platform: 'github',
        webBaseUrl: 'https://github.com/acme/project'
      });
    });

    it('parses GitLab SSH with nested subgroups', () => {
      const parsed = parseGitRemoteUrl('git@gitlab.com:org/subgroup/team/my-service.git');
      expect(parsed).toEqual({
        host: 'gitlab.com',
        owner: 'org/subgroup/team',
        repo: 'my-service',
        platform: 'gitlab',
        webBaseUrl: 'https://gitlab.com/org/subgroup/team/my-service'
      });
    });

    it('parses Bitbucket HTTPS url', () => {
      const parsed = parseGitRemoteUrl('https://user@bitbucket.org/team/repo.git');
      expect(parsed).toEqual({
        host: 'bitbucket.org',
        owner: 'team',
        repo: 'repo',
        platform: 'bitbucket',
        webBaseUrl: 'https://bitbucket.org/team/repo'
      });
    });

    it('handles unknown or custom self-hosted git host', () => {
      const parsed = parseGitRemoteUrl('https://git.internal.corp/team/project.git');
      expect(parsed).toEqual({
        host: 'git.internal.corp',
        owner: 'team',
        repo: 'project',
        platform: 'unknown',
        webBaseUrl: 'https://git.internal.corp/team/project'
      });
    });

    it('returns null for empty or invalid remote strings', () => {
      expect(parseGitRemoteUrl('')).toBeNull();
      expect(parseGitRemoteUrl('not a url')).toBeNull();
      expect(parseGitRemoteUrl('https://github.com/')).toBeNull();
    });
  });

  describe('getBranchCompareUrl', () => {
    it('generates GitHub compare URL with expand=1', () => {
      const url = getBranchCompareUrl('git@github.com:marc2016/OpenSpec-Studio.git', 'change/dashboard-filter');
      expect(url).toBe('https://github.com/marc2016/OpenSpec-Studio/compare/change/dashboard-filter?expand=1');
    });

    it('generates GitLab merge request creation URL with encoded branch', () => {
      const url = getBranchCompareUrl('https://gitlab.com/group/repo.git', 'change/my-feature');
      expect(url).toBe('https://gitlab.com/group/repo/-/merge_requests/new?merge_request%5Bsource_branch%5D=change%2Fmy-feature');
    });

    it('generates Bitbucket PR creation URL', () => {
      const url = getBranchCompareUrl('git@bitbucket.org:org/repo.git', 'feature/docs');
      expect(url).toBe('https://bitbucket.org/org/repo/pull-requests/new?source=feature%2Fdocs');
    });

    it('returns tree fallback URL for custom host', () => {
      const url = getBranchCompareUrl('https://git.internal.corp/team/project.git', 'main');
      expect(url).toBe('https://git.internal.corp/team/project/tree/main');
    });
  });

  describe('getBranchWebUrl', () => {
    it('generates GitHub tree URL', () => {
      const url = getBranchWebUrl('git@github.com:marc2016/OpenSpec-Studio.git', 'main');
      expect(url).toBe('https://github.com/marc2016/OpenSpec-Studio/tree/main');
    });

    it('generates GitLab tree URL', () => {
      const url = getBranchWebUrl('https://gitlab.com/group/repo.git', 'dev');
      expect(url).toBe('https://gitlab.com/group/repo/-/tree/dev');
    });

    it('generates Bitbucket src URL', () => {
      const url = getBranchWebUrl('git@bitbucket.org:org/repo.git', 'feature-1');
      expect(url).toBe('https://bitbucket.org/org/repo/src/feature-1');
    });
  });
});
