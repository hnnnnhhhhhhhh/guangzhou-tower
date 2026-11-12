// 状态与本地存储。界面只通过这个 hook 读写。
import {useCallback, useEffect, useState} from 'react';
import {emptyState} from './srs';
import type {State} from './srs';

const KEY = 'pte-vocab/v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as State;
    return parsed.version === 1 ? parsed : emptyState();
  } catch {
    return emptyState();
  }
}

export function useStore() {
  const [state, setState] = useState<State>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // 存储不可用（隐私模式等）时仍然可以学，只是不保存
    }
  }, [state]);
  const update = useCallback((fn: (s: State) => State) => setState(fn), []);
  return {state, update};
}
