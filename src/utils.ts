import { RepoStats } from './types';    

export const MAX_REPOS_CONFIG = 'repoLimit';
export const MIN_STARS_CONFIG = 'minStars';
export const MIN_SIZE_CONFIG = 'minSize';

export function highlightIfMatches(contents: number | string, toMatch: number | string, displayVal?: string): string {
  const matches = toMatch === contents;
  const display = displayVal || contents.toString();
  return matches ? highlight(display) : display;
}

export function highlight(display: string): string {
  return  `<span style="background-color: #F4D03F">${display}</span>`;
}
  
export  function getMaxVal(rows: RepoStats[], col: keyof RepoStats): number {
  return rows.reduce<number>((max, row) => {
    if (typeof row[col] != 'number') {
      throw new Error('Non-numerical type');
    }
    const num: number = row[col] as number;
    return num> max ? num : max
  }, 0);
}
