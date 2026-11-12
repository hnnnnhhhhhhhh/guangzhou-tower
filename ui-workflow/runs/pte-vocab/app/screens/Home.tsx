import {ArrowRight, BookOpen} from 'lucide-react';
import {Big, Btn, Chip, Chips, Deck, IconBtn, Label, Meter, P, Row, Screen, SoftCard, Stack, TwoToneTitle, WeekDots} from '../../../../recipes';
import {WORDS} from '../data/words';
import {addBonus, addDays, dueOn, dueReviews, learnedCount, masteredCount, newWords, streak, today, unseenCount, week} from '../logic/srs';
import type {State} from '../logic/srs';

export function Home({state, update, onStart, onWords}: {state: State; update: (fn: (s: State) => State) => void; onStart: () => void; onWords: () => void}) {
  const day = today();
  const reviews = dueReviews(state, WORDS, day).length;
  const fresh = newWords(state, WORDS, day).length;
  const todo = reviews + fresh;
  const unseen = unseenCount(state, WORDS);
  const learned = learnedCount(state);
  const tomorrow = dueOn(state, addDays(day, 1));
  const days = streak(state, day);
  const allDone = todo === 0 && unseen === 0 && tomorrow === 0 && learned > 0;

  const learnMore = () => {
    update((s) => addBonus(s, day));
    onStart();
  };

  return (
    <Screen
      screen="home"
      dock={
        todo > 0 ? (
          <Btn onPress={onStart}>
            开始学习 <ArrowRight size={20} aria-hidden />
          </Btn>
        ) : unseen > 0 ? (
          <Btn kind="soft" onPress={learnMore}>
            再学 10 个
          </Btn>
        ) : undefined
      }>
      {/* region: title */}
      <TwoToneTitle
        eyebrow="PTE 学术词汇"
        title="今天"
        end={
          <IconBtn label="词表" onPress={onWords}>
            <BookOpen size={20} aria-hidden />
          </IconBtn>
        }
      />

      {/* region: today-task */}
      {todo > 0 ? (
        <Deck depth={todo > 2 ? 2 : todo - 1} cardKey="task">
          <SoftCard onPress={onStart} label={`今日任务，${todo} 个词，开始学习`}>
            <Label>今日任务</Label>
            <Big value={todo} unit="个词" />
            <Chips>
              {reviews > 0 ? (
                <Chip kind="dashed" hue="blue">
                  复习 {reviews}
                </Chip>
              ) : null}
              {fresh > 0 ? (
                <Chip kind="dashed" hue="amber">
                  新词 {fresh}
                </Chip>
              ) : null}
            </Chips>
          </SoftCard>
        </Deck>
      ) : (
        <SoftCard>
          <Label>今日任务</Label>
          <Big size="title" value={allDone ? '全部学完' : '今天学完了'} />
          <P tone="2">{tomorrow > 0 ? `明天有 ${tomorrow} 个词等你复习。` : unseen > 0 ? '想多学一点，可以再加 10 个新词。' : '接下来按复习日期回来就好。'}</P>
        </SoftCard>
      )}

      {/* region: streak */}
      <SoftCard>
        <Row>
          <Label>本周打卡</Label>
          <Chip kind={days > 0 ? 'tint' : 'soft'} hue="amber">
            连续 {days} 天
          </Chip>
        </Row>
        <WeekDots days={week(state, day)} />
      </SoftCard>

      {/* region: progress */}
      <SoftCard>
        <Row>
          <Label>累计进度</Label>
          <P tone="2" size="sm">
            已掌握 {masteredCount(state)}
          </P>
        </Row>
        <Stack gap={3}>
          <Big value={learned} unit={`/ ${WORDS.length} 词`} />
          <Meter value={learned} max={WORDS.length} label="已学词数" />
        </Stack>
      </SoftCard>
    </Screen>
  );
}
