// 错题本：还是“一道题 + 几块路牌”，答对了这道题才离开错题本。
import {useState} from 'react';
import {BY_ID} from '../data/questions';
import {redo} from '../logic/quiz';
import type {State} from '../logic/quiz';
import {Body, Btn, Count, Enter, Grow, Hero, Plates, QuestionText, Screen, Stack, Sticker, Title, Why} from '../ui';
import type {PlateState, Tab} from '../ui';

export function Mistakes({state, update, onTab}: {state: State; update: (fn: (s: State) => State) => void; onTab: (t: Tab) => void}) {
  const [currentId, setCurrentId] = useState<string | undefined>(state.wrong[0]);
  const [picked, setPicked] = useState<number | null>(null);
  const q = currentId ? BY_ID[currentId] : undefined;

  const choose = (i: number) => {
    if (!q) return;
    setPicked(i);
    update((s) => redo(s, q.id, i === q.answer));
  };
  const next = () => {
    // 答对的已经移出；答错的留在原位，轮到下一道
    const rest = state.wrong.filter((id) => id !== currentId);
    setCurrentId(rest[0] ?? state.wrong[0]);
    setPicked(null);
  };
  const states: PlateState[] = q ? q.options.map((_, i) => (picked === null ? 'idle' : i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim')) : [];

  return (
    <Screen screen="mistakes" tab="mistakes" onTab={onTab}>
      {q ? (
        <Enter id={`${q.id}-${state.wrong.length}-${picked === null}`}>
          {/* region: question */}
          <Stack gap={3}>
            <Count>错题本 · 还有 {state.wrong.length} 题待巩固</Count>
            <QuestionText>{q.text}</QuestionText>
          </Stack>
          <Grow />
          {/* region: answer */}
          <Stack gap={4}>
            {picked !== null ? <Why>{q.why}</Why> : null}
            <Plates options={q.options} states={states} onPick={picked === null ? choose : undefined} />
            {picked !== null ? <Btn onPress={next}>{state.wrong.length > 0 ? '下一题' : '完成'}</Btn> : null}
          </Stack>
        </Enter>
      ) : (
        <Enter id="empty">
          {/* region: empty */}
          <Grow />
          <Hero>
            <Sticker name="bullseye" size={96} />
            <Title>没有错题</Title>
            <Body>练习或模考里答错的题会出现在这里，答对一次才会离开。</Body>
          </Hero>
          <Grow />
          <Btn onPress={() => onTab('practice')}>去练习</Btn>
        </Enter>
      )}
    </Screen>
  );
}
