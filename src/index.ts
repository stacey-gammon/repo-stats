import nconf from 'nconf';
import fs from 'fs';
import { getRepoStats } from './get_repos';
import { Octokit } from '@octokit/rest';
import { RepoStats } from './types';

const client = new Octokit();

export async function main() {
  nconf.argv()
    .env()
    .file({ file: '../config.json' });

  const stats = await getRepoStats(client, [
    { owner: 'babel', repo: 'babel' },
    { owner: 'typescript-eslint', repo: 'typescript-eslint' },
    { owner: 'microsoft', repo: 'rushstack' },
    { owner: 'elastic', repo: 'search-ui' },
    { owner: 'open-telemetry', repo: 'opentelemetry-js' },
    { owner: 'open-telemetry', repo: 'opentelemetry-js-contrib' },
    { owner: 'celo-org', repo: 'celo-monorepo' },
    { owner: 'angular', repo: 'angular' },
    { owner: 'formatjs', repo: 'formatjs' },
    { owner: 'thi-ng', repo: 'umbrella' },
    { owner: 'facebook', repo: 'jest' },
    { owner: 'Esri', repo: 'arcgis-rest-js' },
    //    { owner: 'Esri', repo: 'hub' } not found
  ]);

  const columns = Object.keys(Object.values(stats)[0]) as Array<keyof RepoStats>;
  let csvText = columns.join(',') + '\n';

  Object.values(stats).forEach(row => {
    const cells = columns.map(col => row[col]);
    csvText += cells.join(',') + '\n';
  })

  fs.writeFileSync('./out.csv', csvText);
}


main();