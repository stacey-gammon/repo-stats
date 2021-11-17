import { Octokit } from '@octokit/rest';
import { OctokitRepo } from '../types';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import nconf from 'nconf';

export async function getCommitterCount(
  client: Octokit,
  repo: OctokitRepo): Promise<number> {

  const contributorStatsFilePath = Path.resolve(
    os.tmpdir(),
    `${repo.name}ContributorStatsResponse`);

  if (fs.existsSync(contributorStatsFilePath) && nconf.get('clearCache')) {
    fs.rmSync(contributorStatsFilePath);
  }
  if (!fs.existsSync(contributorStatsFilePath)) {
    const response = await client.repos.getContributorsStats({
      repo: repo.name,
      owner: repo.owner.login
    });

    fs.writeFileSync(contributorStatsFilePath, JSON.stringify(response));
    console.log(response);
    return response.data.length as number;
  } else {
    const response = JSON.parse(fs.readFileSync(contributorStatsFilePath, { encoding: 'utf-8' }));
    if (isNaN(response.data.length)) {
      console.error(response);
      fs.rmSync(contributorStatsFilePath);
      throw new Error('Response.data.length is NaN');
    }
    return response.data.length;
  }
}
