// 刷题规则。纯函数，不碰界面和存储。对应 app-spec.json 的 rules。
import {CHAPTERS, QUESTIONS} from '../data/questions';
import type {Question} from '../data/questions';

export type Record = {correct: boolean};
export type MockResult = {score: number; total: number; passed: boolean; wrong: string[]};
export type State = {version: 1; done: {[id: string]: Record}; wrong: string[]; chapter: string; lastMock?: MockResult};

export const MOCK_SIZE = 10;
export const MOCK_SECONDS = 5 * 60;
export const PASS_RATE = 0.9;

export const empty = (): State => ({version: 1, done: {}, wrong: [], chapter: CHAPTERS[0].id});

export const inChapter = (chapter: string) => QUESTIONS.filter((q) => q.chapter === chapter);
export const doneIn = (s: State, chapter: string) => inChapter(chapter).filter((q) => s.done[q.id]).length;
/** 当前章节里下一道没做过的题；这一章做完了返回 undefined */
export const nextIn = (s: State, chapter: string): Question | undefined => inChapter(chapter).find((q) => !s.done[q.id]);
/** 下一个还有题没做的章节 */
export const nextChapter = (s: State) => CHAPTERS.find((c) => nextIn(s, c.id))?.id;

export function stats(s: State) {
  const all = Object.values(s.done);
  const right = all.filter((r) => r.correct).length;
  return {done: all.length, total: QUESTIONS.length, rate: all.length ? Math.round((right / all.length) * 100) : null, wrong: s.wrong.length};
}

/** 练习里答一道题：记入已做；答错进错题本 */
export function answer(s: State, id: string, correct: boolean): State {
  const wrong = correct ? s.wrong : s.wrong.includes(id) ? s.wrong : [...s.wrong, id];
  return {...s, done: {...s.done, [id]: {correct}}, wrong};
}
/** 错题本里重做：答对才移出，答错留着 */
export const redo = (s: State, id: string, correct: boolean): State => (correct ? {...s, wrong: s.wrong.filter((w) => w !== id)} : s);

/** 模考卷：每章轮流取题，顺序固定，方便核对 */
export function mockPaper(): Question[] {
  const paper: Question[] = [];
  for (let i = 0; paper.length < MOCK_SIZE; i++) {
    const q = inChapter(CHAPTERS[i % CHAPTERS.length].id)[Math.floor(i / CHAPTERS.length)];
    if (q) paper.push(q);
  }
  return paper;
}
/** 交卷：未作答算错；错的进错题本 */
export function submitMock(s: State, paper: Question[], picks: {[id: string]: number}): State {
  const wrongIds = paper.filter((q) => picks[q.id] !== q.answer).map((q) => q.id);
  const score = paper.length - wrongIds.length;
  const wrong = [...s.wrong, ...wrongIds.filter((w) => !s.wrong.includes(w))];
  return {...s, wrong, lastMock: {score, total: paper.length, passed: score / paper.length >= PASS_RATE, wrong: wrongIds}};
}
export const clock = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
