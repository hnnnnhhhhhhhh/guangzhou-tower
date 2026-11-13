// 教练首页：选一天，点时段就生成一节等待预约的课。
import {useState} from 'react';
import {Cells, DateNum, Enter, Label, List, Row, Screen, Section, Segments, Stack, Text, Title, Week} from '../../../../kit';
import {HOURS, REPEAT_WEEKS, hh, onDay, shortDate, slotLocked, startOf, today, toggleSlot, weekday} from '../logic/booking';
import {ClassItem, RoleSwitch, tabsFor, weekDays} from './shared';
import type {Props} from './shared';

export function Schedule({state, now, update, go, day, onDay: pickDay}: Props & {day: string; onDay: (d: string) => void}) {
  const [repeat, setRepeat] = useState('once');
  const list = onDay(state, day);
  const taken = new Set(list.map((c) => c.hour));
  return (
    <Screen screen="schedule" tabs={tabsFor(state)} tab="home" onTab={go}>
      {/* region: head */}
      <Row>
        <Stack gap={1}>
          <Label>教练端</Label>
          <Title>排课</Title>
        </Stack>
        <RoleSwitch state={state} update={update} go={go} />
      </Row>
      <Week days={weekDays(day, today())} active={day} onPick={pickDay} />
      <Enter id={day}>
        {/* region: slots */}
        <Section
          label="可上课的时段"
          title="点一下，就开一节课"
          end={
            <Text tone="2" size="sm">
              <DateNum value={shortDate(day)} /> {weekday(day)}
            </Text>
          }>
          <Segments
            label="重复方式"
            active={repeat}
            onPick={setRepeat}
            items={[
              {id: 'once', label: '只这一天'},
              {id: 'weekly', label: `每周重复（再排 ${REPEAT_WEEKS} 周）`},
            ]}
          />
          <Cells
            items={HOURS.map((h) => {
              const past = startOf({date: day, hour: h} as never) <= now;
              const locked = slotLocked(state, day, h);
              return {id: String(h), label: hh(h), on: taken.has(h), disabled: past || locked, aria: `${hh(h)}${taken.has(h) ? '，已开课' : ''}${locked ? '，已有人预约' : ''}`};
            })}
            onToggle={(h) => update((s) => toggleSlot(s, day, Number(h), repeat === 'weekly'))}
          />
          <Text tone="2" size="sm">
            已经有人预约的时段不能直接撤掉，要到下面的课程里删除，学员会收到通知。
          </Text>
        </Section>
        {/* region: day-classes */}
        <Section label="这一天的课" end={<Text tone="2" size="sm">{list.length} 节</Text>}>
          {list.length > 0 ? (
            <List>
              {list.map((c) => (
                <ClassItem key={c.id} c={c} now={now} onPress={() => go('manage', c.id)} />
              ))}
            </List>
          ) : (
            <Text tone="2">还没有开课。在上面点一个时段。</Text>
          )}
        </Section>
      </Enter>
    </Screen>
  );
}
