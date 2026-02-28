import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  useMemo,
} from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  currentwordContextState,
  currentwordState,
  userwordsState,
} from '../../states/recoil-states';

import { Sentence } from './Paragraph-Sentence-Phrase';

import { stripPunctuation } from '../../utils/punctuation';
import { wordRegExp } from '../../utils/textParser';
import { countWordsInString, sentenceRegex } from '../../utils/textTokenizer';
import {
  WORD_WRAPPER_CLASSES,
  WORD_SPAN_CLASSES,
  NON_WORD_CLASSES,
} from './Word';
import textsService from '../../services/texts';
import getToken from '../../utils/getToken';
import host from '../../services/host';

const DEBOUNCE_SAVE_MS = 1000;
const DEBOUNCE_RESIZE_MS = 300;
const NAV_ZONE_FRACTION = 0.25;
const LINE_MARGIN_BUFFER = 16;
const LINE_TOP_TOLERANCE = 2;

type SentenceInfo = {
  paraIdx: number;
  text: string;
  wordCount: number;
  wordStartIndex: number;
  isLastInParagraph: boolean;
};

type VisibleSegment = {
  paraIdx: number;
  text: string;
  fullSentenceText: string;
  startWordIndex: number;
  isLastInParagraph: boolean;
};

function sliceSentenceByWords(
  text: string,
  fromLocalWord: number,
  toLocalWord: number
): string {
  const regex = new RegExp(wordRegExp.source, 'gui');
  let count = 0;
  let startCharIdx = 0;
  let endCharIdx = text.length;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (count === fromLocalWord) {
      startCharIdx = match.index;
    }
    if (count === toLocalWord) {
      endCharIdx = match.index;
      break;
    }
    count += 1;
  }

  return text.slice(startCharIdx, endCharIdx);
}

/**
 * Build a lightweight DOM tree for measurement — plain elements with the same
 * CSS classes as the real Word/Sentence components, but without React
 * reconciliation or Recoil lookups.
 */
function buildMeasurementDOM(
  allParagraphGroups: SentenceInfo[][]
): DocumentFragment {
  const tokenRegExp = new RegExp(
    `${wordRegExp.source}|[^\\p{Letter}\\p{Mark}'-]+`,
    'gui'
  );

  const fragment = document.createDocumentFragment();

  for (const group of allParagraphGroups) {
    const paraDiv = document.createElement('div');
    const lastSent = group[group.length - 1];
    if (lastSent.isLastInParagraph) {
      paraDiv.className = 'mb-3';
    }

    for (const sent of group) {
      const sentWrapper = document.createElement('div');
      sentWrapper.className = 'inline';

      const tokens = sent.text.match(tokenRegExp);
      if (tokens) {
        let wordIdx = sent.wordStartIndex;
        for (const token of tokens) {
          if (wordRegExp.test(token)) {
            // Reset lastIndex since wordRegExp has global flag
            wordRegExp.lastIndex = 0;

            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = WORD_WRAPPER_CLASSES;

            const span = document.createElement('span');
            span.className = WORD_SPAN_CLASSES;
            span.setAttribute('data-word-index', String(wordIdx));
            span.textContent = token;

            wrapperDiv.appendChild(span);
            sentWrapper.appendChild(wrapperDiv);
            wordIdx += 1;
          } else {
            const nonWordDiv = document.createElement('div');
            nonWordDiv.className = NON_WORD_CLASSES;
            nonWordDiv.textContent = token;
            sentWrapper.appendChild(nonWordDiv);
          }
        }
      }

      paraDiv.appendChild(sentWrapper);
    }

    fragment.appendChild(paraDiv);
  }

  return fragment;
}

const TextBody = function ({
  title,
  textBody,
  savedWordIndex,
  textId,
}: {
  title: string;
  textBody: string;
  savedWordIndex: number;
  textId: number;
}) {
  const [currentWord, setCurrentWord] = useAtom(currentwordState);
  const [userWords, setUserWords] = useAtom(userwordsState);
  const setCurrentWordContext = useSetAtom(currentwordContextState);

  // Build flat sentence list from paragraphs
  const { allSentences, totalWordCount } = useMemo(() => {
    const paragraphs = textBody.split('\n').filter(Boolean);
    const sentences: SentenceInfo[] = [];
    let wordIndex = 0;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx += 1) {
      const matches = paragraphs[pIdx].match(sentenceRegex) || [''];
      for (let sIdx = 0; sIdx < matches.length; sIdx += 1) {
        const text = matches[sIdx];
        const wc = countWordsInString(text);
        sentences.push({
          paraIdx: pIdx,
          text,
          wordCount: wc,
          wordStartIndex: wordIndex,
          isLastInParagraph: sIdx === matches.length - 1,
        });
        wordIndex += wc;
      }
    }

    return { allSentences: sentences, totalWordCount: wordIndex };
  }, [textBody]);

  // Pagination state
  const [pageBreaks, setPageBreaks] = useState<number[]>([0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);

  const measureRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save progress refs
  const pendingProgressRef = useRef<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = pageBreaks.length;

  // Group all sentences by paragraph (for measurement + visible content)
  const allParagraphGroups: SentenceInfo[][] = useMemo(() => {
    const groups: SentenceInfo[][] = [];
    for (let i = 0; i < allSentences.length; i += 1) {
      const sent = allSentences[i];
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup[0].paraIdx === sent.paraIdx) {
        lastGroup.push(sent);
      } else {
        groups.push([sent]);
      }
    }
    return groups;
  }, [allSentences]);

  // Measurement pass — word-level page breaks
  useLayoutEffect(() => {
    if (isMeasured) return;
    if (!measureRef.current || !contentRef.current || !containerRef.current)
      return;

    const measureEl = measureRef.current;
    const contentWidth = contentRef.current.clientWidth;
    measureEl.style.width = `${contentWidth}px`;

    // Build lightweight DOM for measurement (no React/Recoil overhead)
    const fragment = buildMeasurementDOM(allParagraphGroups);
    measureEl.appendChild(fragment);

    const availableHeight = contentRef.current.clientHeight;

    if (availableHeight <= 0) {
      measureEl.textContent = '';
      setPageBreaks([0]);
      setIsMeasured(true);
      return;
    }

    const wordEls = measureEl.querySelectorAll('[data-word-index]');

    if (wordEls.length === 0) {
      measureEl.textContent = '';
      setPageBreaks([0]);
      setIsMeasured(true);
      return;
    }

    const containerRect = measureEl.getBoundingClientRect();

    // Collect word positions sorted by word index
    const wordPositions: { wordIndex: number; top: number; bottom: number }[] =
      [];
    for (let i = 0; i < wordEls.length; i += 1) {
      const el = wordEls[i] as HTMLElement;
      const idx = parseInt(el.getAttribute('data-word-index') || '0', 10);
      const rect = el.getBoundingClientRect();
      wordPositions.push({
        wordIndex: idx,
        top: rect.top - containerRect.top,
        bottom: rect.bottom - containerRect.top,
      });
    }

    wordPositions.sort((a, b) => a.wordIndex - b.wordIndex);

    // Done reading positions — clear measurement DOM
    measureEl.textContent = '';

    // Group into lines by matching top values
    const lines: { top: number; bottom: number; firstWordIndex: number }[] = [];
    for (let i = 0; i < wordPositions.length; i += 1) {
      const wp = wordPositions[i];
      const lastLine = lines[lines.length - 1];
      if (lastLine && Math.abs(wp.top - lastLine.top) <= LINE_TOP_TOLERANCE) {
        if (wp.bottom > lastLine.bottom) {
          lastLine.bottom = wp.bottom;
        }
      } else {
        lines.push({
          top: wp.top,
          bottom: wp.bottom,
          firstWordIndex: wp.wordIndex,
        });
      }
    }

    // Walk lines to determine page breaks
    const effectiveHeight = Math.max(0, availableHeight - LINE_MARGIN_BUFFER);
    const breaks: number[] = [0];
    let pageStartTop = lines[0].top;
    let currentPageFirstWord = 0;

    for (let i = 0; i < lines.length; i += 1) {
      if (
        lines[i].bottom - pageStartTop > effectiveHeight &&
        lines[i].firstWordIndex > currentPageFirstWord
      ) {
        breaks.push(lines[i].firstWordIndex);
        pageStartTop = lines[i].top;
        currentPageFirstWord = lines[i].firstWordIndex;
      }
    }

    setPageBreaks(breaks);

    // Find the page that contains savedWordIndex (reverse scan for largest match)
    if (savedWordIndex > 0) {
      let targetPage = 0;
      for (let p = breaks.length - 1; p >= 0; p -= 1) {
        if (breaks[p] <= savedWordIndex) {
          targetPage = p;
          break;
        }
      }
      setCurrentPage(targetPage);
    } else if (currentPage >= breaks.length) {
      setCurrentPage(breaks.length - 1);
    }

    setIsMeasured(true);
  }, [isMeasured]);

  // Resize handler
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMeasured(false);
      }, DEBOUNCE_RESIZE_MS);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Save reading progress (debounced)
  const saveProgress = useCallback(
    (wordIndex: number) => {
      if (!textId) return; // demo mode
      pendingProgressRef.current = wordIndex;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        try {
          await textsService.saveReadingProgress(textId, wordIndex);
          pendingProgressRef.current = null;
        } catch {
          // Silently fail — will retry on next page change
        }
      }, DEBOUNCE_SAVE_MS);
    },
    [textId]
  );

  // Flush pending progress on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingProgressRef.current === null || !textId) return;

      const token = getToken();
      if (!token) return;

      fetch(`${host}/api/texts/${textId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify({
          pageStartWordIndex: pendingProgressRef.current,
        }),
        keepalive: true,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [textId]);

  // Page navigation
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      saveProgress(pageBreaks[page] ?? 0);
    },
    [pageBreaks, saveProgress]
  );

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        goToPage(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, goToPage]);

  // Build visible segments and group by paragraph for current page
  const paragraphGroups = useMemo(() => {
    const pageStartWord = pageBreaks[currentPage] ?? 0;
    const pageEndWord =
      currentPage + 1 < pageBreaks.length
        ? pageBreaks[currentPage + 1]
        : totalWordCount;

    const segments: VisibleSegment[] = [];
    for (let i = 0; i < allSentences.length; i += 1) {
      const sent = allSentences[i];
      const sentStart = sent.wordStartIndex;
      const sentEnd = sent.wordStartIndex + sent.wordCount;

      if (sentEnd > pageStartWord && sentStart < pageEndWord) {
        const visibleStart = Math.max(sentStart, pageStartWord);
        const visibleEnd = Math.min(sentEnd, pageEndWord);
        const isFull = visibleStart === sentStart && visibleEnd === sentEnd;

        const text = isFull
          ? sent.text
          : sliceSentenceByWords(
              sent.text,
              visibleStart - sentStart,
              visibleEnd - sentStart
            );

        segments.push({
          paraIdx: sent.paraIdx,
          text,
          fullSentenceText: sent.text,
          startWordIndex: visibleStart,
          isLastInParagraph: sent.isLastInParagraph && visibleEnd === sentEnd,
        });
      }
    }

    const groups: VisibleSegment[][] = [];
    for (let i = 0; i < segments.length; i += 1) {
      const seg = segments[i];
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup[0].paraIdx === seg.paraIdx) {
        lastGroup.push(seg);
      } else {
        groups.push([seg]);
      }
    }
    return groups;
  }, [pageBreaks, currentPage, allSentences, totalWordCount]);

  const isElement = function (
    element: Element | EventTarget
  ): element is Element {
    return (element as Element).nodeName !== undefined;
  };

  const removeUnusedWordOrGetPhrase = function (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    const {
      target,
      clientX,
    }: { target: Element | EventTarget; clientX: number } = event;
    if (
      !window.getSelection()?.toString() &&
      isElement(target) &&
      target.nodeName !== 'SPAN'
    ) {
      // Tap navigation: left 25% → prev, right 25% → next
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const relativeX = clientX - rect.left;
        if (relativeX < rect.width * NAV_ZONE_FRACTION && currentPage > 0) {
          goToPage(currentPage - 1);
          return;
        }
        if (
          relativeX > rect.width * (1 - NAV_ZONE_FRACTION) &&
          currentPage < totalPages - 1
        ) {
          goToPage(currentPage + 1);
          return;
        }
      }

      setCurrentWord(null);

      const updatedWords = [
        ...userWords.filter((wordObj) => wordObj.id !== undefined),
      ];
      setUserWords(updatedWords);
      setCurrentWordContext(null);
    } else if (
      isElement(target) &&
      target.nodeName === 'SPAN' &&
      target?.textContent
    ) {
      const text = target?.textContent?.split(' ').filter(Boolean);

      if (text.length > 1) {
        const current = userWords.filter((wordObj) => {
          if (target.textContent) {
            return (
              stripPunctuation(wordObj.word) ===
              stripPunctuation(target.textContent?.toLowerCase())
            );
          }
          return false;
        });
        if (current.length > 0) {
          setCurrentWord(current[0]);
        }
      }
    }

    window.getSelection()?.removeAllRanges();
  };

  return (
    <>
      <div
        onMouseUp={(event) => removeUnusedWordOrGetPhrase(event)}
        id="text-body-container"
        ref={containerRef}
        className={`flex flex-col h-full overflow-hidden container mx-auto prose max-w-none dark:prose-invert p-4 md:col-span-1 md:col-start-1 bg-tertiary px-4 py-5 shadow sm:rounded-lg sm:px-6 ${
          currentWord && window.innerWidth < 768
            ? 'blur-xs bg-gray-300 dark:bg-gray-600'
            : ''
        }`}
      >
        <h1 className="font-bold text-3xl mb-2">{title}</h1>

        {/* Off-screen measurement container — populated imperatively via buildMeasurementDOM */}
        <div
          ref={measureRef}
          aria-hidden="true"
          className="prose max-w-none dark:prose-invert"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        />

        {/* Visible paginated content — wrapped in relative container for chevrons */}
        <div className="relative flex-1 min-h-0">
          <div ref={contentRef} className="h-full overflow-hidden">
            {isMeasured &&
              paragraphGroups.map((group) => {
                const lastSeg = group[group.length - 1];
                const showParaMargin = lastSeg.isLastInParagraph;
                return (
                  <div
                    key={`pg-${group[0].paraIdx}-${group[0].startWordIndex}`}
                    className={showParaMargin ? 'mb-3' : ''}
                  >
                    {group.map((seg) => (
                      <div key={`s-${seg.startWordIndex}`} className="inline">
                        <Sentence
                          sentence={seg.text}
                          context={
                            seg.text !== seg.fullSentenceText
                              ? seg.fullSentenceText
                              : undefined
                          }
                          startWordIndex={seg.startWordIndex}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>

          {/* Mobile chevron hints */}
          {isMeasured && currentPage > 0 && (
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 flex items-center md:hidden">
              <span className="text-2xl text-gray-400 dark:text-gray-600 opacity-60 -ml-1">
                &#8249;
              </span>
            </div>
          )}
          {isMeasured && currentPage < totalPages - 1 && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center md:hidden">
              <span className="text-2xl text-gray-400 dark:text-gray-600 opacity-60 -mr-1">
                &#8250;
              </span>
            </div>
          )}
        </div>

        {/* Page indicator + desktop nav buttons */}
        <div className="flex items-center justify-center gap-3 pt-1 pb-0.5">
          {isMeasured && totalPages > 1 && (
            <button
              type="button"
              onMouseUp={(e) => {
                e.stopPropagation();
                if (currentPage > 0) goToPage(currentPage - 1);
              }}
              disabled={currentPage === 0}
              className="hidden md:inline-flex items-center justify-center w-7 h-7 rounded-sm text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              &#8249;
            </button>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {currentPage + 1} / {totalPages}
          </span>
          {isMeasured && totalPages > 1 && (
            <button
              type="button"
              onMouseUp={(e) => {
                e.stopPropagation();
                if (currentPage < totalPages - 1) goToPage(currentPage + 1);
              }}
              disabled={currentPage >= totalPages - 1}
              className="hidden md:inline-flex items-center justify-center w-7 h-7 rounded-sm text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              &#8250;
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default TextBody;
