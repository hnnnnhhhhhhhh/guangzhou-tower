import {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import {appTheme} from '../theme/app';
import '../theme/app.css';
import {useStore} from './logic/store';
import {Ideas} from './screens/Ideas';
import {Members} from './screens/Members';
import {Plan} from './screens/Plan';
import {Schedule} from './screens/Schedule';
import {StopEditor} from './screens/StopEditor';
import type {View} from './ui';

type Route = {name: View} | {name: 'members'; back: View} | {name: 'stop'; id?: string; day: number; time?: string} | {name: 'idea-new'} | {name: 'schedule'; id: string};

export function App() {
  return (
    <Theme theme={appTheme} mode="light">
      <Routes />
    </Theme>
  );
}

function Routes() {
  const {trip, update} = useStore();
  const [route, setRoute] = useState<Route>({name: 'plan'});
  const [day, setDay] = useState(1);
  const go = (name: View) => setRoute({name});

  switch (route.name) {
    case 'ideas':
      return <Ideas trip={trip} update={update} onView={go} onMembers={() => setRoute({name: 'members', back: 'ideas'})} onNew={() => setRoute({name: 'idea-new'})} onSchedule={(id) => setRoute({name: 'schedule', id})} />;
    case 'members':
      return <Members trip={trip} update={update} onBack={() => go(route.back)} />;
    case 'stop':
      return <StopEditor trip={trip} update={update} mode="stop" id={route.id} day={route.day} time={route.time} onDone={(d) => (setDay(d ?? day), go('plan'))} />;
    case 'idea-new':
      return <StopEditor trip={trip} update={update} mode="idea" day={day} onDone={() => go('ideas')} />;
    case 'schedule':
      return <Schedule trip={trip} update={update} id={route.id} onCancel={() => go('ideas')} onDone={(d) => (setDay(d), go('plan'))} />;
    default:
      return <Plan trip={trip} day={day} onDay={setDay} onView={go} onMembers={() => setRoute({name: 'members', back: 'plan'})} onStop={(id) => setRoute({name: 'stop', id, day})} onAdd={(time) => setRoute({name: 'stop', day, time})} />;
  }
}
