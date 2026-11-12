import {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import {appTheme} from '../theme/app';
import '../theme/app.css';
import {useStore} from './logic/store';
import {Mistakes} from './screens/Mistakes';
import {Mock} from './screens/Mock';
import {MockIntro} from './screens/MockIntro';
import {MockResult} from './screens/MockResult';
import {Practice} from './screens/Practice';
import type {Tab} from './ui';

type Route = Tab | 'mock-run' | 'mock-result';

export function App() {
  return (
    <Theme theme={appTheme} mode="light">
      <Routes />
    </Theme>
  );
}

function Routes() {
  const {state, update} = useStore();
  const [route, setRoute] = useState<Route>('practice');
  switch (route) {
    case 'mock':
      return <MockIntro state={state} onTab={setRoute} onStart={() => setRoute('mock-run')} />;
    case 'mock-run':
      return <Mock update={update} onQuit={() => setRoute('mock')} onDone={() => setRoute('mock-result')} />;
    case 'mock-result':
      return <MockResult state={state} onMistakes={() => setRoute('mistakes')} onBack={() => setRoute('mock')} />;
    case 'mistakes':
      return <Mistakes state={state} update={update} onTab={setRoute} />;
    default:
      return <Practice state={state} update={update} onTab={setRoute} />;
  }
}
