import {MOCK_SECONDS, MOCK_SIZE, PASS_RATE} from '../logic/quiz';
import type {State} from '../logic/quiz';
import {Body, Btn, Facts, Grow, Hero, Note, Screen, Sticker, Title} from '../ui';
import type {Tab} from '../ui';

export function MockIntro({state, onTab, onStart}: {state: State; onTab: (t: Tab) => void; onStart: () => void}) {
  const last = state.lastMock;
  return (
    <Screen screen="mock" tab="mock" onTab={onTab}>
      {/* region: intro */}
      <Hero>
        <Sticker name="stopwatch" size={96} />
        <Title>模拟考试</Title>
        <Body>和考场一样：答题过程中不提示对错，交卷后才出成绩。</Body>
      </Hero>
      {/* region: rules */}
      <Facts
        items={[
          ['题量', `${MOCK_SIZE} 题`],
          ['时间', `${MOCK_SECONDS / 60} 分钟`],
          ['合格线', `${Math.ceil(MOCK_SIZE * PASS_RATE)} 题`],
          ['上次成绩', last ? `${last.score} / ${last.total} · ${last.passed ? '合格' : '未通过'}` : '还没考过'],
        ]}
      />
      <Note>真实考试是 100 题、45 分钟、90 分合格。这里是缩短的练习版。</Note>
      <Grow />
      <Btn onPress={onStart}>开始考试</Btn>
    </Screen>
  );
}
