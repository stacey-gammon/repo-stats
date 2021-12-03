import { ClocStats, OctokitRepo } from '../types';
import Path from 'path';
import { REPO_CACHE } from '../cache';
import { cloneInto } from './clone_repo';
import { getLocStats } from './get_loc_stats';
import { getMonthyContributorStats } from './get_monthly_contributor_stats';
import { getLastFourWeekCommitCount } from './get_commit_count_stats';
import { Octokit } from '@octokit/rest';
import { getPrimaryLanguage } from './get_primary_language';
import prettyBytes from 'pretty-bytes';

export async function getStatsForRepo(
  client: Octokit,
  repo: OctokitRepo,
  language: string,
  languages: string[]
) {
  const cloneDirectory = Path.resolve(REPO_CACHE, repo.full_name);
  const needsRefresh = await cloneInto(cloneDirectory, repo);

  const clocStats = await getLocStats(cloneDirectory, repo, needsRefresh);
  const monthlyCommitterCount = await getMonthyContributorStats(cloneDirectory);
  const monthlyCommitCount = await getLastFourWeekCommitCount(client, repo);

  const primaryLanguage = getPrimaryLanguage(language, languages, clocStats);

  return {
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
  };
}

function getSum(stats: ClocStats, languagesForSum: string[]): number {
  return languagesForSum.reduce((sum, language) => {
    if (stats[language]) {
      sum += stats[language]?.code || 0;
    }
    return sum;
  }, 0);
}
