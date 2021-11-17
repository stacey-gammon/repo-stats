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

    const maxTotalLOC = getMaxVal(rows, 'totalLOC');
    const maxTsLOC = getMaxVal(rows, 'tsLOC');
    const maxJsLOC = getMaxVal(rows, 'jsLOC');
    const maxRawRepoSize = getMaxVal(rows, 'repoSizeRaw');
    const maxCommits = getMaxVal(rows, 'monthlyCommitCount');
    const maxCommitters = getMaxVal(rows, 'monthlyCommitterCount');

    const mdText = `
## Statistics on the worlds largest Typescript GitHub monorepos

The following list of repositories was selected because of one of the following:
1. They are TypeScript repositories **over 400 MB and 1000 stars**
2. They are defined in \`extraRepos\` in the [config.json](../config.json).

I am leveraging [Cloc](https://github.com/AlDanial/cloc) for the LOC, however, for the total, I am only counting the languages defined in [config.json](../config.json), so as to eliminate counting things like lines of JSON (of which, for example, the Kibana repo has a couple million!).

The highest number in each column is highlighted.

| Repo | Total LOC | TS LOC | JS LOC | Repo Size | Monthly commit count | Monthly committer count |
| -----|-----------|--------|--------|-----------|----------------------|----------------|
${rows.map(row => {
    const repo = `[${row.name}](${row.url})`;
    const totalLOC = highlightIfMatches(row.totalLOC, maxTotalLOC, row.totalLOC.toLocaleString());
    const totalTsLOC = highlightIfMatches(row.tsLOC, maxTsLOC, row.tsLOC.toLocaleString());
    const totalJsLOC = highlightIfMatches(row.jsLOC, maxJsLOC, row.jsLOC.toLocaleString());
    const repoSize = highlightIfMatches(row.repoSizeRaw, maxRawRepoSize, row.repoSize);
    const commitCount = highlightIfMatches(row.monthlyCommitCount, maxCommits);
    const committerCount = highlightIfMatches(row.monthlyCommitterCount, maxCommitters);

    return `| ${repo} | ${totalLOC} | ${totalTsLOC} | ${totalJsLOC} | ${repoSize} | ${commitCount} | ${committerCount} 🤓 | `
  }
  ).join('\n')}
`;

    fs.writeFileSync(nconf.get('output') + '.md', mdText);
  }
}

function highlightIfMatches(contents: number, toMatch: number, displayVal?: string): string {
  const matches = toMatch === contents;
  const display = displayVal || contents.toString();
  return matches ? `<span style="background-color: #F4D03F">${display}</span>` : display;
}

function getMaxVal(rows: RepoStats[], col: keyof RepoStats): number {
  return rows.reduce<number>((max, row) => {
    if (typeof row[col] != 'number') {
      throw new Error('Non-numerical type');
    }
    const num: number = row[col] as number;
    return num> max ? num : max
  }, 0);
}

main();