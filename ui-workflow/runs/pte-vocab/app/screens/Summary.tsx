import {Btn, Chip, Item, Label, List, P, Screen, Sentence, SoftCard, Stack, TwoToneTitle} from '../../../../recipes';
import {WORD_BY_ID} from '../data/words';
import {addDays, dueOn, today} from '../logic/srs';
import type {State} from '../logic/srs';
import type {SessionResult} from './Study';

export function Summary({state, result, onHome}: {state: State; result: SessionResult; onHome: () => void}) {
  const rate = result.total ? Math.round((result.firstTry / result.total) * 100) : 0;
  const tomorrow = dueOn(state, addDays(today(), 1));
  return (
    <Screen screen="summary" dock={<Btn onPress={onHome}>回到首页</Btn>}>
      {/* region: title */}
      <TwoToneTitle eyebrow="本轮完成" title="做得不错" />

      {/* region: result */}
      <Sentence>
        {result.learned > 0 ? (
          <>
            你新学了
            <Chip kind="tint" hue="amber" size="lg">
              {result.learned} 个新词
            </Chip>
          </>
        ) : null}
        {result.learned > 0 && result.reviewed > 0 ? '，' : null}
        {result.reviewed > 0 ? (
          <>
            复习了
            <Chip kind="tint" hue="blue" size="lg">
              {result.reviewed} 个词
            </Chip>
          </>
        ) : null}
        ，一次记住
        <Chip kind="tint" hue="green" size="lg">
          {rate}%
        </Chip>
      </Sentence>

      {/* region: missed */}
      {result.missed.length > 0 ? (
        <SoftCard>
          <Label>这几个多看一眼</Label>
          <List>
            {result.missed.map((id) => (
              <Item key={id}>
                <Stack gap={1}>
                  <P weight="medium">{WORD_BY_ID[id].word}</P>
                  <P tone="2" size="sm">
                    {WORD_BY_ID[id].zh}
                  </P>
                </Stack>
              </Item>
            ))}
          </List>
        </SoftCard>
      ) : null}

      {/* region: next */}
      <SoftCard tone="sunk">
        <Label>接下来</Label>
        <P>{tomorrow > 0 ? `明天有 ${tomorrow} 个词到期复习，记得回来。` : '明天没有到期的复习。'}</P>
      </SoftCard>
    </Screen>
  );
}
