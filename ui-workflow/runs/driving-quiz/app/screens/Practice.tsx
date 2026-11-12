// 首页即题：打开就是下一道题，没有统计格子。题在上面读，答案是下面拇指够得着的几块路牌。
import {useState} from 'react';
import {CHAPTERS} from '../data/questions';
import {answer, doneIn, inChapter, nextChapter, nextIn} from '../logic/quiz';
import type {State} from '../logic/quiz';
import {Bar, Body, Btn, Chapters, Count, Enter, Grow, Hero, Plates, QuestionText, Screen, Stack, Sticker, Title, Why} from '../ui';
import type {PlateState, Tab} from '../ui';

export function Practice({state, update, onTab}: {state: State; update: (fn: (s: State) => State) => void; onTab: (t: Tab) => void}) {
  const chapter = state.chapter;
  // 答完后题目先留在屏上看解析，所以“当前题”在点“下一题”时才换
  const [current, setCurrent] = useState(() => nextIn(state, chapter));
  const [picked, setPicked] = useState<number | null>(null);

  const pickChapter = (id: string) => {
    update((s) => ({...s, chapter: id}));
    setCurrent(nextIn(state, id));
    setPicked(null);
  };
  const choose = (i: number) => {
    if (!current) return;
    setPicked(i);
    update((s) => answer(s, current.id, i === current.answer));
  };
  const next = () => {
    setCurrent(nextIn(state, chapter));
    setPicked(null);
  };

  const total = inChapter(chapter).length;
  const done = doneIn(state, chapter);
  const upNext = nextChapter(state);
  const states: PlateState[] = current ? current.options.map((_, i) => (picked === null ? 'idle' : i === current.answer ? 'right' : i === picked ? 'wrong' : 'dim')) : [];

  return (
    <Screen screen="practice" tab="practice" onTab={onTab}>
      {/* region: chapters */}
      <Stack gap={3}>
        <Chapters items={CHAPTERS.map((c) => ({...c, done: doneIn(state, c.id), total: inChapter(c.id).length}))} active={chapter} onPick={pickChapter} />
        <Bar value={done} max={total} label="本章进度" />
      </Stack>

      {current ? (
        <Enter id={current.id}>
          {/* region: question */}
          <Stack gap={3}>
            <Count>
              第 {picked === null ? done + 1 : done} / {total} 题
            </Count>
            <QuestionText>{current.text}</QuestionText>
          </Stack>
          <Grow />
          {/* region: answer */}
          <Stack gap={4}>
            {picked !== null ? <Why>{current.why}</Why> : null}
            <Plates options={current.options} states={states} onPick={picked === null ? choose : undefined} />
            {picked !== null ? <Btn onPress={next}>{done < total ? '下一题' : '完成本章'}</Btn> : null}
          </Stack>
        </Enter>
      ) : (
        <Enter id={`done-${chapter}`}>
          {/* region: chapter-done */}
          <Grow />
          <Hero>
            <Sticker name="trophy" size={96} />
            <Title>这一章做完了</Title>
            <Body>{upNext ? '答错的题已经放进错题本。接着做下一章，或者去模考试试。' : '全部章节都做完了。答错的题在错题本里，也可以去模考检验一下。'}</Body>
          </Hero>
          <Grow />
          {upNext ? <Btn onPress={() => pickChapter(upNext)}>去下一章</Btn> : <Btn onPress={() => onTab('mock')}>去模考</Btn>}
        </Enter>
      )}
    </Screen>
  );
}
