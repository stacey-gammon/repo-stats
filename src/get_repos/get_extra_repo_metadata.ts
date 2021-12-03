import { Octokit } from '@octokit/rest';
import { getConfig } from '../config';
import { OctokitRepo } from '../types';

export async function getExtraRepoMetadata(
  client: Octokit,
  language: string
): Promise<Array<OctokitRepo>> {
  const extraRepos = getConfig().extraRepos[language];
  if (!extraRepos) return [];

  const repos: Array<OctokitRepo> = [];
  for (const { owner, repo } of extraRepos) {
    const repoData = await client.repos.get({
      repo,
      owner,
    });
    repos.push(repoData.data as unknown as OctokitRepo);
  }
  return repos;
}
