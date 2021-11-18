import { Octokit } from '@octokit/rest';
import { OctokitRepo, OctokitResponse } from './types';
import Path from 'path';
import os from 'os';
import fs from 'fs';

const LARGER_THAN_FILTER = 400000; // 400 MB
const STARS_FILTER = 1000;

export async function getRepos(
  client: Octokit,
  language: string,
  extraRepos?: Array<{ owner: string, repo: string }>): Promise<Array<OctokitRepo>> {
  const repos: Array<OctokitRepo> = [];
  const tempLargestReposCache = Path.resolve(os.tmpdir(), `largest_repo_cache${language}`);

  if (!fs.existsSync(tempLargestReposCache)) {
    console.log(`Finding largest repos for language ${language}`);
    const response = await client.search.repos({
      q: `language:${language.toLowerCase()} size:>=${LARGER_THAN_FILTER} stars:>=${STARS_FILTER}`,
      sort: 'stars',
      order: 'desc',
      per_page: 5,
      type: 'all'
    }) as unknown as OctokitResponse;
        
    fs.writeFileSync(tempLargestReposCache, JSON.stringify(response));
    repos.push(...response.data.items);
  } else {
    console.log(`Searching for largest ${language} repos response is cached.`);
    const response = JSON.parse(fs.readFileSync(tempLargestReposCache, { encoding: 'utf-8' }));
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
