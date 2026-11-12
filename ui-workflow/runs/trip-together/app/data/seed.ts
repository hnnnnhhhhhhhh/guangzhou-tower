// 示例行程：京都四日。地点是真实地名，时间和备注是为演示编写的。
import type {StickerName} from '../stickers';

export type Kind = 'sight' | 'food' | 'shop' | 'stay';
export const KINDS: {id: Kind; name: string; sticker: StickerName}[] = [
  {id: 'sight', name: '景点', sticker: 'shinto-shrine'},
  {id: 'food', name: '吃', sticker: 'steaming-bowl'},
  {id: 'shop', name: '逛', sticker: 'shopping-bags'},
  {id: 'stay', name: '住', sticker: 'bed'},
];
export type Member = {id: string; name: string; hue: number};
export type Stop = {id: string; day: number; time: string; name: string; note: string; kind: Kind; by: string};
export type Idea = {id: string; name: string; note: string; kind: Kind; by: string; votes: string[]};
export type LogEntry = {who: string; text: string};
export type Trip = {version: 1; name: string; start: string; days: number; members: Member[]; me: string; stops: Stop[]; ideas: Idea[]; log: LogEntry[]; seq: number};

export const seed = (): Trip => ({
  version: 1,
  name: '京都四日',
  start: '2026-11-20',
  days: 4,
  me: 'zhou',
  members: [
    {id: 'zhou', name: '小周', hue: 212},
    {id: 'lin', name: '小林', hue: 12},
    {id: 'may', name: '阿May', hue: 150},
    {id: 'liu', name: '大刘', hue: 40},
  ],
  stops: [
    {id: 's1', day: 1, time: '10:00', name: '伏见稻荷大社', note: '千本鸟居走到四辻就折返，全程约两小时', kind: 'sight', by: 'zhou'},
    {id: 's2', day: 1, time: '15:00', name: '清水寺', note: '傍晚去，顺路走二年坂、三年坂', kind: 'sight', by: 'lin'},
    {id: 's3', day: 1, time: '19:00', name: '祇园花见小路', note: '', kind: 'sight', by: 'may'},
    {id: 's4', day: 2, time: '09:00', name: '岚山竹林小径', note: '早点到，人少', kind: 'sight', by: 'zhou'},
    {id: 's5', day: 2, time: '12:30', name: '岚山 汤豆腐', note: '需要提前订位', kind: 'food', by: 'liu'},
  ],
  ideas: [
    {id: 'i1', name: '锦市场', note: '京都的厨房，边走边吃', kind: 'food', by: 'may', votes: ['may', 'lin']},
    {id: 'i2', name: '金阁寺', note: '', kind: 'sight', by: 'liu', votes: ['liu']},
    {id: 'i3', name: '哲学之道', note: '红叶季值得一走，约两公里', kind: 'sight', by: 'lin', votes: ['lin', 'liu', 'may']},
  ],
  log: [{who: 'lin', text: '想去「哲学之道」'}],
  seq: 100,
});
