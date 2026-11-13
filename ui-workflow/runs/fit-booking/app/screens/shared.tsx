// 各屏共用：底部导航的内容、身份切换、课程这一行怎么排。
import {Bell, CalendarDays, ClipboardList, Ticket} from 'lucide-react';
import {Avatars, DateNum, Item, Meter, Segments, Stack, Status, Text} from '../../../../kit';
import type {Day, TabItem} from '../../../../kit';
import type {Klass, State} from '../data/seed';
import {STATUS_TEXT, STATUS_TONE, hh, person, shortBy, shortDate, statusOf, unread, weekOf, weekday} from '../logic/booking';
import type {Go} from '../App';

export type Props = {state: State; now: number; update: (fn: (s: State) => State) => void; go: Go};

export const tabsFor = (state: State): TabItem[] =>
  state.role === 'coach'
    ? [
        {id: 'home', label: '排课', icon: <CalendarDays size={20} aria-hidden />},
        {id: 'messages', label: '消息', icon: <Bell size={20} aria-hidden />, badge: unread(state, 'coach')},
      ]
    : [
        {id: 'home', label: '课程', icon: <ClipboardList size={20} aria-hidden />},
        {id: 'bookings', label: '我的预约', icon: <Ticket size={20} aria-hidden />},
        {id: 'messages', label: '消息', icon: <Bell size={20} aria-hidden />, badge: unread(state, 'student')},
      ];

export const RoleSwitch = ({state, update, go}: Pick<Props, 'state' | 'update' | 'go'>) => (
  <Segments
    label="切换身份"
    active={state.role}
    items={[
      {id: 'student', label: '学员'},
      {id: 'coach', label: '教练'},
    ]}
    onPick={(role) => (update((s) => ({...s, role: role as State['role']})), go('home'))}
  />
);

export const weekDays = (day: string, todayKey: string): Day[] =>
  weekOf(day).map((d) => ({id: d, week: weekday(d), day: String(Number(d.slice(8, 10))), past: d < todayKey, label: `${shortDate(d)} ${weekday(d)}`}));

/** 一节课在清单里的样子：时间在前，名称、内容、人数进度在中间，状态在后。 */
export function ClassItem({c, now, withDate, onPress}: {c: Klass; now: number; withDate?: boolean; onPress: () => void}) {
  const s = statusOf(c, now);
  const short = shortBy(c);
  return (
    <Item
      label={`${hh(c.hour)} ${c.title}，${STATUS_TEXT[s]}`}
      onPress={onPress}
      lead={
        <>
          <Text size="lg">{hh(c.hour)}</Text>
          {withDate ? (
            <Text tone="2" size="sm">
              <DateNum value={shortDate(c.date)} />
            </Text>
          ) : null}
        </>
      }
      title={c.title}
      sub={c.content || undefined}
      extra={
        <Stack gap={2}>
          <Meter value={c.booked.length} max={c.max} label="已约人数" tone={short > 0 ? 'warn' : undefined} />
          <Text tone="2" size="sm">
            已约 {c.booked.length} / {c.max} 人{short > 0 && s !== 'ended' ? ` · 还差 ${short} 人开课` : ''}
          </Text>
          {c.booked.length > 0 ? <Avatars people={c.booked.map(person)} /> : null}
        </Stack>
      }
      end={<Status tone={STATUS_TONE[s]}>{STATUS_TEXT[s]}</Status>}
    />
  );
}
