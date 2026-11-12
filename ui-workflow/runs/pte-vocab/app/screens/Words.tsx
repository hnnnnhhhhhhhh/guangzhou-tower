import {ArrowLeft} from 'lucide-react';
import {Chip, IconBtn, Item, List, P, Screen, SoftCard, Stack, TwoToneTitle} from '../../../../recipes';
import {WORDS} from '../data/words';
import {daysBetween, learnedCount, statusOf, today} from '../logic/srs';
import type {State} from '../logic/srs';

const due = (n: number) => (n <= 0 ? '今天复习' : n === 1 ? '明天复习' : `${n} 天后复习`);

export function Words({state, onBack}: {state: State; onBack: () => void}) {
  const day = today();
  return (
    <Screen screen="words">
      {/* region: title */}
      <TwoToneTitle
        eyebrow={`已学 ${learnedCount(state)} / ${WORDS.length}`}
        title="词表"
        end={
          <IconBtn label="返回" onPress={onBack}>
            <ArrowLeft size={20} aria-hidden />
          </IconBtn>
        }
      />

      {/* region: word-list */}
      <SoftCard>
        <List>
          {WORDS.map((w) => {
            const status = statusOf(state, w.id);
            const card = state.cards[w.id];
            return (
              <Item key={w.id}>
                <Stack gap={1}>
                  <P weight="medium">{w.word}</P>
                  <P tone="2" size="sm">
                    {w.zh}
                    {card ? ` · ${due(daysBetween(day, card.due))}` : ''}
                  </P>
                </Stack>
                {status === 'mastered' ? (
                  <Chip kind="tint" hue="green">
                    已掌握
                  </Chip>
                ) : status === 'learning' ? (
                  <Chip kind="tint" hue="amber">
                    学习中
                  </Chip>
                ) : (
                  <Chip>未学</Chip>
                )}
              </Item>
            );
          })}
        </List>
      </SoftCard>
    </Screen>
  );
}
