# repo-stats

[View a stats](https://stacey-gammon.github.io/repo-stats/ ) of some large TypeScript monorepos on GitHub.

Compare repository statistics. This tool outputs a csv file with repo statistics from TypeScript repositories in GitHub that are larger than 400MB and have more than 1,000 stars, as well as any repositories listed in `extraRepos` in the `config.json`.  

## Calculations

Cloc is used for LOC counting, however rather than using their `SUM.code` counts, as that includes a lot of not-actually-code, total LOC is counted by adding the set of languages in "languages" inside config.json

## Install dependencies

1. Install the git CLI globally. You'll need this to clone the repo locally in order to count LOC.
2. Install [cloc](https://github.com/AlDanial/cloc) globally.
3. Install yarn dependencies via `yarn install`.
4. 
##  Build

```
yarn build
```

or

```
yarn watch
```

To continuously build while making changes.

## Authentication

You can get away with using this without authentication for a short while, but to avoid getting rate-limited, set an environment variable called `GITHUB_OAUTH_TOKEN`.

```
export GITHUB_OAUTH_TOKEN=[token here]
```

## Configure

The following configuration settings are supported. These can be set inside the [`config.json`](./config.json) file, or passed via command line or environment variables.

```json
{
    "outputFolder": "docs", // Where the markdown or csv files will be saved to.
    "outType": "md", // Supports "md" or "csv"
    // When searching GitHub for interesting repositories, limit to repos that are larges than this
    // value (in KB).
    "minSize": 300000,

    // Limit GitHub repository search to repositories with this minimum number of stars.
    "minStars": 5000,

    // The maximum number of repositories to grab from GitHub APIs. This is _per language_. If this
    // number is larger than 100 it will have no effect. Keep in mind that these are very large
    // repositories and each one, _per language_, will be downloaded for analysis. The larger this
    // number is, and the more languages you have listed, the longer this will take! Due to caching,
    // follow-up requests will be faster, so you can start small and work your way up.
    "maxRepos": 30,
    
    // The top stats for each language listed will be calculated. These languages will
    // also be used to calculate totalLOC (rather than using cloc's built-in total LOC
    // counter).
    "languages": [
        "TypeScript",
        "JavaScript",
        "Java",
        "C++"
    ],
    // If interested in any specific repositories that may not show up in GitHub's response,
    // list them here, by language.
    "extraRepos": {
        "TypeScript": [
            { "owner": "babel", "repo": "babel" },
        ],
        "Java": [
            { "owner": "elastic", "repo": "elasticsearch" },
        ]
    },
    // List any repo's you want to ignore. This is a good place for repos that are large because
    // of static assets, not because of LOC. Don't bother downloading the repo locally.
    "skipRepos": [
      "owid/covid-19-data",
    ]
}
```

- clearCache

Run with `--clearCache` or set a variable in the config file to true if you would like to delete all cached information. By default the cache is never cleaned up. Cloning large repositories can take a very long time!

### languages

Set the list of languages that will count towards `totalLOC`. 

## outType

`md` or `csv`.

### extraRepos

A list of additional repos to include.

### skippedRepos

A list of repositories to skip. The following are included because they are large repositories without a lot of actual code:

- [owid/covid-19-data](https://github.com/owid/covid-19-data): Large because it contains a lot of CSV files filled with data.
- [be5invis/Iosevka](https://github.com/be5invis/Iosevka): A humongous repository that just includes fonts.

## Run

```
yarn stats
```
