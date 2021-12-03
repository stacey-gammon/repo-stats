import { Octokit } from '@octokit/rest';
import { OctokitRepo, RepoStats } from '../types';
import { getStatsForRepo } from './get_stats_for_repo';

export async function getStatsForRepos(
  client: Octokit,
  repos: Array<OctokitRepo>,
  language: string,
  languages: string[],
  reposToSkip: string[]
): Promise<{ [key: string]: RepoStats }> {
  const stats: { [key: string]: RepoStats } = {};

  for (const repo of repos) {
    if (reposToSkip.includes(repo.full_name)) {
      continue;
    }
    stats[repo.name] = await getStatsForRepo(client, repo, language, languages);
  }

  return stats;
}
