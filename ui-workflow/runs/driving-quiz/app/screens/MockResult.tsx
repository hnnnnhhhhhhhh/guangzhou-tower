import {BY_ID} from '../data/questions';
import type {State} from '../logic/quiz';
import {Btn, Count, Grow, Item, List, Note, Row, Score, Screen, Stack, Stamp} from '../ui';

export function MockResult({state, onMistakes, onBack}: {state: State; onMistakes: () => void; onBack: () => void}) {
  const r = state.lastMock;
  if (!r) {
    return (
      <Screen screen="mock-result" tone="paper">
        <Note>还没有考试成绩。</Note>
        <Grow />
        <Btn onPress={onBack}>
          返回
        </Btn>
      </Screen>
    );
  }
  return (
    <Screen screen="mock-result" tone="paper">
      {/* region: score */}
      <Stack gap={3}>
        <Count>本次成绩</Count>
        <Row>
          <Score score={r.score} total={r.total} />
          <Stamp pass={r.passed} />
        </Row>
      </Stack>
      {/* region: wrong-list */}
      {r.wrong.length > 0 ? (
        <Stack gap={2}>
          <Count>答错的 {r.wrong.length} 题，已放进错题本</Count>
          <List>
            {r.wrong.map((id) => (
              <Item key={id} title={BY_ID[id].text} sub={`正确答案：${BY_ID[id].options[BY_ID[id].answer]}`} />
            ))}
          </List>
        </Stack>
      ) : (
        <Note>全部答对，没有新的错题。</Note>
      )}
      <Grow />
      <Stack gap={3}>
        {r.wrong.length > 0 ? (
          <Btn onPress={onMistakes}>
            去错题本重做
          </Btn>
        ) : null}
        <Btn kind="quiet" onPress={onBack}>
          返回
        </Btn>
      </Stack>
    </Screen>
  );
}
