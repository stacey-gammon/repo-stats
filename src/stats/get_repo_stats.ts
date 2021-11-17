import { Octokit } from '@octokit/rest';
import { ClocStats, OctokitRepo, RepoStats } from '../types';
import prettyBytes from 'pretty-bytes';
import { getStatsFromClonedRepo } from './get_cloned_repo_stats'
import { getLastFourWeekCommitCount } from './get_commit_count_stats';

export async function getRepoStats(
  client: Octokit,
  repos: Array<OctokitRepo>,
  languagesForSum: string[]): Promise<{ [key: string]: RepoStats }> {
    
  const stats: { [key: string]: RepoStats } = {};

  await Promise.all(
    repos
      .map(async (repo) => {   
      
        const { clocStats, monthlyCommitterCount } = await getStatsFromClonedRepo(repo);
        const monthlyCommitCount = await getLastFourWeekCommitCount(client, repo);

        stats[repo.name] = {
          totalLOC: getSum(clocStats, languagesForSum),
          tsLOC: clocStats.TypeScript ? clocStats.TypeScript.code : 0,
          jsLOC: clocStats.JavaScript ? clocStats.JavaScript.code : 0,
          name: repo.full_name,
          url: repo.html_url,
          repoSizeRaw: repo.size,
          repoSize: prettyBytes(repo.size * 1024),
          monthlyCommitCount,
          monthlyCommitterCount
        }
      })
  );

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
