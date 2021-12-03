import fs from 'fs';
import { RepoStats } from '../types';
import { getMaxVal, highlightIfMatches, highlight } from '../utils';
import nconf from 'nconf';
import { getConfig } from '../config';

export function writeMonoRepoPage(
  stats: Array<RepoStats>,
  allLanguages: string[],
  language?: string
) {
  const config = getConfig();
  const maxTotalLOC = getMaxVal(stats, 'totalLOC');
  const maxPrimaryLOC = getMaxVal(stats, 'primaryLOC');
  const maxRawRepoSize = getMaxVal(stats, 'repoSizeRaw');
  const maxCommits = getMaxVal(stats, 'monthlyCommitCount');
  const maxCommitters = getMaxVal(stats, 'monthlyCommitterCount');
  const maxStars = getMaxVal(stats, 'starsCount');
  const maxWatchers = getMaxVal(stats, 'watchersCount');
  const maxLoc = getMaxVal(stats, 'locCount');

  const languagesHeader = getLanguagesHeader(allLanguages, language);

  const mdText = `
## Statistics on the world's largest ${language ? language + ' ' : ''}GitHub monorepos

${languagesHeader}

The following list of repositories was selected because of one of the following:
1. They are in the top ${config.maxRepos} ${language || ''} repositories **over ${
    config.minSize
  } MB and ${config.minStars} stars**, sorted by stars.*
2. They are defined in \`extraRepos\` in the [config.json](https://github.com/stacey-gammon/repo-stats/blob/main/config.json).

_The highest number in each column is highlighted_

| Repo | ${
    language ? language : ' Total LOC | Primary language | Primary language'
  } LOC | Repo Size | Monthly commit count | 🤓 Monthly committer count | ★ Stars count | 👁 Watchers count |
| -----|${
    language ? '' : '-------|-----|'
  }----------------------|-----------|------------------|----------------|----------|----------------|
${stats
  .map((row) => {
    const repo = `[${row.name}](${row.url})`;
    const totalLOC = highlightIfMatches(row.totalLOC, maxTotalLOC, row.totalLOC.toLocaleString());
    const lOC = highlightIfMatches(
      language ? row.locCount : row.primaryLOC,
      language ? maxLoc : maxPrimaryLOC,
      language ? row.locCount.toLocaleString() : row.primaryLOC.toLocaleString()
    );
    const repoSize = highlightIfMatches(row.repoSizeRaw, maxRawRepoSize, row.repoSize);
    const commitCount = highlightIfMatches(row.monthlyCommitCount, maxCommits);
    const committerCount = highlightIfMatches(row.monthlyCommitterCount, maxCommitters);
    const stars = highlightIfMatches(row.starsCount, maxStars);
    const watchers = highlightIfMatches(row.watchersCount, maxWatchers);

    return `| ${repo} | ${
      language ? '' : `${totalLOC} | ${row.primaryLanguage} |`
    } ${lOC} | ${repoSize} | ${commitCount} | 🤓 ${committerCount} | ★ ${stars} | 👁 ${watchers} |`;
  })
  .join('\n')}

## Details

  I am leveraging [Cloc](https://github.com/AlDanial/cloc) for the LOC, however, for the total, I am only counting the languages defined in [config.json](https://github.com/stacey-gammon/repo-stats/blob/main/config.json), so as to eliminate counting things like lines of JSON (of which, for example, the Kibana repo has a couple million!).

  * Unfortunately GitHub API does not support sorting by size, and since the LOC counting logic requires locally cloning each of these giant repositories, I may be missing some. If I am, [file an issue](https://github.com/stacey-gammon/repo-stats/issues/new) and I can add it to the list manually. Or, throw up a PR to have it added!

  If you notice any errors with the above numbers, please [file an issue](https://github.com/stacey-gammon/repo-stats/issues/new) and let me know! In particular the Cloc tool supports eliminating certain folders and files for LOC counts. With node, node_modules is excluded, however, for other languages I may be missing certain key configurations.
`;

  const fileName = language || 'index';
  fs.writeFileSync(`${nconf.get('outputFolder')}/${fileName}.md`, mdText);
}

function getLanguagesHeader(languages: string[], pageLanguage?: string) {
  const allText = '[All](./index.html)';
  const all = pageLanguage ? allText : highlight(allText);
  return `| ${all} | ${languages
    .map((language) => {
      const cellVal = `[${language}](./${language}.md)`;
      return highlightIfMatches(language, pageLanguage || '', cellVal);
    })
    .join(' | ')} | `;
}
