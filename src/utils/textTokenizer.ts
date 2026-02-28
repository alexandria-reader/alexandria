import { wordRegExp } from './textParser';

export const sentenceRegex = /[^\s]([^!?.]|\.{3})*["!?.:;\s]*/gmu;

export function countWordsInString(text: string): number {
  const matches = text.match(wordRegExp);
  return matches ? matches.length : 0;
}
