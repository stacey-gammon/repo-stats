
import fs from 'fs';
import { RepoStats } from './types';
import { getMaxVal, highlightIfMatches } from './utils';
import nconf from 'nconf';

export function writeMonoRepoPage(stats: Array<RepoStats>, language?: string) {
  const maxTotalLOC = getMaxVal(stats, 'totalLOC');
  const maxPrimaryLOC = getMaxVal(stats, 'primaryLOC');
  const maxRawRepoSize = getMaxVal(stats, 'repoSizeRaw');
  const maxCommits = getMaxVal(stats, 'monthlyCommitCount');
  const maxCommitters = getMaxVal(stats, 'monthlyCommitterCount');

  const mdText = `
## Statistics on the worlds largest Typescript GitHub monorepos

The following list of repositories was selected because of one of the following:
1. They are ${language || ''} repositories **over 400 MB and 1000 stars**
2. They are defined in \`extraRepos\` in the [config.json](https://github.com/stacey-gammon/repo-stats/blob/main/config.json).

I am leveraging [Cloc](https://github.com/AlDanial/cloc) for the LOC, however, for the total, I am only counting the languages defined in [config.json](https://github.com/stacey-gammon/repo-stats/blob/main/config.json), so as to eliminate counting things like lines of JSON (of which, for example, the Kibana repo has a couple million!).

The highest number in each column is highlighted.

| Repo | ${language ? '' : ' Total LOC | Primary language |'} Primary language LOC | Repo Size | Monthly commit count | Monthly committer count |
| -----|${language ? '' : '-------|-----|'}----------------------|-----------|------------------|----------------|
${stats.map(row => {
    const repo = `[${row.name}](${row.url})`;
    const totalLOC = highlightIfMatches(row.totalLOC, maxTotalLOC, row.totalLOC.toLocaleString());
    const totalTsLOC = highlightIfMatches(row.primaryLOC, maxPrimaryLOC, row.primaryLOC.toLocaleString());
    const repoSize = highlightIfMatches(row.repoSizeRaw, maxRawRepoSize, row.repoSize);
    const commitCount = highlightIfMatches(row.monthlyCommitCount, maxCommits);
    const committerCount = highlightIfMatches(row.monthlyCommitterCount, maxCommitters);

    return `| ${repo} | ${language ? '' : `${totalLOC} | ${row.primaryLanguage} |`} ${totalTsLOC} | ${repoSize} | ${commitCount} | ${committerCount} 🤓 | `
  }
  ).join('\n')}


_Think your repo belongs on this list? Shoot me an email at stacey@staceygammon.com, or throw up a PR to have it added._
`;

  const fileName = language || 'index';
  fs.writeFileSync(`${nconf.get('outputFolder')}/${fileName}.md`, mdText);
}
