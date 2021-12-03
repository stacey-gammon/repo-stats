import nconf from 'nconf';
import { getRepoMetaData } from './get_repos/get_repo_meta_data';
import { Octokit } from '@octokit/rest';
import { RepoStats } from './types';
import { getStatsForRepos } from './stats/get_stats_for_repos';
import { getConfig, validateConfig } from './config';
import { writeOutput } from './write_output/write_output';
import { maybeClearCaches } from './cache';

export const MIN_SIZE_FILTER_DEFAULT = 300000; // in KB, so 300000 = 300 MB
export const MIN_STARS_FILTER = 2000;
export const LARGE_REPO_PER_PAGE_CNT_DEFAULT = 30;

export async function main() {
  const config = getConfig();
  validateConfig(config);
  maybeClearCaches(config);

  const auth = nconf.get('GITHUB_OAUTH_TOKEN');
  const client = new Octokit(auth ? { auth } : undefined);

  const outType = config.outType;
  const languages: Array<string> = config.languages;

  let repoStatsForAllLanguages: { [key: string]: RepoStats } = {};

  for (const language of languages) {
    const repos = await getRepoMetaData(client, language);
    const stats = await getStatsForRepos(client, repos, language, languages, config.skipRepos);

    writeOutput(stats, languages, outType, language);

    repoStatsForAllLanguages = { ...repoStatsForAllLanguages, ...stats };
  }

  writeOutput(repoStatsForAllLanguages, languages, outType);
}

main();
