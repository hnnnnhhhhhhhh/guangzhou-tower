// 示例数据：一位自由教练一周的课。日期相对“今天”生成，所以任何一天打开，第一屏都有课。
import type {Person} from '../../../../kit';

export type Klass = {id: string; date: string; hour: number; title: string; content: string; min: number; max: number; booked: string[]; forced?: 'running' | 'ended'};
export type Message = {id: string; to: 'coach' | 'student'; text: string; read: boolean};
export type State = {version: 1; role: 'student' | 'coach'; classes: Klass[]; messages: Message[]; seq: number};

export const ME = 'me';
export const COACH = '周教练';
export const PEOPLE: Person[] = [
  {id: ME, name: '我', hue: 212},
  {id: 'lin', name: '小林', hue: 12},
  {id: 'may', name: '阿May', hue: 150},
  {id: 'liu', name: '大刘', hue: 40},
  {id: 'chen', name: '陈晨', hue: 280},
];
const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function addDays(key: string, n: number) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function seed(today: string): State {
  const k = (id: string, offset: number, hour: number, title: string, content: string, min: number, max: number, booked: string[]): Klass => ({id, date: addDays(today, offset), hour, title, content, min, max, booked});
  return {
    version: 1,
    role: 'student',
    seq: 100,
    classes: [
      k('c1', 0, 7, '晨间拉伸', '髋与肩的活动度，适合久坐人群', 2, 6, ['lin', 'may']),
      k('c2', 0, 12, '核心力量', '平板支撑进阶、死虫式、侧桥', 2, 6, ['lin', 'liu', 'chen']),
      k('c3', 0, 19, '全身循环训练', '壶铃摇摆、深蹲、划船，四组循环', 3, 6, ['may', 'liu', 'chen']),
      k('c4', 0, 20, '普拉提垫上', '基础十二式，注重呼吸与骨盆稳定', 3, 8, ['lin']),
      k('c5', 1, 10, '臀腿力量', '硬拉、箭步蹲、臀桥', 2, 4, ['lin', 'may', 'liu', 'chen']),
      k('c6', 1, 19, '核心力量', '平板支撑进阶、死虫式、侧桥', 2, 6, [ME, 'may']),
      k('c7', 2, 19, '全身循环训练', '壶铃摇摆、深蹲、划船，四组循环', 3, 6, []),
    ],
    messages: [{id: 'm1', to: 'student', text: `${COACH} 发布了本周的课程`, read: false}],
  };
}
