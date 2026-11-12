// 把一个“想去”排进某一天。
import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import type {Trip} from '../data/seed';
import {dayLabel, schedule, stopsOf, validTime} from '../logic/trip';
import {Days, Grow, Label, Note, Screen, Stack, Sub, Title} from '../ui';

export function Schedule({trip, update, id, onCancel, onDone}: {trip: Trip; update: (fn: (t: Trip) => Trip) => void; id: string; onCancel: () => void; onDone: (day: number) => void}) {
  const idea = trip.ideas.find((i) => i.id === id);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('14:00');
  const [tried, setTried] = useState(false);
  const ok = validTime(time);
  const save = () => {
    setTried(true);
    if (!ok) return;
    update((t) => schedule(t, id, day, time));
    onDone(day);
  };
  return (
    <Screen screen="schedule">
      <Stack gap={1}>
        <Title>{idea ? idea.name : '排进行程'}</Title>
        <Sub>{idea ? `${idea.votes.length} 人想去 · 排进哪一天？` : '这个地方已经被别人排进行程了'}</Sub>
      </Stack>
      {/* region: pick */}
      {idea ? (
        <Stack gap={5}>
          <Stack gap={2}>
            <Label>哪一天</Label>
            <Days items={Array.from({length: trip.days}, (_, i) => ({day: i + 1, ...dayLabel(trip, i + 1), count: stopsOf(trip, i + 1).length}))} active={day} onPick={setDay} />
            <Note>这一天已有 {stopsOf(trip, day).length} 站。</Note>
          </Stack>
          <Stack gap={2}>
            <TextInput label="时间" value={time} onChange={setTime} placeholder="14:00" size="lg" width="100%" />
            {tried && !ok ? <Note>时间写成 14:00 这样的格式。</Note> : null}
          </Stack>
        </Stack>
      ) : null}
      <Grow />
      <Stack gap={3}>
        {idea ? <Button label="排进去" variant="primary" size="lg" width="100%" onClick={save} /> : null}
        <Button label="取消" variant="ghost" size="lg" width="100%" onClick={onCancel} />
      </Stack>
    </Screen>
  );
}
