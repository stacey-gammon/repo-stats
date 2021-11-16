import nconf from 'nconf';
import fs from 'fs';
import { getRepoStats } from './get_repos';
import { Octokit } from '@octokit/rest';
import { RepoStats } from './types';

const client = new Octokit();

export async function main() {
  nconf.argv()
    .env()
    .file({ file: 'config.json' });

  const outType = nconf.get('outType') || 'md';
  const languages = nconf.get('languages') || ['TypeScript'];

  if (outType !== 'md' && outType != 'csv') {
    throw new Error('outType must be one of csv or md.');
  }

  const stats = await getRepoStats(client, nconf.get('extraRepos'), languages);

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
      ## GitHub repository comparison

| Repo | Total LOC | TS LOC | JS LOC | Repo Size |
| -----|-----------|--------|--------|-----------|
${rows.map(row => 
    `| [${row.name}](${row.url}) | ${row.totalLOC.toLocaleString()} | ${row.tsLOC.toLocaleString()} | ${row.jsLOC.toLocaleString()} | ${row.repoSize} |`
  ).join('\n')}
`;

    fs.writeFileSync(nconf.get('output') + '.md', mdText);
  }
}


main();