import { TEST_REPO } from './response.mock';
export interface RepoStats {
 name: string;
 url: string;
 repoSizeRaw: number;
 repoSize: string;
 primaryLOC: number;
 totalLOC: number;
 monthlyCommitCount: number;
 monthlyCommitterCount: number;
 primaryLanguage: string;
}

export interface ClocTypeStats {
    nFiles: number;
    code: number;
}

export interface ClocStats {
  SUM: ClocTypeStats
  TypeScript?: ClocTypeStats
  JavaScript?: ClocTypeStats
  [key: string]: ClocTypeStats | undefined 
}

export interface OctokitResponse {
  data: { items: Array<OctokitRepo> }
}

export type OctokitRepo = typeof TEST_REPO;

export interface ContributorStats {
  committersLastMonth: number;
}