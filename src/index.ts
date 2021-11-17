import nconf from 'nconf';
import fs from 'fs';
import { getRepos } from './get_repos';
import { Octokit } from '@octokit/rest';
import { RepoStats } from './types';
import { getRepoStats } from './stats/get_repo_stats';

export async function main() {
  nconf.argv()
    .env()
    .file({ file: 'config.json' });

  const auth = nconf.get('GITHUB_OAUTH_TOKEN');
  console.log('auth is ' + auth);
  const client = new Octokit( auth? { auth } : undefined);  

  const outType = nconf.get('outType') || 'md';
  const languages = nconf.get('languages') || ['TypeScript'];

  if (outType !== 'md' && outType != 'csv') {
    throw new Error('outType must be one of csv or md.');
  }

  const repos = await getRepos(client, nconf.get('extraRepos'));
  const stats = await getRepoStats(client, repos, languages);

  const columns = Object.keys(Object.values(stats)[0]) as Array<keyof RepoStats>;

  const rows = (Object.values(stats) as Array<RepoStats>).sort((a, b) => {
    return b.totalLOC - a.totalLOC;
  });

  if (outType === 'csv') {
    let csvText = `
${columns.join(',')}
${
  rows.map(row => {
    csvText += columns.map(c => row[c]).join(',');
  }).join('\n')
}`;
    fs.writeFileSync(nconf.get('output') + '.csv', csvText);
  } else {
    const mdText = `
      ## GitHub monorepo statistics 

The following repositories contain:
1. The largest TypeScript repositories over 400 MB and 1000 stars
2. Any additional repositories defined in the [config.json](../config.json) when I last ran the script.

I am leveraging Cloc for the LOC, however, for the total, I am only counting the languages defined in the [config.json](../config.json), so as to eliminate counting things like lines of JSON (of which, for example, the Kibana repo has a couple million!).

| Repo | Total LOC | TS LOC | JS LOC | Repo Size | Monthly commit count | Monthly committer count |
| -----|-----------|--------|--------|-----------|----------------------|----------------|
${rows.map(row => 
    `| [${row.name}](${row.url}) | ${row.totalLOC.toLocaleString()} | ${row.tsLOC.toLocaleString()} | ${row.jsLOC.toLocaleString()} | ${row.repoSize} | ${row.monthlyCommitCount} | ${row.monthlyCommitterCount} | `
  ).join('\n')}
`;

    fs.writeFileSync(nconf.get('output') + '.md', mdText);
  }
}


main();