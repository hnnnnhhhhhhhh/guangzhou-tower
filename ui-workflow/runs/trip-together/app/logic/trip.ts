// 行程规则。纯函数。每个改动都会记一条“谁做了什么”，这是多人协作时别人看到的东西。
import type {Idea, Kind, Stop, Trip} from '../data/seed';

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
export function dayLabel(t: Trip, day: number) {
  const [y, m, d] = t.start.split('-').map(Number);
  const date = new Date(y, m - 1, d + day - 1);
  return {short: `${date.getMonth() + 1}/${date.getDate()}`, week: `周${WEEK[date.getDay()]}`};
}
export const range = (t: Trip) => `${dayLabel(t, 1).short} – ${dayLabel(t, t.days).short} · ${t.days} 天`;
export const stopsOf = (t: Trip, day: number) => t.stops.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
export const member = (t: Trip, id: string) => t.members.find((m) => m.id === id) ?? t.members[0];
export const validTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
/** 想去的地方按票数排，票数相同按加入先后 */
export const rankedIdeas = (t: Trip) => [...t.ideas].sort((a, b) => b.votes.length - a.votes.length);

const logged = (t: Trip, text: string): Trip => ({...t, log: [{who: t.me, text}, ...t.log].slice(0, 20)});
const nextId = (t: Trip, p: string): [string, number] => [`${p}${t.seq + 1}`, t.seq + 1];

export type StopDraft = {day: number; time: string; name: string; note: string; kind: Kind};
export function addStop(t: Trip, d: StopDraft): Trip {
  const [id, seq] = nextId(t, 's');
  const stop: Stop = {...d, name: d.name.trim(), note: d.note.trim(), id, by: t.me};
  return logged({...t, seq, stops: [...t.stops, stop]}, `把「${stop.name}」加到了第 ${d.day} 天`);
}
export function updateStop(t: Trip, id: string, d: StopDraft): Trip {
  return logged({...t, stops: t.stops.map((s) => (s.id === id ? {...s, ...d, name: d.name.trim(), note: d.note.trim()} : s))}, `改了「${d.name.trim()}」`);
}
export function removeStop(t: Trip, id: string): Trip {
  const s = t.stops.find((x) => x.id === id);
  return s ? logged({...t, stops: t.stops.filter((x) => x.id !== id)}, `删掉了「${s.name}」`) : t;
}
export function addIdea(t: Trip, d: {name: string; note: string; kind: Kind}): Trip {
  const [id, seq] = nextId(t, 'i');
  const idea: Idea = {id, name: d.name.trim(), note: d.note.trim(), kind: d.kind, by: t.me, votes: [t.me]};
  return logged({...t, seq, ideas: [...t.ideas, idea]}, `想去「${idea.name}」`);
}
/** 投票是开关：再点一次取消 */
export function toggleVote(t: Trip, id: string): Trip {
  const idea = t.ideas.find((i) => i.id === id);
  if (!idea) return t;
  const on = idea.votes.includes(t.me);
  const next = {...t, ideas: t.ideas.map((i) => (i.id === id ? {...i, votes: on ? i.votes.filter((v) => v !== t.me) : [...i.votes, t.me]} : i))};
  return on ? next : logged(next, `也想去「${idea.name}」`);
}
/** 把一个“想去”排进某天：它离开想去清单，变成行程里的一站 */
export function schedule(t: Trip, id: string, day: number, time: string): Trip {
  const idea = t.ideas.find((i) => i.id === id);
  if (!idea) return t;
  const [sid, seq] = nextId(t, 's');
  const stop: Stop = {id: sid, day, time, name: idea.name, note: idea.note, kind: idea.kind, by: idea.by};
  return logged({...t, seq, ideas: t.ideas.filter((i) => i.id !== id), stops: [...t.stops, stop]}, `把「${idea.name}」排进了第 ${day} 天`);
}
export const setMe = (t: Trip, id: string): Trip => ({...t, me: id});
