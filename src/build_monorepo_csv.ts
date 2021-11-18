import { RepoStats } from './types';
import fs from 'fs';
import nconf from 'nconf';

export function writeCSV(rows: Array<RepoStats>, language?: string) {
  const columns = Object.keys(rows[0]) as Array<keyof RepoStats>;
  let csvText = `
    ${columns.join(',')}
    ${
  rows.map(row => {
    csvText += columns.map(c => row[c]).join(',');
  }).join('\n')
}`;
  const fileName = language || 'index';
  fs.writeFileSync(`${nconf.get('outputFolder')}/${fileName}.csv`, csvText);
}