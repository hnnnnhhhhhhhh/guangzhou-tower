import {useMemo, useState} from 'react';
import {Volume2, X} from 'lucide-react';
import {Btn, BtnRow, Chip, Chips, Deck, Divider, Fill, IconBtn, Meter, P, Reveal, Row, Screen, SoftCard, Stack, Word} from '../../../../recipes';
import {WORD_BY_ID, WORDS} from '../data/words';
import {dueReviews, grade, newWords, today} from '../logic/srs';
import type {State} from '../logic/srs';

export type SessionResult = {learned: number; reviewed: number; total: number; firstTry: number; missed: string[]};

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function Study({state, update, onQuit, onDone}: {state: State; update: (fn: (s: State) => State) => void; onQuit: () => void; onDone: (r: SessionResult) => void}) {
  const day = today();
  // 进入时定下本轮的队列：先复习，后新词
  const plan = useMemo(() => {
    const reviews = dueReviews(state, WORDS, day);
    return {reviews: new Set(reviews), all: [...reviews, ...newWords(state, WORDS, day)]};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [queue, setQueue] = useState<string[]>(plan.all);
  const [missed, setMissed] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [turn, setTurn] = useState(0);

  const total = plan.all.length;
  const id = queue[0];
  const word = id ? WORD_BY_ID[id] : undefined;
  const passed = total - queue.length;
  const isReview = id ? plan.reviews.has(id) : false;

  if (!word) {
    // 没有可学的词（比如直接进到这屏）：给一条出路，而不是空白
    return (
      <Screen screen="study" dock={<Btn onPress={onQuit}>回到首页</Btn>}>
        <P size="lg">今天没有要学的词了。</P>
      </Screen>
    );
  }

  const answer = (ok: boolean) => {
    const firstTry = !missed.includes(id);
    update((s) => grade(s, id, ok, firstTry, day));
    const nextMissed = ok || !firstTry ? missed : [...missed, id];
    const nextQueue = ok ? queue.slice(1) : [...queue.slice(1), id];
    setMissed(nextMissed);
    setRevealed(false);
    setTurn((t) => t + 1);
    if (nextQueue.length === 0) {
      const reviewed = plan.all.filter((w) => plan.reviews.has(w)).length;
      onDone({learned: total - reviewed, reviewed, total, firstTry: total - nextMissed.length, missed: nextMissed});
      return;
    }
    setQueue(nextQueue);
  };

  return (
    <Screen
      screen="study"
      dock={
        revealed ? (
          <BtnRow>
            <Btn kind="tint" hue="rose" onPress={() => answer(false)}>
              没记住
            </Btn>
            <Btn kind="tint" hue="green" onPress={() => answer(true)}>
              记住了
            </Btn>
          </BtnRow>
        ) : (
          <Btn kind="soft" onPress={() => setRevealed(true)}>
            看答案
          </Btn>
        )
      }>
      {/* region: session-bar */}
      <Stack gap={4}>
        <Row>
          <IconBtn label="退出本轮" onPress={onQuit}>
            <X size={20} aria-hidden />
          </IconBtn>
          <Chip kind="bubble" size="lg">
            {passed} / {total}
          </Chip>
        </Row>
        <Meter value={passed} max={total} label="本轮进度" />
      </Stack>

      {/* region: card */}
      <Deck depth={queue.length - 1} cardKey={`${id}-${turn}`}>
        <SoftCard pad="lg" tall>
          <Row>
            <Chips>
              <Chip kind="dashed" hue={isReview ? 'blue' : 'amber'}>
                {isReview ? '复习' : '新词'}
              </Chip>
              <Chip>{word.pos}</Chip>
            </Chips>
            <IconBtn label={`朗读 ${word.word}`} onPress={() => speak(word.word)}>
              <Volume2 size={20} aria-hidden />
            </IconBtn>
          </Row>
          <Fill>
            <Word>{word.word}</Word>
            {revealed ? (
              <Reveal>
                <Divider />
                <P size="lg" weight="medium">
                  {word.zh}
                </P>
                <Stack gap={1}>
                  <P>{word.example}</P>
                  <P tone="2" size="sm">
                    {word.exampleZh}
                  </P>
                </Stack>
              </Reveal>
            ) : (
              <P tone="2">先在心里想一想它的意思，再看答案。</P>
            )}
          </Fill>
        </SoftCard>
      </Deck>
    </Screen>
  );
}
