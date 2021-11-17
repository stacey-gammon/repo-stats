import { Octokit } from '@octokit/rest';
import { OctokitRepo } from '../types';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import nconf from 'nconf';

export async function getLastFourWeekCommitCount(
  client: Octokit,
  repo: OctokitRepo): Promise<number> {

  const commitStatsFilePath = Path.resolve(
    os.tmpdir(),
    `${repo.name}CommitStatsResponse`);

  if (nconf.get('clearCache')) {
    fs.rmSync(commitStatsFilePath);
  }
  if (!fs.existsSync(commitStatsFilePath)) {
    const response = await client.repos.getParticipationStats({
      repo: repo.name,
      owner: repo.owner.login
    });

    fs.writeFileSync(commitStatsFilePath, JSON.stringify(response));
    return sumLastFourWeekCommitCount(response.data.all);
  } else {
    const response = JSON.parse(fs.readFileSync(commitStatsFilePath, { encoding: 'utf-8' }));
    if (!response.data.all) {
      console.error(response);
      fs.rmSync(commitStatsFilePath);
      throw new Error('No "all" in response.data');
    }
    return sumLastFourWeekCommitCount(response.data.all);
  }
}

function sumLastFourWeekCommitCount(arr: number[]): number {
  let i = arr.length - 1;
  let cnt = 0;
  let sum = 0;
  while (i >= 0 && cnt < 4) {
    sum += arr[i];
    i--;
    cnt++;
  }
  return sum;
}