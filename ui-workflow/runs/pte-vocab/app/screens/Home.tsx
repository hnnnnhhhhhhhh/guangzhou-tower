// 首页：按 Astryx 的版式规则搭——一屏一个主角，其余用“最弱的容器”（标题 + 留白 + 分隔线），不摞卡片。
import {BookOpen} from 'lucide-react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';
import {VStack} from '@astryxdesign/core/VStack';
import {Deck, Screen, WeekDots} from '../../../../recipes';
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
          <Button label="开始学习" variant="primary" size="lg" width="100%" elevation="med" onClick={onStart} />
        ) : unseen > 0 ? (
          <Button label="再学 10 个" variant="secondary" size="lg" width="100%" elevation="low" onClick={learnMore} />
        ) : undefined
      }>
      <VStack gap={8}>
        {/* region: title —— 两行同字号，靠颜色分主次 */}
        <HStack hAlign="between" vAlign="start">
          <VStack gap={0}>
            <Text size="2xl" weight="medium" color="secondary">
              PTE 学术词汇
            </Text>
            <Heading level={1}>今天</Heading>
          </VStack>
          <IconButton label="词表" icon={<Icon icon={BookOpen} />} variant="ghost" size="lg" onClick={onWords} />
        </HStack>

        {/* region: today-task —— 这一屏唯一的卡片：一个可以独立拿走的东西，点它就开始 */}
        {todo > 0 ? (
          <Deck depth={todo > 2 ? 2 : todo - 1} cardKey="task">
            <ClickableCard label={`今日任务，${todo} 个词，开始学习`} elevation="low" padding={6} onClick={onStart}>
              <VStack gap={4}>
                <Text type="label" color="secondary">
                  今日任务
                </Text>
                <HStack gap={2} vAlign="end">
                  <Text type="display-1" weight="semibold" hasTabularNumbers>
                    {todo}
                  </Text>
                  <Text color="secondary">个词</Text>
                </HStack>
                <HStack gap={2}>
                  {reviews > 0 ? <Token label={`复习 ${reviews}`} color="blue" /> : null}
                  {fresh > 0 ? <Token label={`新词 ${fresh}`} color="yellow" /> : null}
                </HStack>
              </VStack>
            </ClickableCard>
          </Deck>
        ) : (
          <Card elevation="low" padding={6}>
            <VStack gap={2}>
              <Text type="label" color="secondary">
                今日任务
              </Text>
              <Heading level={2}>{allDone ? '全部学完' : '今天学完了'}</Heading>
              <Text color="secondary">{tomorrow > 0 ? `明天有 ${tomorrow} 个词等你复习。` : unseen > 0 ? '想多学一点，可以再加 10 个新词。' : '接下来按复习日期回来就好。'}</Text>
            </VStack>
          </Card>
        )}

        {/* region: streak —— 页面的一个区，不是独立对象：不用卡片 */}
        <VStack gap={4}>
          <HStack hAlign="between" vAlign="center">
            <Heading level={3}>本周打卡</Heading>
            <Text color="secondary">连续 {days} 天</Text>
          </HStack>
          <WeekDots days={week(state, day)} />
        </VStack>

        <Divider />

        {/* region: progress */}
        <VStack gap={4}>
          <HStack hAlign="between" vAlign="center">
            <Heading level={3}>累计进度</Heading>
            <Text color="secondary">已掌握 {masteredCount(state)}</Text>
          </HStack>
          <VStack gap={2}>
            <HStack gap={1} vAlign="end">
              <Text weight="semibold">{learned}</Text>
              <Text color="secondary">/ {WORDS.length} 词</Text>
            </HStack>
            <ProgressBar label="已学词数" isLabelHidden value={learned} max={WORDS.length} />
          </VStack>
        </VStack>
      </VStack>
    </Screen>
  );
}
