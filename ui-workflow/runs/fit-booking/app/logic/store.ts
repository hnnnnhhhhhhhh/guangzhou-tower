import {useCallback, useEffect, useState} from 'react';
import {dayKey, seed} from '../data/seed';
import type {State} from '../data/seed';

const KEY = 'fit-booking/v1';
function load(): State {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null') as State | null;
    if (parsed && parsed.version === 1) return parsed;
  } catch {
    // 存储不可用时用示例数据
  }
  return seed(dayKey(new Date()));
}
export function useStore() {
  const [state, setState] = useState<State>(load);
  // 每半分钟看一次时间，课程状态（可预约 → 在上课 → 已结束）随时间自动变
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // 忽略
    }
  }, [state]);
  return {state, now, update: useCallback((fn: (s: State) => State) => setState(fn), [])};
}
