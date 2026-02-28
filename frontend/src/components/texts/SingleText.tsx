import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  userwordsState,
  currenttextState,
  userState,
} from '../../states/recoil-states';

import TranslationInput from './TranslationInput';
import TextBody from './TextBody';

import wordsService from '../../services/words';
import textsService from '../../services/texts';

import getToken from '../../utils/getToken';
import NotFound from '../NotFound';

import demoText from '../../utils/demoText';
import demoUserWords from '../../utils/demoWords';

const SingleText = function () {
  const [currentText, setCurrentText] = useAtom(currenttextState);
  const setUserWords = useSetAtom(userwordsState);
  const user = useAtomValue(userState);
  const params = useParams();
  const [error, setError] = useState('');
  const location = useLocation();

  const fetchUserwords = async function () {
    if (currentText && user) {
      const userWordsResponse = await wordsService.getUserwordsInText(
        String(currentText.id),
        user.knownLanguageId
      );
      setUserWords(userWordsResponse);
    }
  };

  const fetchTextAndUserwords = async function () {
    if (params.textId && getToken()) {
      try {
        const text = await textsService.getTextById(params.textId);
        setCurrentText(text);
        fetchUserwords();
      } catch (_e) {
        setError('error');
      }
    }
  };

  // Hide footer and lock body scroll while reading
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';
    return () => {
      document.body.style.overflow = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  useEffect(() => {
    if (currentText) {
      fetchUserwords();
    } else if (location.pathname === '/demo') {
      setUserWords(demoUserWords);
    } else {
      fetchTextAndUserwords();
    }
  }, [currentText, user]);

  if (currentText && Number(currentText.id) === Number(params.textId)) {
    return (
      <div
        key={`text-id:${currentText.id}outer`}
        className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-secondary mx-auto max-w-7xl lg:px-8"
      >
        <div className="flex-1 min-h-0 grid grid-rows-[1fr] grid-cols-1 md:grid-cols-[1fr_400px] md:gap-8 lg:grid-flow-col-dense">
          <TextBody
            key={`text-id:${currentText.id}unique`}
            title={currentText.title}
            textBody={currentText.body}
            savedWordIndex={currentText.pageStartWordIndex ?? 0}
            textId={Number(currentText.id)}
          />
          <div className="overflow-y-auto">
            <TranslationInput />
          </div>
        </div>
      </div>
    );
  }

  if (location.pathname === '/demo') {
    return (
      <main className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col mx-auto max-w-7xl lg:px-8">
        <div className="flex-1 min-h-0 bg-secondary">
          <div className="h-full grid grid-rows-[1fr] grid-cols-1 md:grid-cols-[1fr_400px] md:gap-8 lg:grid-flow-col-dense">
            <TextBody
              title={demoText.title}
              textBody={demoText.body}
              savedWordIndex={0}
              textId={0}
            />
            <div className="overflow-y-auto">
              <TranslationInput />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error === 'error') {
    return (
      <div className="Text-page">
        <NotFound />
      </div>
    );
  }

  return <div className="Text-page"></div>;
};

export default SingleText;
