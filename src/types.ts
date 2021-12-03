import { TEST_REPO } from './response.mock';
export interface RepoStats {
  name: string;
  url: string;
  repoSizeRaw: number;
  repoSize: string;
  totalLOC: number;
  monthlyCommitCount: number;
  monthlyCommitterCount: number;
  // This is kept separate from locLanguage and locCount because sometimes a repository that is very large and popular with multiple languages
  // will end up in the total column and the sub language column. In the total table, we want to show the primary language being the language
  // with the largest LOC count.
  primaryLOC: number;
  primaryLanguage: string;
  // When a specific language is requested, it's filled in here.
  locCount: number;
  locLanguage: string;
  starsCount: number;
  watchersCount: number;
}

export interface ClocTypeStats {
  nFiles: number;
  code: number;
}

export interface ClocStats {
  SUM: ClocTypeStats;
  TypeScript?: ClocTypeStats;
  JavaScript?: ClocTypeStats;
  [key: string]: ClocTypeStats | undefined;
}

export interface OctokitResponse {
  data: { items: Array<OctokitRepo> };
}

export type OctokitRepo = typeof TEST_REPO;

export interface ContributorStats {
  committersLastMonth: number;
}
