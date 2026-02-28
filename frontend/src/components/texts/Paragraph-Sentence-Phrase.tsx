import { atom, useAtomValue } from 'jotai';
import { markedwordsState } from '../../states/recoil-states';

import Word, { NON_WORD_CLASSES } from './Word';

import { stripPunctuation } from '../../utils/punctuation';
import { wordRegExp, parseText } from '../../utils/textParser';
import { countWordsInString } from '../../utils/textTokenizer';

const phrasesState = atom((get) =>
  Object.keys(get(markedwordsState)).filter((key) => key.match(/\S\s+\S/))
);

export const Phrase = function ({
  phrase,
  context,
  startWordIndex,
}: {
  phrase: string;
  context: string;
  startWordIndex: number;
}) {
  const markedWords = useAtomValue(markedwordsState);
  const phraseStatus = markedWords[stripPunctuation(phrase.toLowerCase())];

  let wordClass = '';
  if (phraseStatus === 'learning') {
    wordClass = 'bg-fuchsia-500/40 dark:bg-fuchsia-500/40';
  } else if (phraseStatus === 'familiar') {
    wordClass = 'bg-sky-400/40 dark:bg-sky-600/40';
  }

  const tokens = parseText(phrase);
  let wordIdx = startWordIndex;

  return (
    <>
      <div className="inline text-xl md:text-lg">
        <span
          className={`${wordClass} cursor-pointer -m-px border border-transparent betterhover:hover:border-zinc-500 hover:py-2.5 md:py-1.5 py-2 rounded-md`}
          data-type={'phrase'}
        >
          {tokens?.map((token, index) => {
            if (token.match(wordRegExp)) {
              const currentIdx = wordIdx;
              wordIdx += 1;
              return (
                <Word
                  key={index + token}
                  dataKey={index + token}
                  word={token}
                  context={context}
                  wordIndex={currentIdx}
                />
              );
            }

            return token;
          })}
        </span>
      </div>
    </>
  );
};

export const Sentence = function ({
  sentence,
  context,
  startWordIndex,
}: {
  sentence: string;
  context?: string;
  startWordIndex: number;
}) {
  const effectiveContext = context ?? sentence;
  const phrases = useAtomValue(phrasesState);
  const tokens = parseText(sentence, phrases);
  let wordIdx = startWordIndex;

  return (
    <>
      {tokens?.map((token, index) => {
        if (token.match(/\S\s+\S/)) {
          const phraseStart = wordIdx;
          wordIdx += countWordsInString(token);
          return (
            <Phrase
              key={index + token}
              phrase={token}
              context={effectiveContext}
              startWordIndex={phraseStart}
            />
          );
        }

        if (token.match(wordRegExp)) {
          const currentIdx = wordIdx;
          wordIdx += 1;
          return (
            <Word
              key={index + token}
              dataKey={index + token}
              word={token}
              context={effectiveContext}
              wordIndex={currentIdx}
            />
          );
        }

        return (
          <div key={index + token} className={NON_WORD_CLASSES}>
            {token}
          </div>
        );
      })}
    </>
  );
};
