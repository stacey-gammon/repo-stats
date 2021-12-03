import { ClocStats, OctokitRepo } from '../types';
import Path from 'path';
import fs from 'fs';
import { getConfig } from '../config';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { STATS_CACHE } from '../cache';

export async function getLocStats(
  cloneDirectory: string,
  repo: OctokitRepo,
  clearCache: boolean
): Promise<ClocStats> {
  const locCacheFile = getLocFilePathCache(repo.name);

  if (fs.existsSync(locCacheFile) && (clearCache || getConfig().clearCache)) {
    fs.rmSync(locCacheFile);
  }

  if (!fs.existsSync(locCacheFile)) {
    console.log(`Collecting line count stats for repo ${repo.full_name}.`);
    const output = await execSync(
      `cloc --exclude-dir=node_modules ${cloneDirectory} --yaml --out ${locCacheFile}`
    );
    console.log(output);
  } else {
    console.log(`Repo, ${repo.full_name}, has line count stats cached`);
  }

  return yaml.load(fs.readFileSync(locCacheFile, { encoding: 'utf-8' })) as ClocStats;
}

function getLocFilePathCache(name: string) {
  return Path.resolve(STATS_CACHE, name + '_cloc') + '.yaml';
}
