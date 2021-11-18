import { Octokit } from '@octokit/rest';
import { ClocStats, OctokitRepo, RepoStats } from '../types';
import prettyBytes from 'pretty-bytes';
import { getStatsFromClonedRepo } from './get_cloned_repo_stats'
import { getLastFourWeekCommitCount } from './get_commit_count_stats';
import nconf from 'nconf';

export async function getRepoStats(
  client: Octokit,
  repos: Array<OctokitRepo>,
  language: string,
  languagesForSum: string[]): Promise<{ [key: string]: RepoStats }> {
    
  const stats: { [key: string]: RepoStats } = {};

  const reposToSkip: string[] = nconf.get('skipRepos') || [];
  
  for (const repo of repos) {
    if (reposToSkip.includes(repo.full_name)) {
      continue;
    }
    const { clocStats, monthlyCommitterCount } = await getStatsFromClonedRepo(repo);
    const monthlyCommitCount = await getLastFourWeekCommitCount(client, repo);

    stats[repo.name] = {
      totalLOC: getSum(clocStats, languagesForSum),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      primaryLOC: clocStats[language] ? clocStats[language]!.code : 0,
      name: repo.full_name,
      url: repo.html_url,
      repoSizeRaw: repo.size,
      repoSize: prettyBytes(repo.size * 1024),
      monthlyCommitCount,
      monthlyCommitterCount,
      primaryLanguage: language
    }
  }

  return stats;
}

function getSum(stats: ClocStats, languagesForSum: string[]): number {
  return languagesForSum.reduce((sum, language) => {
    if (stats[language]) {
      sum += stats[language]?.code || 0
    }
    return sum;
  }, 0);
}
