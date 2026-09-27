export type GitPlatform = 'github' | 'gitlab' | 'bitbucket' | 'unknown';

export interface ParsedGitRemote {
  host: string;
  owner: string;
  repo: string;
  platform: GitPlatform;
  webBaseUrl: string;
}

/**
 * Parses a Git remote URL (SSH or HTTPS format) into structured metadata.
 */
export function parseGitRemoteUrl(remoteUrl: string): ParsedGitRemote | null {
  if (!remoteUrl || typeof remoteUrl !== 'string') {
    return null;
  }

  const trimmed = remoteUrl.trim();
  let host = '';
  let path = '';

  // 1. Check SCP-like syntax: git@host:owner/repo.git
  const scpMatch = trimmed.match(/^(?:[\w-]+@)?([^:]+):(.+)$/);
  // Exclude URLs with protocols like http:// or ssh:// from scpMatch
  if (scpMatch && !trimmed.includes('://')) {
    host = scpMatch[1].toLowerCase();
    path = scpMatch[2];
  } else {
    // 2. Protocol based syntax: https://, ssh://, git://
    try {
      // Normalize ssh://git@host/path
      const urlToParse = trimmed.startsWith('ssh://') 
        ? trimmed.replace(/^ssh:\/\/(?:[\w-]+@)?/, 'https://')
        : trimmed;
      const parsed = new URL(urlToParse);
      host = parsed.hostname.toLowerCase();
      path = parsed.pathname;
    } catch {
      return null;
    }
  }

  // Clean path: strip leading slash and trailing .git or slashes
  path = path.replace(/^\/+/, '').replace(/\.git\/?$/, '').replace(/\/+$/, '');
  if (!path) {
    return null;
  }

  // Split owner and repo (handles multi-level groups for GitLab as well)
  const segments = path.split('/').filter(Boolean);
  if (segments.length < 2) {
    return null;
  }

  const repo = segments[segments.length - 1];
  const owner = segments.slice(0, segments.length - 1).join('/');

  let platform: GitPlatform = 'unknown';
  if (host.includes('github.com')) {
    platform = 'github';
  } else if (host.includes('gitlab.com') || host.startsWith('gitlab.')) {
    platform = 'gitlab';
  } else if (host.includes('bitbucket.org')) {
    platform = 'bitbucket';
  }

  const webBaseUrl = `https://${host}/${owner}/${repo}`;

  return {
    host,
    owner,
    repo,
    platform,
    webBaseUrl
  };
}

/**
 * Generates a direct web URL to compare the branch or open a Pull Request / Merge Request.
 */
export function getBranchCompareUrl(remoteUrl: string, branch: string): string | null {
  const parsed = parseGitRemoteUrl(remoteUrl);
  if (!parsed || !branch) {
    return null;
  }

  const cleanBranch = branch.trim();
  const encodedBranch = encodeURIComponent(cleanBranch);

  switch (parsed.platform) {
    case 'github':
      // GitHub compare accepts either raw branch with slash or encoded
      return `https://${parsed.host}/${parsed.owner}/${parsed.repo}/compare/${cleanBranch}?expand=1`;

    case 'gitlab':
      return `https://${parsed.host}/${parsed.owner}/${parsed.repo}/-/merge_requests/new?merge_request%5Bsource_branch%5D=${encodedBranch}`;

    case 'bitbucket':
      return `https://${parsed.host}/${parsed.owner}/${parsed.repo}/pull-requests/new?source=${encodedBranch}`;

    default:
      return `${parsed.webBaseUrl}/tree/${encodedBranch}`;
  }
}

/**
 * Generates a direct web URL to browse the branch tree online.
 */
export function getBranchWebUrl(remoteUrl: string, branch: string): string | null {
  const parsed = parseGitRemoteUrl(remoteUrl);
  if (!parsed || !branch) {
    return null;
  }

  const cleanBranch = branch.trim();
  const encodedBranch = encodeURIComponent(cleanBranch);

  switch (parsed.platform) {
    case 'github':
      return `https://${parsed.host}/${parsed.owner}/${parsed.repo}/tree/${cleanBranch}`;

    case 'gitlab':
      return `https://${parsed.host}/${parsed.owner}/${parsed.repo}/-/tree/${cleanBranch}`;

    case 'bitbucket':
      return `https://${parsed.host}/${parsed.owner}/${parsed.repo}/src/${cleanBranch}`;

    default:
      return `${parsed.webBaseUrl}/tree/${encodedBranch}`;
  }
}
