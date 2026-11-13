// 一节课：是什么、什么时候、还有没有位置，然后约或者取消。
import {ArrowLeft} from 'lucide-react';
import {Avatars, Btn, DateNum, Divider, IconBtn, Item, Label, List, Num, Screen, Section, Stack, Status, Text, Title} from '../../../../kit';
import {COACH, ME} from '../data/seed';
import {CUTOFF_HOURS, STATUS_TEXT, STATUS_TONE, book, bookable, cancel, hh, person, shortBy, shortDate, statusOf, weekday} from '../logic/booking';
import type {Props} from './shared';

export function ClassDetail({state, now, update, go, id}: Props & {id: string}) {
  const c = state.classes.find((x) => x.id === id);
  if (!c) {
    return (
      <Screen screen="class" foot={<Btn full onPress={() => go('home')}>返回课程</Btn>}>
        <Title>这节课已经不在了</Title>
        <Text tone="2">它可能被教练取消了。消息里会有通知。</Text>
      </Screen>
    );
  }
  const s = statusOf(c, now);
  const can = bookable(c, now);
  const booked = c.booked.includes(ME);
  const short = shortBy(c);
  return (
    <Screen
      screen="class"
      foot={
        booked ? (
          <>
            <Text tone="2" size="sm">
              你已经约了这节课。
            </Text>
            <Btn kind="secondary" full onPress={() => update((st) => cancel(st, c.id))}>
              取消预约
            </Btn>
          </>
        ) : can.ok ? (
          <Btn full onPress={() => update((st) => book(st, c.id, Date.now()))}>
            立即约课
          </Btn>
        ) : (
          <>
            <Text tone="2" size="sm">
              {can.why}
            </Text>
            <Btn full disabled onPress={() => go('home')}>
              不能预约
            </Btn>
          </>
        )
      }>
      <IconBtn label="返回" onPress={() => go('home')}>
        <ArrowLeft size={22} aria-hidden />
      </IconBtn>
      {/* region: what */}
      <Stack gap={3}>
        <Label>
          {weekday(c.date)} · {hh(c.hour)} – {hh(c.hour + 1)}
        </Label>
        <Title>{c.title}</Title>
        <Text tone="2">{COACH}</Text>
        <Status tone={STATUS_TONE[s]}>{STATUS_TEXT[s]}</Status>
      </Stack>
      {c.content ? <Text>{c.content}</Text> : null}
      <Divider />
      {/* region: facts */}
      <Section label="安排">
        <List>
          <Item title={<DateNum value={shortDate(c.date)} />} sub="日期" end={<Text tone="2">{weekday(c.date)}</Text>} />
          <Item title={<Num value={c.booked.length} unit={` / ${c.max} 人`} />} sub={short > 0 ? `还差 ${short} 人才开课（最少 ${c.min} 人）` : `已达到开课人数（最少 ${c.min} 人）`} />
          <Item title={`开课前 ${CUTOFF_HOURS} 小时`} sub="停止预约" />
        </List>
      </Section>
      <Divider />
      {/* region: who */}
      <Section label="已约的人">{c.booked.length > 0 ? <Avatars people={c.booked.map(person)} /> : <Text tone="2">还没有人约，你可以是第一个。</Text>}</Section>
    </Screen>
  );
}
