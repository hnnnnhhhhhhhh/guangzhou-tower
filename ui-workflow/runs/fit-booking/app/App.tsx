import {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import {appTheme} from '../theme/app';
import '../theme/app.css';
import './style.css';
import {useStore} from './logic/store';
import {Bookings} from './screens/Bookings';
import {ClassDetail} from './screens/ClassDetail';
import {Classes} from './screens/Classes';
import {Manage} from './screens/Manage';
import {Messages} from './screens/Messages';
import {Schedule} from './screens/Schedule';
import {today} from './logic/booking';

export type Go = (to: string, id?: string) => void;

export function App() {
  return (
    <Theme theme={appTheme} mode="dark">
      <Routes />
    </Theme>
  );
}

function Routes() {
  const {state, now, update} = useStore();
  const [route, setRoute] = useState<{name: string; id?: string}>({name: 'home'});
  const [day, setDay] = useState(today());
  const go: Go = (name, id) => setRoute({name, id});
  const coach = state.role === 'coach';
  const shared = {state, now, update, go};

  if (route.name === 'messages') return <Messages {...shared} />;
  if (coach) {
    if (route.name === 'manage' && route.id) return <Manage {...shared} id={route.id} />;
    return <Schedule {...shared} day={day} onDay={setDay} />;
  }
  if (route.name === 'class' && route.id) return <ClassDetail {...shared} id={route.id} />;
  if (route.name === 'bookings') return <Bookings {...shared} />;
  return <Classes {...shared} day={day} onDay={setDay} />;
}
