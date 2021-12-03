import { RepoStats } from '../types';
import { writeCSV } from './build_monorepo_csv';
import { writeMonoRepoPage } from './build_monorepo_md';

export function writeOutput(
  stats: { [key: string]: RepoStats },
  allLanguages: string[],
  outType: string,
  language?: string
) {
  // When building the page that shows all languages, sort by total LOC rather than the
  // specific language LOC.
  const sortBy = language ? 'locCount' : 'totalLOC';
  const rows = Object.values(stats).sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

  if (outType === 'csv') {
    writeCSV(rows);
  } else {
    writeMonoRepoPage(rows, allLanguages, language);
  }
}
