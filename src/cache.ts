import fs from 'fs';
import { ConfigOptions } from './config';
import Path from 'path';

export const STATS_CACHE = Path.resolve(__dirname, '..', '.stats_cache');
export const REPO_CACHE = Path.resolve(__dirname, '..', '.repo_cache');

export function maybeClearCaches(config: ConfigOptions) {
  if (config.clearCache) {
    fs.rmSync(STATS_CACHE, { recursive: true, force: true });
  }

  if (config.clearRepoCache) {
    fs.rmSync(REPO_CACHE, { recursive: true, force: true });
  }
}
