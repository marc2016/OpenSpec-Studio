import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { CliInfo, CliMode } from '../shared/types';

export class CliAdapter {
  private cachedCliInfo: Map<string, CliInfo> = new Map();

  constructor(private mode: CliMode = 'auto') {}

  public setMode(mode: CliMode) {
    if (this.mode !== mode) {
      this.mode = mode;
      this.clearCache();
    }
  }

  public getMode(): CliMode {
    return this.mode;
  }

  public clearCache() {
    this.cachedCliInfo.clear();
  }

  public async resolveCli(workspaceRoot: string, forceRefresh = false): Promise<CliInfo> {
    if (!forceRefresh && this.cachedCliInfo.has(workspaceRoot)) {
      return this.cachedCliInfo.get(workspaceRoot)!;
    }

    const isWindows = process.platform === 'win32';
    const localBinName = isWindows ? 'openspec.cmd' : 'openspec';
    const localBin = path.join(workspaceRoot, 'node_modules', '.bin', localBinName);

    const cacheAndReturn = (info: CliInfo): CliInfo => {
      this.cachedCliInfo.set(workspaceRoot, info);
      return info;
    };

    // 1. Try local node_modules
    if (this.mode === 'local' || this.mode === 'auto') {
      if (fs.existsSync(localBin)) {
        const version = await this.getVersion(localBin, workspaceRoot);
        return cacheAndReturn({
          mode: 'local',
          resolvedPath: localBin,
          version,
          isAvailable: true
        });
      } else if (this.mode === 'local') {
        return cacheAndReturn({
          mode: 'local',
          resolvedPath: localBin,
          isAvailable: false
        });
      }
    }

    // 2. Try global PATH
    if (this.mode === 'global' || this.mode === 'auto') {
      const globalBin = await this.findGlobalBinary();
      if (globalBin) {
        const version = await this.getVersion(globalBin, workspaceRoot);
        return cacheAndReturn({
          mode: 'global',
          resolvedPath: globalBin,
          version,
          isAvailable: true
        });
      } else if (this.mode === 'global') {
        return cacheAndReturn({
          mode: 'global',
          resolvedPath: 'openspec',
          isAvailable: false
        });
      }
    }

    // 3. Fallback to npx
    return cacheAndReturn({
      mode: 'npx',
      resolvedPath: 'npx --yes openspec',
      isAvailable: true
    });
  }

  private findGlobalBinary(): Promise<string | null> {
    return new Promise((resolve) => {
      const cmd = process.platform === 'win32' ? 'where openspec' : 'which openspec';
      exec(cmd, (err, stdout) => {
        if (err || !stdout.trim()) {
          resolve(null);
        } else {
          resolve(stdout.trim().split('\n')[0]);
        }
      });
    });
  }

  private getVersion(binPath: string, cwd: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      exec(`"${binPath}" --version`, { cwd }, (err, stdout) => {
        if (err) {
          resolve(undefined);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  public runCommand(
    commandArgs: string[],
    cwd: string,
    cliInfo?: CliInfo
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve, reject) => {
      const bin = cliInfo?.resolvedPath || 'npx --yes openspec';
      const fullCmd = `${bin} ${commandArgs.join(' ')}`;

      exec(fullCmd, { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        const code = err ? (err.code ?? 1) : 0;
        resolve({ stdout, stderr, code });
      });
    });
  }

  public async listChanges(cwd: string, cliInfo?: CliInfo): Promise<any> {
    const res = await this.runCommand(['list', '--json'], cwd, cliInfo);
    if (res.code === 0 && res.stdout) {
      try {
        return JSON.parse(res.stdout);
      } catch {
        return null;
      }
    }
    return null;
  }

  public async listSpecs(cwd: string, cliInfo?: CliInfo): Promise<any> {
    const res = await this.runCommand(['list', '--specs', '--json'], cwd, cliInfo);
    if (res.code === 0 && res.stdout) {
      try {
        return JSON.parse(res.stdout);
      } catch {
        return null;
      }
    }
    return null;
  }

  public async initProject(cwd: string, cliInfo?: CliInfo): Promise<{ success: boolean; output: string }> {
    const res = await this.runCommand(['init'], cwd, cliInfo);
    return {
      success: res.code === 0,
      output: res.stdout || res.stderr
    };
  }
}
