// 约课规则。纯函数。对应 app-spec.json 的 rules。
import {ME, PEOPLE, addDays, dayKey} from '../data/seed';
import type {Klass, State} from '../data/seed';

export const CUTOFF_HOURS = 2; // 开课前 2 小时截止预约
export const HOURS = Array.from({length: 14}, (_, i) => i + 8); // 可排课时段 08:00–21:00
export const REPEAT_WEEKS = 3; // “每周重复”往后再排 3 周
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;
export const startOf = (c: Klass) => {
  const [y, m, d] = c.date.split('-').map(Number);
  return new Date(y, m - 1, d, c.hour).getTime();
};
export const shortDate = (key: string) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;
export const weekday = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return `周${WEEK[new Date(y, m - 1, d).getDay()]}`;
};
/** 包含 day 的那一周，周一到周日 */
export function weekOf(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return Array.from({length: 7}, (_, i) => addDays(day, i - dow));
}
export const person = (id: string) => PEOPLE.find((p) => p.id === id) ?? PEOPLE[0];

export type Status = 'open' | 'full' | 'running' | 'ended';
export function statusOf(c: Klass, now: number): Status {
  const start = startOf(c);
  if (c.forced === 'ended' || now >= start + 3600_000) return 'ended';
  if (c.forced === 'running' || now >= start) return 'running';
  return c.booked.length >= c.max ? 'full' : 'open';
}
export const STATUS_TEXT: Record<Status, string> = {open: '可预约', full: '已约满', running: '在上课', ended: '已结束'};
export const STATUS_TONE: Record<Status, 'good' | 'warn' | 'plain'> = {open: 'good', full: 'warn', running: 'warn', ended: 'plain'};
export const shortBy = (c: Klass) => Math.max(0, c.min - c.booked.length);

/** 能不能约；不能时给出原因 */
export function bookable(c: Klass, now: number): {ok: boolean; why?: string} {
  const s = statusOf(c, now);
  if (c.booked.includes(ME)) return {ok: false, why: '你已经约了这节课'};
  if (s === 'ended') return {ok: false, why: '课程已结束'};
  if (s === 'running') return {ok: false, why: '课程已经开始'};
  if (s === 'full') return {ok: false, why: '名额已满'};
  if (now >= startOf(c) - CUTOFF_HOURS * 3600_000) return {ok: false, why: `开课前 ${CUTOFF_HOURS} 小时停止预约`};
  return {ok: true};
}
/** 过期清理：结束超过一天的课不再显示 */
export const visible = (s: State, today: string) => s.classes.filter((c) => c.date >= addDays(today, -1));
export const onDay = (s: State, day: string, query = '') => {
  const q = query.trim();
  return s.classes.filter((c) => c.date === day && (!q || c.title.includes(q) || c.content.includes(q))).sort((a, b) => a.hour - b.hour);
};
export const mine = (s: State, now: number) => s.classes.filter((c) => c.booked.includes(ME) && statusOf(c, now) !== 'ended').sort((a, b) => startOf(a) - startOf(b));
export const unread = (s: State, to: 'coach' | 'student') => s.messages.filter((m) => m.to === to && !m.read).length;

const when = (c: Klass) => `${shortDate(c.date)} ${hh(c.hour)}「${c.title}」`;
const notify = (s: State, to: 'coach' | 'student', text: string): State => ({...s, seq: s.seq + 1, messages: [{id: `m${s.seq + 1}`, to, text, read: false}, ...s.messages]});
const patch = (s: State, id: string, fn: (c: Klass) => Klass): State => ({...s, classes: s.classes.map((c) => (c.id === id ? fn(c) : c))});

export function book(s: State, id: string, now: number): State {
  const c = s.classes.find((x) => x.id === id);
  if (!c || !bookable(c, now).ok) return s;
  return notify(patch(s, id, (x) => ({...x, booked: [...x.booked, ME]})), 'coach', `学员 我 约了 ${when(c)}`);
}
export function cancel(s: State, id: string): State {
  const c = s.classes.find((x) => x.id === id);
  if (!c || !c.booked.includes(ME)) return s;
  return notify(patch(s, id, (x) => ({...x, booked: x.booked.filter((b) => b !== ME)})), 'coach', `学员 我 取消了 ${when(c)}`);
}
/** 教练点一个时段：没有课就生成一节等待预约的课；有课且没人约就撤掉；有人约了不能直接撤 */
export function toggleSlot(s: State, date: string, hour: number, repeat: boolean): State {
  const at = (d: string) => s.classes.find((c) => c.date === d && c.hour === hour);
  const existing = at(date);
  if (existing) return existing.booked.length ? s : {...s, classes: s.classes.filter((c) => c.id !== existing.id)};
  const dates = repeat ? Array.from({length: REPEAT_WEEKS + 1}, (_, i) => addDays(date, i * 7)) : [date];
  let seq = s.seq;
  const added: Klass[] = [];
  for (const d of dates) if (!at(d)) added.push({id: `c${++seq}`, date: d, hour, title: '私教课', content: '', min: 1, max: 4, booked: []});
  return {...s, seq, classes: [...s.classes, ...added]};
}
export const slotLocked = (s: State, date: string, hour: number) => !!s.classes.find((c) => c.date === date && c.hour === hour && c.booked.length > 0);
export type Draft = {title: string; content: string; min: number; max: number};
export const validDraft = (d: Draft, booked: number) => (!d.title.trim() ? '写上课程名称' : d.max < booked ? `已有 ${booked} 人预约，上限不能更小` : !(d.min >= 1 && d.max >= d.min) ? '人数下限至少 1，上限不能小于下限' : '');
export const update = (s: State, id: string, d: Draft): State => patch(s, id, (c) => ({...c, title: d.title.trim(), content: d.content.trim(), min: d.min, max: d.max}));
export const begin = (s: State, id: string): State => patch(s, id, (c) => ({...c, forced: 'running'}));
export const finish = (s: State, id: string): State => patch(s, id, (c) => ({...c, forced: 'ended'}));
/** 删除课程：已约的学员都会收到通知 */
export function remove(s: State, id: string): State {
  const c = s.classes.find((x) => x.id === id);
  if (!c) return s;
  const next = {...s, classes: s.classes.filter((x) => x.id !== id)};
  return c.booked.includes(ME) ? notify(next, 'student', `${when(c)} 被教练取消了`) : next;
}
export const readAll = (s: State, to: 'coach' | 'student'): State => ({...s, messages: s.messages.map((m) => (m.to === to ? {...m, read: true} : m))});
export const today = () => dayKey(new Date());
