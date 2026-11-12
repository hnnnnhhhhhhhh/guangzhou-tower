import {useCallback, useEffect, useState} from 'react';
import {empty} from './quiz';
import type {State} from './quiz';

const KEY = 'driving-quiz/v1';
function load(): State {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null') as State | null;
    return parsed && parsed.version === 1 ? parsed : empty();
  } catch {
    return empty();
  }
}
export function useStore() {
  const [state, setState] = useState<State>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // 存储不可用时照常使用，只是不保存
    }
  }, [state]);
  return {state, update: useCallback((fn: (s: State) => State) => setState(fn), [])};
}
