import nconf from 'nconf';
import { getRepos } from './get_repos';
import { Octokit } from '@octokit/rest';
import { RepoStats } from './types';
import { getRepoStats } from './stats/get_repo_stats';
import { writeCSV } from './build_monorepo_csv';
import { writeMonoRepoPage } from './build_monorepo_page';

export async function main() {
  nconf.argv()
    .env()
    .file({ file: 'config.json' });

  const auth = nconf.get('GITHUB_OAUTH_TOKEN');
  console.log('auth is ' + auth);
  const client = new Octokit( auth? { auth } : undefined);  

  const outType = nconf.get('outType') || 'md';
  const languages: Array<string> = nconf.get('languages') || ['TypeScript'];

  if (typeof languages != 'object') {
    throw new Error('languages must be an array.')
  }

  if (outType !== 'md' && outType != 'csv') {
    throw new Error('outType must be one of csv or md.');
  }

  const extraRepos = nconf.get('extraRepos');
  console.log('extraRepos is', extraRepos)
  const allRepoStats: { [key: string]: RepoStats } = {}

  for (const language of languages) {
    const repos = await getRepos(client, language, extraRepos[language]);
    const stats = await getRepoStats(client, repos, language, languages);
    const rows = (Object.values(stats) as Array<RepoStats>).sort((a, b) => {
      return b.totalLOC - a.totalLOC;
    });

    Object.keys(stats).forEach(key => allRepoStats[key] = stats[key]);

    if (outType === 'csv') {
      writeCSV(rows, language);
    } else {
      writeMonoRepoPage(rows, language); 
    }
  }

  const allRepoRows = (Object.values(allRepoStats) as Array<RepoStats>).sort((a, b) => {
    return b.totalLOC - a.totalLOC;
  });

  if (outType === 'csv') {
    writeCSV(allRepoRows);
  } else {
    writeMonoRepoPage(allRepoRows); 
  }
}

main();