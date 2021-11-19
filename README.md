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


## Configure

Edit `config.json` if you'd like to change the output directory, or add additional repositories.

### clearCache

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
