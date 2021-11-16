# repo-stats

Compare repository statistics. This tool outputs a csv file with repo statistics from TypeScript repositories in GitHub that are larger than 400MB and have more than 1,000 stars, as well as any repositories listed in `extraRepos` in the `config.json`.  

## Install dependencies

1. Install the git CLI globally. You'll need this to clone the repo locally in order to count LOC.
2. Install [cloc](https://github.com/AlDanial/cloc) globally.
3. Install yarn dependencies via `yarn install`.
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

## Run

```
yarn stats
```
