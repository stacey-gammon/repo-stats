import { OctokitRepo } from '../types';
import fs from 'fs';
import prettyBytes from 'pretty-bytes';
import { execSync } from 'child_process';

export async function cloneInto(cloneDirectory: string, repo: OctokitRepo): Promise<boolean> {
  let needsLOCRefresh = false;

  if (!fs.existsSync(cloneDirectory)) {
    console.log(
      `Cloning repo, ${repo.full_name} (${repo.stargazers_count}★s  and ${prettyBytes(
        repo.size * 1024
      )}), into ${cloneDirectory}`
    );
    await execSync(`git clone ${repo.html_url} ${cloneDirectory}`);
  } else {
    console.log(
      `Repo, ${repo.full_name} (${repo.stargazers_count}★s  and ${prettyBytes(
        repo.size * 1024
      )}), is already cloned into ${cloneDirectory}`
    );
    const output = await execSync('git pull origin', { cwd: cloneDirectory });
    if (output.indexOf('Already up to date') >= 0) {
      needsLOCRefresh = false;
    } else {
      needsLOCRefresh = true;
    }
  }
  return needsLOCRefresh;
}
