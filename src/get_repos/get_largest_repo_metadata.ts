import { Octokit } from '@octokit/rest';
import { getConfig } from '../config';
import { OctokitRepo, OctokitResponse } from '../types';

export async function getLargestRepoMetadata(
  client: Octokit,
  language: string
): Promise<Array<OctokitRepo>> {
  const config = getConfig();
  const minSize = config.minSize;
  const minStars = config.minStars;
  const maxRepos = config.maxRepos;

  console.log(
    `Finding largest repos for language ${language} over ${
      minSize / 1000
    } MB and having over ${minStars} stars.`
  );
  const response = (await client.search.repos({
    q: `language:${language.toLowerCase()} size:>=${minSize} stars:>=${minStars}`,
    sort: 'stars',
    order: 'desc',
    per_page: maxRepos,
    type: 'all',
  })) as unknown as OctokitResponse;

  console.log(`Found ${response.data.items.length} ${language} repositories `);
  console.log(
    response.data.items
      .map((items) => `${items.stargazers_count.toLocaleString()} -> ${items.full_name}`)
      .join('\n')
  );

  return response.data.items;
}
