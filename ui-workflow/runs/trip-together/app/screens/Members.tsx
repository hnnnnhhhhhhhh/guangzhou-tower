// 同行的人。这里也用来切换“我是谁”，方便在一台设备上演示多人编辑。
import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import type {Trip} from '../data/seed';
import {setMe} from '../logic/trip';
import {Grow, Label, Note, People, Screen, Stack, Sub, Title} from '../ui';

export function Members({trip, update, onBack}: {trip: Trip; update: (fn: (t: Trip) => Trip) => void; onBack: () => void}) {
  const [copied, setCopied] = useState(false);
  const invite = async () => {
    try {
      await navigator.clipboard.writeText(location.href.split('?')[0]);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Screen screen="members">
      <Stack gap={1}>
        <Title>同行 {trip.members.length} 人</Title>
        <Sub>每个人都可以加、改、删行程，也可以投票</Sub>
      </Stack>
      {/* region: people */}
      <Stack gap={2}>
        <Label>点一下，以这个人的身份编辑</Label>
        <People members={trip.members} me={trip.me} onPick={(id) => update((t) => setMe(t, id))} />
      </Stack>
      {/* region: invite */}
      <Stack gap={2}>
        <Button label={copied ? '链接已复制' : '复制邀请链接'} variant="secondary" size="lg" width="100%" onClick={invite} />
        <Note>目前只在这台设备的浏览器里同步：用同一个浏览器再开一个窗口，就能看到两个人同时编辑的效果。跨设备协作需要服务端，还没有接。</Note>
      </Stack>
      <Grow />
      <Button label="完成" variant="primary" size="lg" width="100%" onClick={onBack} />
    </Screen>
  );
}
