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

  console.log(nconf.get('extraRepos'));

  const stats = await getRepoStats(client, nconf.get('extraRepos'));

  const columns = Object.keys(Object.values(stats)[0]) as Array<keyof RepoStats>;
  let csvText = columns.join(',') + '\n';

  Object.values(stats).forEach(row => {
    const cells = columns.map(col => row[col]);
    csvText += cells.join(',') + '\n';
  })

  fs.writeFileSync(nconf.get('output'), csvText);
}


main();