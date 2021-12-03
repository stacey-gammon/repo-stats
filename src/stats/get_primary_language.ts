import { ClocStats } from '../types';

/**
 * Out of all the languages in this repository, which has the highest LOC.
 */
export function getPrimaryLanguage(language: string, languages: string[], clocStats: ClocStats) {
  const { primaryLanguage } = languages.reduce(
    (currMax, lang) => {
      const cloc = clocStats[lang];
      if (!cloc) return currMax;
      return cloc.code > currMax.max ? { max: cloc.code, primaryLanguage: lang } : currMax;
    },
    { max: clocStats[language]?.code || 0, primaryLanguage: language }
  );
  return primaryLanguage;
}
