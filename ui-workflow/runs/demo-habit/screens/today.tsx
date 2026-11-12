import {useRef} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {CalendarCheck, ChartColumn, Plus, User} from 'lucide-react';
import {MobileShell} from '../../../shell/MobileShell';
import spec from '../specs/today.json';
import {appTheme} from '../theme/app';
import '../theme/app.css';

const {date, done, total, habits} = spec.sample_data;

// 整行都是触控目标：点行任意位置都会转给行尾的勾选框。
function HabitRow({name, streak, done}: {name: string; streak: number; done: boolean}) {
  const checkbox = useRef<HTMLInputElement>(null);
  return (
    <ListItem
      label={name}
      description={streak > 0 ? `已连续 ${streak} 天` : '今天重新开始'}
      interactiveRef={checkbox}
      endContent={<CheckboxInput ref={checkbox} label={`完成：${name}`} isLabelHidden value={done} onChange={() => {}} />}
    />
  );
}

export default function Today() {
  return (
    <MobileShell
      theme={appTheme}
      activeTab="today"
      tabs={[
        {value: 'today', label: '今天', icon: <Icon icon={CalendarCheck} />},
        {value: 'stats', label: '统计', icon: <Icon icon={ChartColumn} />},
        {value: 'me', label: '我的', icon: <Icon icon={User} />},
      ]}
      header={
        /* region: day-header */
        <HStack hAlign="between" vAlign="center">
          <VStack gap={0.5}>
            <Text type="supporting">{date}</Text>
            <Heading level={1}>今天</Heading>
          </VStack>
          <IconButton label="新建习惯" icon={<Icon icon={Plus} />} variant="ghost" size="lg" />
        </HStack>
      }>
      <VStack gap={6}>
        {/* region: day-progress */}
        <Card>
          <VStack gap={3}>
            <HStack hAlign="between" vAlign="end">
              <Text type="display-3" hasTabularNumbers>
                {done}/{total}
              </Text>
              <Text type="supporting">还剩 {total - done} 个</Text>
            </HStack>
            <ProgressBar label="今日完成进度" isLabelHidden value={done} max={total} />
          </VStack>
        </Card>

        {/* region: habit-list */}
        <List hasDividers density="spacious" edge="flush">
          {habits.map((h) => (
            <HabitRow key={h.name} {...h} />
          ))}
        </List>
      </VStack>
    </MobileShell>
  );
}
