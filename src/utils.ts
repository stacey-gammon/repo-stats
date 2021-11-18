import { RepoStats } from './types';

export function highlightIfMatches(contents: number, toMatch: number, displayVal?: string): string {
  const matches = toMatch === contents;
  const display = displayVal || contents.toString();
  return matches ? `<span style="background-color: #F4D03F">${display}</span>` : display;
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
  