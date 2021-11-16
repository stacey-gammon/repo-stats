import { Octokit } from "@octokit/rest";
import { RepoStats } from "./types";
export declare function getRepoStats(client: Octokit, extraRepos: Array<{
    owner: string;
    repo: string;
}>): Promise<{
    [key: string]: RepoStats;
}>;
