// 安静的答卷：白纸、细线、单选行。和真实考场一样，过程中不提示对错。
import {useEffect, useMemo, useState} from 'react';
import {MOCK_SECONDS, clock, mockPaper, submitMock} from '../logic/quiz';
import type {State} from '../logic/quiz';
import {Bar, Btn, LinkBtn, Options, QuestionText, Row, Screen, SheetHead, SheetNav, Stack} from '../ui';

export function Mock({update, onQuit, onDone}: {update: (fn: (s: State) => State) => void; onQuit: () => void; onDone: () => void}) {
  const paper = useMemo(mockPaper, []);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<{[id: string]: number}>({});
  const [left, setLeft] = useState(MOCK_SECONDS);

  const submit = () => {
    update((s) => submitMock(s, paper, picks));
    onDone();
  };
  useEffect(() => {
    if (left <= 0) {
      submit(); // 时间到自动交卷
      return;
    }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const q = paper[index];
  const last = index === paper.length - 1;
  return (
    <Screen
      screen="mock-run"
      tone="paper"
      footer={
        <SheetNav>
          <Btn kind="quiet" onPress={() => setIndex((i) => Math.max(0, i - 1))}>
            上一题
          </Btn>
          {last ? (
            <Btn onPress={submit}>
              交卷
            </Btn>
          ) : (
            <Btn onPress={() => setIndex((i) => i + 1)}>
              下一题
            </Btn>
          )}
        </SheetNav>
      }>
      {/* region: sheet-head */}
      <Stack gap={3}>
        <SheetHead left={`第 ${index + 1} / ${paper.length} 题`} timer={clock(left)} />
        <Bar value={Object.keys(picks).length} max={paper.length} label="已作答题数" />
      </Stack>
      {/* region: sheet-question */}
      <QuestionText size="title">{q.text}</QuestionText>
      <Options options={q.options} picked={picks[q.id]} onPick={(i) => setPicks((p) => ({...p, [q.id]: i}))} />
      <Row>
        <LinkBtn onPress={onQuit}>放弃本次考试</LinkBtn>
      </Row>
    </Screen>
  );
}
