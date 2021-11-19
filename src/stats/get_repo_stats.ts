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
  languages: string[]): Promise<{ [key: string]: RepoStats }> {
    
  const stats: { [key: string]: RepoStats } = {};

  const reposToSkip: string[] = nconf.get('skipRepos') || [];
  
  for (const repo of repos) {
    if (reposToSkip.includes(repo.full_name)) {
      continue;
    }
    const { clocStats, monthlyCommitterCount } = await getStatsFromClonedRepo(repo);
    const monthlyCommitCount = await getLastFourWeekCommitCount(client, repo);

    const { primaryLanguage } = languages.reduce(
      (currMax, lang) => {
        const cloc = clocStats[lang];
        if (!cloc) return currMax;
        return cloc.code > currMax.max ? { max: cloc.code, primaryLanguage: lang } : currMax
      },
      { max: clocStats[language]?.code || 0, primaryLanguage: language }
    ); 

    stats[repo.name] = {
      totalLOC: getSum(clocStats, languages),
      name: repo.full_name,
      url: repo.html_url,
      repoSizeRaw: repo.size,
      repoSize: prettyBytes(repo.size * 1024),
      monthlyCommitCount,
      monthlyCommitterCount,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      locCount: clocStats[language] ? clocStats[language]!.code : 0,
      locLanguage: language,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      primaryLOC: clocStats[primaryLanguage] ? clocStats[primaryLanguage]!.code : 0,
      primaryLanguage,
      starsCount: repo.stargazers_count,
      watchersCount: repo.watchers_count,
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
