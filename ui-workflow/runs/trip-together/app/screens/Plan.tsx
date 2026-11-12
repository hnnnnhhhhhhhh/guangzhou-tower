// 行程：按天看，每一站被一条线串起来；两站之间的加号用来在那里插一站。
import {Button} from '@astryxdesign/core/Button';
import {KINDS} from '../data/seed';
import type {Trip} from '../data/seed';
import {dayLabel, member, range, stopsOf} from '../logic/trip';
import {Avatars, Days, Empty, Enter, Gap, H2, Note, Pulse, Route, Row, Screen, Stack, Sticker, StopCard, Sub, Title} from '../ui';
import type {View} from '../ui';

const sticker = (kind: string) => KINDS.find((k) => k.id === kind)?.sticker ?? 'round-pushpin';
/** 在两站之间插入时，默认时间取中间值 */
const between = (a: string, b: string) => {
  const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const mid = Math.round((m(a) + m(b)) / 2 / 30) * 30;
  return `${String(Math.floor(mid / 60)).padStart(2, '0')}:${String(mid % 60).padStart(2, '0')}`;
};

export function Plan({trip, day, onDay, onView, onMembers, onStop, onAdd}: {trip: Trip; day: number; onDay: (d: number) => void; onView: (v: View) => void; onMembers: () => void; onStop: (id: string) => void; onAdd: (time?: string) => void}) {
  const stops = stopsOf(trip, day);
  const last = trip.log[0];
  const label = dayLabel(trip, day);
  return (
    <Screen screen="plan" view="plan" counts={{plan: trip.stops.length, ideas: trip.ideas.length}} onView={onView}>
      {/* region: trip-head */}
      <Stack gap={3}>
        <Row>
          <Stack gap={1}>
            <Title>{trip.name}</Title>
            <Sub>{range(trip)}</Sub>
          </Stack>
          <Avatars members={trip.members} onPress={onMembers} />
        </Row>
        {last ? <Pulse m={member(trip, last.who)} text={last.text} /> : null}
      </Stack>

      {/* region: days */}
      <Days items={Array.from({length: trip.days}, (_, i) => ({day: i + 1, ...dayLabel(trip, i + 1), count: stopsOf(trip, i + 1).length}))} active={day} onPick={onDay} />

      {/* region: route */}
      <Enter id={`day-${day}`}>
        <Row>
          <H2>
            第 {day} 天 · {label.week}
          </H2>
          <Note>{stops.length} 站</Note>
        </Row>
        {stops.length > 0 ? (
          <Route>
            {stops.map((s, i) => (
              <Stack key={s.id} gap={2}>
                <StopCard index={i + 1} name={s.name} time={s.time} note={s.note} sticker={sticker(s.kind)} by={member(trip, s.by)} onPress={() => onStop(s.id)} />
                {i < stops.length - 1 ? <Gap label={`在 ${s.name} 之后加一站`} onAdd={() => onAdd(between(s.time, stops[i + 1].time))} /> : null}
              </Stack>
            ))}
          </Route>
        ) : (
          <Empty>
            <Sticker name="world-map" size={72} />
            <Note>这一天还没有安排。可以加一站，或者去“想去”里挑。</Note>
          </Empty>
        )}
        <Button label="加一站" variant="primary" size="lg" width="100%" onClick={() => onAdd()} />
      </Enter>
    </Screen>
  );
}
