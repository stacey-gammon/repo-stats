import { Octokit } from '@octokit/rest';
import { TEST_REPO } from './response.mock';
import { ClocStats, OctokitRepo, OctokitResponse, RepoStats } from './types';
import { execSync } from 'child_process';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import yaml from 'js-yaml';
import prettyBytes from 'pretty-bytes';



export async function getRepoStats(client: Octokit, extraRepos: Array<{ owner: string, repo: string }>): Promise<{ [key: string]: RepoStats }> {
  let data: OctokitResponse = { data: { items: [TEST_REPO] } };
  const tempLargestReposCache = Path.resolve(os.tmpdir(), 'largest_repo_cache');

  if (!fs.existsSync(tempLargestReposCache)) {
    data = await client.search.repos({
      q: 'language:typescript size:>=400000 stars:>=1000',
      sort: 'stars',
      order: 'desc',
      size: 5,
      type: 'all'
    }) as unknown as OctokitResponse;
        
    fs.writeFileSync(tempLargestReposCache, JSON.stringify(data));
  } else {
    console.log('largest repos are cached');
    data = JSON.parse(fs.readFileSync(tempLargestReposCache, { encoding: 'utf-8' }));
  }

  await Promise.all(extraRepos.map(async ({ owner, repo }) => {
    console.log(`Getting extra repo ${repo}`);
    const extraRepoFilePath = Path.resolve(
      os.tmpdir(),
      `extraRepoUrl${owner}${repo}`);

    if (!fs.existsSync(extraRepoFilePath)) {
      const repoData = await client.repos.get({
        repo,
        owner
      });
      fs.writeFileSync(extraRepoFilePath, JSON.stringify(repoData));
      data.data.items.push(repoData.data as unknown as OctokitRepo);
    } else {
      console.log(`Extra repo ${repo} is cached`);

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
      data.data.items.push(repoData.data);
    }
  }
  ));
    

  const stats: { [key: string]: RepoStats } = {};

  console.log('About to grab LOC stats');  
  await Promise.all(
    data.data.items
      .map(async (repo) => {   
        console.log(`Grabbing LOC stats for ${repo.name}`);  
        const tempDir = Path.resolve(os.tmpdir(), repo.name);
        if (!fs.existsSync(tempDir)) {
          console.log(`cloning ${repo.html_url} into ${tempDir}`);  
          const output = await execSync(`git clone ${repo.html_url} ${tempDir}`);
          console.log(output);  
        }
        const tempCloc = Path.resolve(os.tmpdir(), repo.name + '_cloc') + '.yaml';

        if (!fs.existsSync(tempCloc)) {
          console.log('Running cloc');
          const cloc = await execSync(`cloc --exclude-dir=node_modules ${tempDir} --yaml --out ${tempCloc}`);
          console.log(cloc);
        }

        const clocStats: ClocStats = yaml.load(fs.readFileSync(tempCloc, { encoding: 'utf-8' })) as ClocStats;

        console.log(`Got stats from ${tempCloc}.`);

        stats[repo.name] = {
          totalLOC: clocStats.SUM.code,
          tsLOC: clocStats.TypeScript ? clocStats.TypeScript.code : 0,
          jsLOC: clocStats.JavaScript ? clocStats.JavaScript.code : 0,
          name: repo.full_name,
          url: repo.html_url,
          repoSizeRaw: repo.size,
          repoSize: prettyBytes(repo.size * 1024)
        }
      })
  );

  console.log('Returning repo stats'); 
  return stats;
}