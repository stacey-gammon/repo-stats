import { ClocStats, OctokitRepo } from '../types';
import Path from 'path';
import os from 'os';
import { cloneInto } from './clone_repo';
import { getLocStats } from './get_loc_stats';
import { getMonthyContributorStats } from './get_monthly_contributor_stats';

export async function getStatsFromClonedRepo(
  repo: OctokitRepo
): Promise<{ clocStats: ClocStats; monthlyCommitterCount: number }> {
  const cloneDirectory = Path.resolve(os.tmpdir(), repo.full_name);
  const needsRefresh = await cloneInto(cloneDirectory, repo);
  const clocStats = await getLocStats(cloneDirectory, repo, needsRefresh);
  const monthlyCommitterCount = await getMonthyContributorStats(cloneDirectory);

  return { clocStats, monthlyCommitterCount };
}
