import { ClocStats, OctokitRepo } from '../types';
import { execSync } from 'child_process';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import yaml from 'js-yaml';
import moment from 'moment';
import nconf from 'nconf';


export async function getStatsFromClonedRepo(repo: OctokitRepo): Promise<{ clocStats: ClocStats, monthlyCommitterCount: number }> {
  const cloneDirectory = Path.resolve(os.tmpdir(), repo.name);
  await cloneInto(cloneDirectory, repo);
  const clocStats = await getLocStats(cloneDirectory, repo);
  const monthlyCommitterCount = await getMonthyContributorStats(cloneDirectory);

  return { clocStats, monthlyCommitterCount }
}

async function cloneInto(cloneDirectory: string, repo: OctokitRepo) {
  if (fs.existsSync(cloneDirectory) && nconf.get('clearCache')) {
    fs.rmSync(cloneDirectory);
  }

  if (!fs.existsSync(cloneDirectory)) {
    console.log(`Cloning repo, ${repo.full_name}, into ${cloneDirectory}`);  
    await execSync(`git clone ${repo.html_url} ${cloneDirectory}`); 
  } else {
    console.log(`Repo, ${repo.full_name}, is already cloned into ${cloneDirectory}`);  
  }
}

async function getLocStats(cloneDirectory: string, repo: OctokitRepo): Promise<ClocStats> {
  const locFile = getLocFilePathCache(repo.name);

  if (fs.existsSync(locFile) && nconf.get('clearCache')) {
    fs.rmSync(locFile);
  }

  if (!fs.existsSync(locFile)) {
    console.log(`Collecting line count stats for repo ${repo.full_name}.`);  
    await execSync(`cloc --exclude-dir=node_modules ${cloneDirectory} --yaml --out ${locFile}`);
  } else {
    console.log(`Repo, ${repo.full_name}, has line count stats cached`);  
  }
  return yaml.load(fs.readFileSync(locFile, { encoding: 'utf-8' })) as ClocStats;
}

function getLocFilePathCache(name: string) {
  return Path.resolve(os.tmpdir(), name + '_cloc') + '.yaml';
}

async function getMonthyContributorStats(cloneDirectory: string) {
  const todayDate = moment();
  const monthAgoDate = moment().subtract(1, 'months');
  const today = todayDate.format('YYYY-MM-DD');
  const monthAgo = monthAgoDate.format('YYYY-MM-DD');

  const output = await execSync(`git shortlog --since=${monthAgo} --until=${today} -sn < /dev/tty | wc -l`, {
    cwd: cloneDirectory
  });
  return parseInt(output.toString())
}