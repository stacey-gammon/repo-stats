import { Octokit } from '@octokit/rest';
import { OctokitRepo } from '../types';
import { getLargestRepoMetadata } from './get_largest_repo_metadata';
import { getExtraRepoMetadata } from './get_extra_repo_metadata';

export async function getRepoMetaData(
  client: Octokit,
  language: string
): Promise<Array<OctokitRepo>> {
  const repos: Array<OctokitRepo> = [
    ...(await getLargestRepoMetadata(client, language)),
    ...(await getExtraRepoMetadata(client, language)),
  ];

  return repos;
}
