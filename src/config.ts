import { LARGE_REPO_PER_PAGE_CNT_DEFAULT, MIN_SIZE_FILTER_DEFAULT, MIN_STARS_FILTER } from '.';
import nconf from 'nconf';

export interface ConfigOptions {
  // Removes every cached file and folder except the repo download,
  // as that can take a very long time.
  clearCache: boolean;

  // This has to be set to remove the downloaded repo cache. The above alone will not do.
  clearRepoCache: boolean;

  // Output the data in markdown format or csv.
  outType: 'md' | 'csv';

  // When searching GitHub for interesting repositories, limit to repos that are larges than this
  // value (in KB).
  minSize: number;

  // Limit GitHub repository search to repositories with this minimum number of stars.
  minStars: number;

  // The maximum number of repositories to grab from GitHub APIs. This is _per language_. If this
  // number is larger than 100 it will have no effect.
  maxRepos: number;

  // Any additional repos you are interested in.
  extraRepos: { [language: string]: Array<{ owner: string; repo: string }> };

  // The list of languages that you are interested in. Each language will get it's own page or csv file.
  // In addition there will be a page to compare all of them. The languages listed here will be what
  // is used to calculate the total LOC.
  languages: string[];

  // Any repos you wish to skip. It's good to use this for large repos that are only large because
  // of static assets.
  skipRepos: string[];
}

export const CONFIG_DEFAULTS: ConfigOptions = {
  outType: 'md',
  clearCache: false,
  clearRepoCache: false,
  minSize: MIN_SIZE_FILTER_DEFAULT,
  minStars: MIN_STARS_FILTER,
  maxRepos: LARGE_REPO_PER_PAGE_CNT_DEFAULT,
  extraRepos: {},
  languages: ['TypeScript'],
  skipRepos: [],
};

export function getConfig(): ConfigOptions {
  nconf.argv().env().file({ file: 'config.json' }).defaults(CONFIG_DEFAULTS);
  return nconf.get();
}

export function validateConfig(config: unknown | ConfigOptions) {
  const languages = (config as ConfigOptions).languages;
  if (!(languages instanceof Array)) {
    throw new Error('languages must be an array.');
  }

  const outType = (config as ConfigOptions).outType;
  if (outType !== 'md' && outType != 'csv') {
    throw new Error('outType must be one of csv or md.');
  }
}
