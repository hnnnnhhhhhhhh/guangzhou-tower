import {useEffect} from 'react';
import {Empty, Item, Label, List, Screen, Stack, Status, Title} from '../../../../kit';
import {readAll} from '../logic/booking';
import {tabsFor} from './shared';
import type {Props} from './shared';

export function Messages({state, update, go}: Props) {
  const to = state.role === 'coach' ? 'coach' : 'student';
  const list = state.messages.filter((m) => m.to === to);
  // 离开这一屏时，把这里的消息都标为已读
  useEffect(() => () => update((s) => readAll(s, to)), [to, update]);
  return (
    <Screen screen="messages" tabs={tabsFor(state)} tab="messages" onTab={go}>
      <Stack gap={1}>
        <Label>{to === 'coach' ? '教练端' : '学员端'}</Label>
        <Title>消息</Title>
      </Stack>
      {/* region: message-list */}
      {list.length > 0 ? (
        <List>
          {list.map((m) => (
            <Item key={m.id} title={m.text} end={m.read ? undefined : <Status tone="warn">新</Status>} />
          ))}
        </List>
      ) : (
        <Empty title="没有消息" text="约课成功、课程取消时会在这里通知。" />
      )}
    </Screen>
  );
}
