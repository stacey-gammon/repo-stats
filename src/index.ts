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

  if (outType !== 'md' && outType != 'csv') {
    throw new Error('outType must be one of csv or md.');
  }

  const stats = await getRepoStats(client, nconf.get('extraRepos'));

  const columns = Object.keys(Object.values(stats)[0]) as Array<keyof RepoStats>;

  // Yes, this logic is very fragile as it depends on the non-deterministic order of the keys. 
  const rows = (Object.values(stats).map(row => columns.map(col => row[col])) as Array<Array<string>>).sort((a, b) => {
    const aTotalLOC = parseInt(a[0]);
    const bTotalLOC = parseInt(b[0]);

    return bTotalLOC - aTotalLOC;
  });

  if (outType === 'csv') {
    let csvText = columns.join(',') + '\n';
    rows.forEach(cells => {
      csvText += cells.join(',') + '\n';
    });
    fs.writeFileSync(nconf.get('output') + '.csv', csvText);
  } else {
    const mdText = `
      ## GitHub repository comparison

| ${columns.join(' | ')} |
| ${columns.map(() => '----').join(' | ')} |
${rows.map(row => ` | ${row.join(' | ')} |`).join('\n')}
    `;

    fs.writeFileSync(nconf.get('output') + '.md', mdText);
  }
}


main();