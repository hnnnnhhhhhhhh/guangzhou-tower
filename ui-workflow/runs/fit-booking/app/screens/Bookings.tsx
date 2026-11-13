import {Btn, Empty, Label, List, Screen, Stack, Title} from '../../../../kit';
import {mine} from '../logic/booking';
import {ClassItem, tabsFor} from './shared';
import type {Props} from './shared';

export function Bookings({state, now, go}: Props) {
  const list = mine(state, now);
  return (
    <Screen screen="bookings" tabs={tabsFor(state)} tab="bookings" onTab={go}>
      <Stack gap={1}>
        <Label>还没上的课</Label>
        <Title>我的预约</Title>
      </Stack>
      {/* region: my-list */}
      {list.length > 0 ? (
        <List>
          {list.map((c) => (
            <ClassItem key={c.id} c={c} now={now} withDate onPress={() => go('class', c.id)} />
          ))}
        </List>
      ) : (
        <Empty title="还没有预约" text="约上的课会出现在这里。" action={<Btn kind="secondary" onPress={() => go('home')}>去看课程</Btn>} />
      )}
    </Screen>
  );
}
