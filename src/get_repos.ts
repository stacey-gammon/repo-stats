import { Octokit } from '@octokit/rest';
import { OctokitRepo, OctokitResponse } from './types';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import nconf from 'nconf';
import { MIN_SIZE_CONFIG, MIN_STARS_CONFIG, MAX_REPOS_CONFIG } from './utils';

export async function getRepos(
  client: Octokit,
  language: string,
  extraRepos?: Array<{ owner: string, repo: string }>): Promise<Array<OctokitRepo>> {
  const repos: Array<OctokitRepo> = [];
  const tempLargestReposCache = Path.resolve(os.tmpdir(), `largest_repo_cache${language}`);
  const minSize = nconf.get(MIN_SIZE_CONFIG);
  const minStars = nconf.get(MIN_STARS_CONFIG);
  const maxRepos = nconf.get(MAX_REPOS_CONFIG);

  if (fs.existsSync(tempLargestReposCache) && nconf.get('clearRepoSearchCache')) {
    fs.rmSync(tempLargestReposCache);
  }

  if (!fs.existsSync(tempLargestReposCache)) {
    console.log(`Finding largest repos for language ${language}`);
    const response = await client.search.repos({
      q: `language:${language.toLowerCase()} size:>=${minSize * 1000} stars:>=${minStars}`,
      sort: 'stars',
      order: 'desc',
      per_page: maxRepos,
      type: 'all'
    }) as unknown as OctokitResponse;

    console.log(`Found ${response.data.items.length} ${language} repositories over ${minSize} MB and having over ${minStars} stars.`);
    console.log(response.data.items.map(items => `${items.stargazers_count.toLocaleString()} -> ${items.full_name}`).join('\n'));
        
    fs.writeFileSync(tempLargestReposCache, JSON.stringify({
      [MAX_REPOS_CONFIG]: maxRepos,
      [MIN_SIZE_CONFIG]: minSize,
      [MIN_STARS_CONFIG]: minStars,
      response 
    }));
    repos.push(...response.data.items);
  } else {
    console.log(`Searching for largest ${language} repos response is cached.`);
    const { response, ...configs } = JSON.parse(fs.readFileSync(tempLargestReposCache, { encoding: 'utf-8' }));
    if (
      configs[MAX_REPOS_CONFIG] != maxRepos ||
      configs[MIN_STARS_CONFIG] != minStars ||
      configs[MIN_SIZE_CONFIG] != minSize
    ) {
      // Remove cache and run again.
      fs.rmSync(tempLargestReposCache);
      return getRepos(client, language, extraRepos);
    }
    repos.push(...response.data.items);
  }

  if (extraRepos) {
    for (const { owner, repo } of extraRepos) {
      const extraRepoFilePath = Path.resolve(
        os.tmpdir(),
        `extraRepoUrl${owner}${repo}`);

      if (!fs.existsSync(extraRepoFilePath)) {
        const repoData = await client.repos.get({
          repo,
          owner
        });
        fs.writeFileSync(extraRepoFilePath, JSON.stringify(repoData));
        repos.push(repoData.data as unknown as OctokitRepo);
      } else {
        console.log(`Extra repo ${repo} for language ${language} is cached`);

        const repoData = JSON.parse(fs.readFileSync(extraRepoFilePath, { encoding: 'utf-8' }));
        if (!repoData.data.name) {
          if (repoData.data && repoData.data.items) {
            console.error(JSON.stringify(repoData.data.items.map((r: OctokitRepo) => r.full_name)));
          } else {
            console.error(repoData);
          }
          fs.rmSync(extraRepoFilePath);
          throw new Error('No name in repoData');
        }
        repos.push(repoData.data);
      }
    }
  }
  return repos;
}
