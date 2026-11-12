// 想去：还没排进行程的地方。大家投票，票多的排前面；随时可以把它排进某一天。
import {Button} from '@astryxdesign/core/Button';
import {KINDS} from '../data/seed';
import type {Trip} from '../data/seed';
import {member, rankedIdeas, toggleVote} from '../logic/trip';
import {Avatars, Empty, IdeaCard, Note, Row, Screen, Stack, Sticker, Sub, Title} from '../ui';
import type {View} from '../ui';

const sticker = (kind: string) => KINDS.find((k) => k.id === kind)?.sticker ?? 'round-pushpin';

export function Ideas({trip, update, onView, onMembers, onNew, onSchedule}: {trip: Trip; update: (fn: (t: Trip) => Trip) => void; onView: (v: View) => void; onMembers: () => void; onNew: () => void; onSchedule: (id: string) => void}) {
  const ideas = rankedIdeas(trip);
  return (
    <Screen screen="ideas" view="ideas" counts={{plan: trip.stops.length, ideas: trip.ideas.length}} onView={onView}>
      {/* region: head */}
      <Row>
        <Stack gap={1}>
          <Title>想去</Title>
          <Sub>还没排进行程 · 票多的在前</Sub>
        </Stack>
        <Avatars members={trip.members} onPress={onMembers} />
      </Row>
      {/* region: idea-list */}
      {ideas.length > 0 ? (
        <Stack gap={3}>
          {ideas.map((i) => (
            <IdeaCard key={i.id} name={i.name} note={i.note} sticker={sticker(i.kind)} voters={i.votes.map((v) => member(trip, v))} mine={i.votes.includes(trip.me)} onVote={() => update((t) => toggleVote(t, i.id))} onSchedule={() => onSchedule(i.id)} />
          ))}
        </Stack>
      ) : (
        <Empty>
          <Sticker name="sparkles" size={72} />
          <Note>想去的地方都排进行程了。又想到新的，随时加。</Note>
        </Empty>
      )}
      <Button label="加一个想去的地方" variant="primary" size="lg" width="100%" onClick={onNew} />
    </Screen>
  );
}
