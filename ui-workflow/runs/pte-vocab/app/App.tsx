import {useState} from 'react';
import {useStore} from './logic/store';
import {Home} from './screens/Home';
import {Study} from './screens/Study';
import type {SessionResult} from './screens/Study';
import {Summary} from './screens/Summary';
import {Words} from './screens/Words';

type Route = {name: 'home'} | {name: 'study'} | {name: 'summary'; result: SessionResult} | {name: 'words'};

export function App() {
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
