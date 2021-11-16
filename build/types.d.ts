import { TEST_REPO } from './response.mock';
export interface RepoStats {
    name: string;
    url: string;
    repoSizeRaw: number;
    repoSize: string;
    tsLOC: number;
    jsLOC: number;
    totalLOC: number;
}
export interface ClocTypeStats {
    nFiles: number;
    code: number;
}
export interface ClocStats {
    SUM: ClocTypeStats;
    TypeScript?: ClocTypeStats;
    JavaScript?: ClocTypeStats;
}
export interface OctokitResponse {
    data: {
        items: Array<OctokitRepo>;
    };
}
export declare type OctokitRepo = typeof TEST_REPO;
