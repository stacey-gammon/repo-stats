import { Octokit } from "@octokit/rest";
import { TEST_REPO } from "./response.mock";
import { ClocStats, OctokitRepo, OctokitResponse, RepoStats } from "./types";
import { exec, execSync } from 'child_process';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import yaml from 'js-yaml';
import prettyBytes from "pretty-bytes";



export async function getRepoStats(client: Octokit, extraRepos: Array<{ owner: string, repo: string }>): Promise<{ [key: string]: RepoStats }> {
    let data: OctokitResponse = { data: { items: [TEST_REPO] } };
    const tempLargestReposCache = Path.resolve(os.tmpdir(), 'largest_repo_cache');

    if (!fs.existsSync(tempLargestReposCache)) {
        data = await client.search.repos({
            q: `language:typescript size:>=400000 stars:>=1000`,
            sort: "stars",
            order: "desc",
            size: 1,
            type: "all"
            }) as unknown as OctokitResponse;
        
      fs.writeFileSync(tempLargestReposCache, JSON.stringify(data));
    } else {
      console.log(`largest repos are cached`);
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
          fs.writeFileSync(extraRepoFilePath, JSON.stringify(data));
          data.data.items.push(repoData.data as unknown as OctokitRepo);
        } else {
          console.log(`Extra repo ${repo} is cached`);

          const repoData = JSON.parse(fs.readFileSync(extraRepoFilePath, { encoding: 'utf-8' }));
          data.data.items.push(repoData);
        }
       }
    ));
    

    const stats: { [key: string]: RepoStats } = {};

    await Promise.all(
      data.data.items
        .map(async (repo) => {   
          const tempDir = Path.resolve(os.tmpdir(), repo.name);
          console.log(`cloning ${repo.html_url} into ${tempDir}`);  
          if (!fs.existsSync(tempDir)) {
            const output = await execSync(`git clone ${repo.html_url} ${tempDir}`);
            console.log(output);  
          }
          console.log('Running cloc now');
          const tempCloc = Path.resolve(os.tmpdir(), repo.name + '_cloc') + '.yaml';

          if (!fs.existsSync(tempCloc)) {
            const cloc = await execSync(`cloc --exclude-dir=node_modules ${tempDir} --yaml --out ${tempCloc}`);
            console.log(cloc);
          }

          const clocStats: ClocStats = yaml.load(fs.readFileSync(tempCloc, { encoding: 'utf-8' })) as ClocStats;

         console.log(`stats from ${tempCloc} are:`);
         console.log(clocStats);

         stats[repo.name] = {
           totalLOC: clocStats.SUM.code,
           tsLOC: clocStats.TypeScript!.code,
           name: repo.name,
           url: repo.html_url,
           repoSizeRaw: repo.size,
           repoSize: prettyBytes(repo.size * 1024)
         }
        })
    );

    return stats;
}