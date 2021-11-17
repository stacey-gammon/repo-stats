import { ClocStats, OctokitRepo } from '../types';
import { execSync } from 'child_process';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import yaml from 'js-yaml';
import moment from 'moment';
import nconf from 'nconf';

export async function getStatsFromClonedRepo(repo: OctokitRepo): Promise<{ clocStats: ClocStats, monthlyCommitterCount: number }> {
  const tempDir = Path.resolve(os.tmpdir(), repo.name);

  if (fs.existsSync(tempDir) && nconf.get('clearCache')) {
    fs.rmSync(tempDir);
  }

  if (!fs.existsSync(tempDir)) {
    console.log(`cloning ${repo.html_url} into ${tempDir}`);  
    const output = await execSync(`git clone ${repo.html_url} ${tempDir}`);
    console.log(output);  
  }
  const tempCloc = Path.resolve(os.tmpdir(), repo.name + '_cloc') + '.yaml';

  if (fs.existsSync(tempCloc) && nconf.get('clearCache')) {
    fs.rmSync(tempCloc);
  }

  if (!fs.existsSync(tempCloc)) {
    await execSync(`cloc --exclude-dir=node_modules ${tempDir} --yaml --out ${tempCloc}`);
  }

  const todayDate = moment();
  const monthAgoDate = moment().subtract(1, 'months');
  const today = todayDate.format('YYYY-MM-DD');
  const monthAgo = monthAgoDate.format('YYYY-MM-DD');

  const cnt = await execSync(`git shortlog --since=${monthAgo} --until=${today} -sn < /dev/tty | wc -l`, {
    cwd: tempDir
  });
  const clocStats = yaml.load(fs.readFileSync(tempCloc, { encoding: 'utf-8' })) as ClocStats;

  return { clocStats, monthlyCommitterCount: parseInt(cnt.toString()) }
}

