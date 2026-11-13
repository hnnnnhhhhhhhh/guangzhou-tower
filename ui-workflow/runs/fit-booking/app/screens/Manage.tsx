// 教练管理一节课：补充名称和内容、人数；开始、结束、删除。
import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ArrowLeft} from 'lucide-react';
import {Avatars, Btn, Divider, IconBtn, Label, Screen, Section, Stack, Status, Text, Title} from '../../../../kit';
import {STATUS_TEXT, STATUS_TONE, begin, finish, hh, person, remove, shortDate, statusOf, update as save, validDraft, weekday} from '../logic/booking';
import type {Props} from './shared';

export function Manage({state, now, update, go, id}: Props & {id: string}) {
  const c = state.classes.find((x) => x.id === id);
  const [title, setTitle] = useState(c?.title ?? '');
  const [content, setContent] = useState(c?.content ?? '');
  const [min, setMin] = useState(String(c?.min ?? 1));
  const [max, setMax] = useState(String(c?.max ?? 4));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  if (!c) {
    return (
      <Screen screen="manage" foot={<Btn full onPress={() => go('home')}>返回排课</Btn>}>
        <Title>这节课已经删除</Title>
      </Screen>
    );
  }
  const s = statusOf(c, now);
  const submit = () => {
    const draft = {title, content, min: Number(min), max: Number(max)};
    const problem = validDraft(draft, c.booked.length);
    setError(problem);
    setSaved(!problem);
    if (!problem) update((st) => save(st, c.id, draft));
  };
  return (
    <Screen screen="manage" foot={<Btn full onPress={submit}>保存</Btn>}>
      <IconBtn label="返回" onPress={() => go('home')}>
        <ArrowLeft size={22} aria-hidden />
      </IconBtn>
      <Stack gap={3}>
        <Label>
          {shortDate(c.date)} {weekday(c.date)} · {hh(c.hour)} – {hh(c.hour + 1)}
        </Label>
        <Title>{c.title}</Title>
        <Status tone={STATUS_TONE[s]}>{STATUS_TEXT[s]}</Status>
      </Stack>
      {/* region: edit */}
      <Section label="课程信息">
        <TextInput label="课程名称" value={title} onChange={setTitle} size="lg" width="100%" />
        <TextInput label="练习内容" value={content} onChange={setContent} placeholder="比如 深蹲、硬拉、核心" size="lg" width="100%" />
        <TextInput label="人数下限" value={min} onChange={setMin} size="lg" width="100%" />
        <TextInput label="人数上限" value={max} onChange={setMax} size="lg" width="100%" />
        {error ? <Status tone="bad">{error}</Status> : saved ? <Status tone="good">已保存</Status> : null}
      </Section>
      <Divider />
      {/* region: booked */}
      <Section label={`已约 ${c.booked.length} 人`}>{c.booked.length > 0 ? <Avatars people={c.booked.map(person)} /> : <Text tone="2">还没有人预约。</Text>}</Section>
      <Divider />
      {/* region: run */}
      <Section label="上课">
        {s === 'ended' ? <Text tone="2">这节课已经结束。</Text> : s === 'running' ? <Btn kind="secondary" full onPress={() => update((st) => finish(st, c.id))}>结束课程</Btn> : <Btn kind="secondary" full onPress={() => update((st) => begin(st, c.id))}>开始上课</Btn>}
        <Btn kind="danger" full onPress={() => (update((st) => remove(st, c.id)), go('home'))}>
          删除课程
        </Btn>
        <Text tone="2" size="sm">
          删除后，已约的学员会收到通知。
        </Text>
      </Section>
    </Screen>
  );
}
