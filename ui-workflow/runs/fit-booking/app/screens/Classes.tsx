// 学员首页：选一天，看这天的课。
import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {DateNum, Empty, Enter, Label, List, Row, Screen, Section, Stack, Text, Title, Week} from '../../../../kit';
import {onDay, shortDate, today, weekday} from '../logic/booking';
import {ClassItem, RoleSwitch, tabsFor, weekDays} from './shared';
import type {Props} from './shared';

export function Classes({state, now, update, go, day, onDay: pickDay}: Props & {day: string; onDay: (d: string) => void}) {
  const [query, setQuery] = useState('');
  const list = onDay(state, day, query);
  return (
    <Screen screen="classes" tabs={tabsFor(state)} tab="home" onTab={go}>
      {/* region: head */}
      <Row>
        <Stack gap={1}>
          <Label>周教练 · 自由教练</Label>
          <Title>课程</Title>
        </Stack>
        <RoleSwitch state={state} update={update} go={go} />
      </Row>
      {/* region: week */}
      <Week days={weekDays(day, today())} active={day} onPick={pickDay} />
      <TextInput label="搜索课程名称或练习内容" isLabelHidden value={query} onChange={setQuery} placeholder="搜索课程名称或练习内容" size="lg" width="100%" />
      {/* region: class-list */}
      <Enter id={day}>
        <Section
          label={weekday(day)}
          title={day === today() ? '今天的课' : undefined}
          end={
            <Text tone="2" size="sm">
              <DateNum value={shortDate(day)} /> · {list.length} 节
            </Text>
          }>
          {list.length > 0 ? (
            <List>
              {list.map((c) => (
                <ClassItem key={c.id} c={c} now={now} onPress={() => go('class', c.id)} />
              ))}
            </List>
          ) : (
            <Empty title={query ? '没有找到相符的课' : '这天没有课'} text={query ? '换个关键词试试。' : '教练还没有在这一天排课，看看别的日子。'} />
          )}
        </Section>
      </Enter>
    </Screen>
  );
}
