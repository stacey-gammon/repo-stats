import { execSync } from 'child_process';
import moment from 'moment';

export async function getMonthyContributorStats(cloneDirectory: string) {
  const todayDate = moment();
  const monthAgoDate = moment().subtract(1, 'months');
  const today = todayDate.format('YYYY-MM-DD');
  const monthAgo = monthAgoDate.format('YYYY-MM-DD');

  const output = await execSync(
    `git shortlog --since=${monthAgo} --until=${today} -sn < /dev/tty | wc -l`,
    {
      cwd: cloneDirectory,
    }
  );
  return parseInt(output.toString());
}
