// 新增或修改一站；也用来新增一个“想去”（那时不需要选日期和时间）。
import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {KINDS} from '../data/seed';
import type {Kind, Trip} from '../data/seed';
import {addIdea, addStop, dayLabel, removeStop, updateStop, validTime} from '../logic/trip';
import {Days, Grow, Kinds, Label, Note, Screen, Stack, Title} from '../ui';

export function StopEditor({trip, update, mode, id, day, time, onDone}: {trip: Trip; update: (fn: (t: Trip) => Trip) => void; mode: 'stop' | 'idea'; id?: string; day: number; time?: string; onDone: (day?: number) => void}) {
  const editing = id ? trip.stops.find((s) => s.id === id) : undefined;
  const [name, setName] = useState(editing?.name ?? '');
  const [note, setNote] = useState(editing?.note ?? '');
  const [kind, setKind] = useState<Kind>(editing?.kind ?? 'sight');
  const [when, setWhen] = useState(editing?.time ?? time ?? '10:00');
  const [onDay, setOnDay] = useState(editing?.day ?? day);
  const [tried, setTried] = useState(false);

  const nameOk = name.trim().length > 0;
  const timeOk = mode === 'idea' || validTime(when);
  const save = () => {
    setTried(true);
    if (!nameOk || !timeOk) return;
    if (mode === 'idea') update((t) => addIdea(t, {name, note, kind}));
    else if (editing) update((t) => updateStop(t, editing.id, {day: onDay, time: when, name, note, kind}));
    else update((t) => addStop(t, {day: onDay, time: when, name, note, kind}));
    onDone(onDay);
  };
  const remove = () => {
    if (editing) update((t) => removeStop(t, editing.id));
    onDone(onDay);
  };

  const body = (
    <>
      <Title>{mode === 'idea' ? '想去哪儿' : editing ? '修改这一站' : '加一站'}</Title>
      {/* region: form */}
      <Stack gap={5}>
        <Stack gap={2}>
          <TextInput label="地点" value={name} onChange={setName} placeholder="比如 锦市场" size="lg" width="100%" />
          {tried && !nameOk ? <Note>先写上地点的名字。</Note> : null}
        </Stack>
        <Stack gap={2}>
          <Label>类型</Label>
          <Kinds items={KINDS} active={kind} onPick={(k) => setKind(k as Kind)} />
        </Stack>
        {mode === 'stop' ? (
          <>
            <Stack gap={2}>
              <Label>哪一天</Label>
              <Days items={Array.from({length: trip.days}, (_, i) => ({day: i + 1, ...dayLabel(trip, i + 1), count: 0}))} active={onDay} onPick={setOnDay} />
            </Stack>
            <Stack gap={2}>
              <TextInput label="时间" value={when} onChange={setWhen} placeholder="10:30" size="lg" width="100%" />
              {tried && !timeOk ? <Note>时间写成 10:30 这样的格式。</Note> : null}
            </Stack>
          </>
        ) : null}
        <TextInput label="备注（可不填）" value={note} onChange={setNote} placeholder="要订位、要早到……" size="lg" width="100%" />
      </Stack>
      <Grow />
      {/* region: actions */}
      <Stack gap={3}>
        <Button label="保存" variant="primary" size="lg" width="100%" onClick={save} />
        {editing ? <Button label="删掉这一站" variant="destructive" size="lg" width="100%" onClick={remove} /> : null}
        <Button label="取消" variant="ghost" size="lg" width="100%" onClick={() => onDone()} />
      </Stack>
    </>
  );
  return mode === 'idea' ? <Screen screen="idea-new">{body}</Screen> : <Screen screen="stop">{body}</Screen>;
}
