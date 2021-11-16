import { ClocStats, OctokitRepo } from '../types';
import { execSync } from 'child_process';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import yaml from 'js-yaml';

export async function getClocStats(repo: OctokitRepo): Promise<ClocStats> {
  console.log(`Grabbing LOC stats for ${repo.name}`);  
  const tempDir = Path.resolve(os.tmpdir(), repo.name);

  if (!fs.existsSync(tempDir)) {
    console.log(`cloning ${repo.html_url} into ${tempDir}`);  
    const output = await execSync(`git clone ${repo.html_url} ${tempDir}`);
    console.log(output);  
  }
  const tempCloc = Path.resolve(os.tmpdir(), repo.name + '_cloc') + '.yaml';

  if (!fs.existsSync(tempCloc)) {
    await execSync(`cloc --exclude-dir=node_modules ${tempDir} --yaml --out ${tempCloc}`);
  }

  return yaml.load(fs.readFileSync(tempCloc, { encoding: 'utf-8' })) as ClocStats;
}
