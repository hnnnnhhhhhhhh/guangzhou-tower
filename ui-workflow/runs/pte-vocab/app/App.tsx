import {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import {appTheme} from '../theme/app';
import '../theme/app.css';
import {useStore} from './logic/store';
import {Home} from './screens/Home';
import {Study} from './screens/Study';
import type {SessionResult} from './screens/Study';
import {Summary} from './screens/Summary';
import {Words} from './screens/Words';

type Route = {name: 'home'} | {name: 'study'} | {name: 'summary'; result: SessionResult} | {name: 'words'};

export function App() {
  return (
    <Theme theme={appTheme} mode="light">
      <Routes />
    </Theme>
  );
}

function Routes() {
  const {state, update} = useStore();
  const [route, setRoute] = useState<Route>({name: 'home'});
  const home = () => setRoute({name: 'home'});

  switch (route.name) {
    case 'study':
      return <Study state={state} update={update} onQuit={home} onDone={(result) => setRoute({name: 'summary', result})} />;
    case 'summary':
      return <Summary state={state} result={route.result} onHome={home} />;
    case 'words':
      return <Words state={state} onBack={home} />;
    default:
      return <Home state={state} update={update} onStart={() => setRoute({name: 'study'})} onWords={() => setRoute({name: 'words'})} />;
  }
}
