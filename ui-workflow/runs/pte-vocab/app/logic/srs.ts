// 学习规则。全部是不碰界面、不碰存储的纯函数，对应 app-spec.json 的 rules。
import type {Word} from '../data/words';

export type CardState = {box: number; due: string; lapses: number; learnedOn: string};
export type DayLog = {learned: number; reviewed: number; bonus: number};
export type State = {version: 1; cards: Record<string, CardState>; log: Record<string, DayLog>};

export const NEW_PER_DAY = 10;
export const BONUS_STEP = 10;
export const MAX_BOX = 6;
/** 下标是 box：box 1 → 1 天后，box 2 → 2 天后…… */
export const INTERVAL_DAYS = [0, 1, 2, 4, 7, 15, 30];
export const MASTERED_BOX = 4;

export const emptyState = (): State => ({version: 1, cards: {}, log: {}});

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => dayKey(new Date());
export function addDays(key: string, n: number) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}
export function daysBetween(from: string, to: string) {
  const t = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(to) - t(from)) / 86400000);
}

const logOf = (s: State, day: string): DayLog => s.log[day] ?? {learned: 0, reviewed: 0, bonus: 0};

export function dueReviews(s: State, words: Word[], day: string) {
  return words.filter((w) => s.cards[w.id] && s.cards[w.id].due <= day).map((w) => w.id);
}
export function newQuota(s: State, day: string) {
  const l = logOf(s, day);
  return Math.max(0, NEW_PER_DAY + l.bonus - l.learned);
}
export function newWords(s: State, words: Word[], day: string) {
  return words.filter((w) => !s.cards[w.id]).slice(0, newQuota(s, day)).map((w) => w.id);
}
export const unseenCount = (s: State, words: Word[]) => words.filter((w) => !s.cards[w.id]).length;
export const learnedCount = (s: State) => Object.keys(s.cards).length;
export const masteredCount = (s: State) => Object.values(s.cards).filter((c) => c.box >= MASTERED_BOX).length;
export const dueOn = (s: State, day: string) => Object.values(s.cards).filter((c) => c.due <= day).length;

/** 自评一次。firstTry=false 表示这个词本轮已经答错过，再答对只是放行，不再改熟练度。 */
export function grade(s: State, id: string, ok: boolean, firstTry: boolean, day: string): State {
  const card = s.cards[id];
  const log = {...logOf(s, day)};
  const cards = {...s.cards};
  if (!card) {
    if (!ok) return s; // 新词没记住：不入库，留在本轮队列里
    cards[id] = {box: 1, due: addDays(day, INTERVAL_DAYS[1]), lapses: firstTry ? 0 : 1, learnedOn: day};
    log.learned += 1;
  } else if (ok) {
    if (firstTry) {
      const box = Math.min(MAX_BOX, card.box + 1);
      cards[id] = {...card, box, due: addDays(day, INTERVAL_DAYS[box])};
    }
    log.reviewed += 1;
  } else if (firstTry) {
    cards[id] = {...card, box: 1, due: addDays(day, 1), lapses: card.lapses + 1};
  }
  return {...s, cards, log: {...s.log, [day]: log}};
}

export function addBonus(s: State, day: string): State {
  const log = logOf(s, day);
  return {...s, log: {...s.log, [day]: {...log, bonus: log.bonus + BONUS_STEP}}};
}

const active = (l?: DayLog) => !!l && l.learned + l.reviewed > 0;
export function streak(s: State, day: string) {
  let cursor = active(s.log[day]) ? day : addDays(day, -1);
  let n = 0;
  while (active(s.log[cursor])) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}
/** 本周一到周日，每天是否学过。 */
export function week(s: State, day: string) {
  const [y, m, d] = day.split('-').map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7; // 周一 = 0
  return ['一', '二', '三', '四', '五', '六', '日'].map((label, i) => {
    const key = addDays(day, i - dow);
    return {label, state: active(s.log[key]) ? ('done' as const) : key === day ? ('today' as const) : ('idle' as const)};
  });
}

export type Status = 'new' | 'learning' | 'mastered';
export const statusOf = (s: State, id: string): Status => (!s.cards[id] ? 'new' : s.cards[id].box >= MASTERED_BOX ? 'mastered' : 'learning');
