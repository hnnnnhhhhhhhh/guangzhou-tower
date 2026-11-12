// 存储与同步。数据存在浏览器本地；同一浏览器开两个窗口时，一边改了另一边立刻看到。
// 这是“多人同时编辑”的本机演示：真正跨设备的协作需要服务端，这里没有。
import {useCallback, useEffect, useState} from 'react';
import {seed} from '../data/seed';
import type {Trip} from '../data/seed';

const KEY = 'trip-together/v1';
const ME = 'trip-together/me'; // “我是谁”按窗口记，不随行程同步
function load(): Trip {
  let trip = seed();
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Trip | null;
    if (parsed && parsed.version === 1) trip = parsed;
    const me = sessionStorage.getItem(ME);
    if (me) trip = {...trip, me};
  } catch {
    // 存储不可用时用示例数据
  }
  return trip;
}
export function useStore() {
  const [trip, setTrip] = useState<Trip>(load);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      const incoming = JSON.parse(e.newValue) as Trip;
      setTrip((mine) => ({...incoming, me: mine.me}));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const update = useCallback((fn: (t: Trip) => Trip) => {
    setTrip((current) => {
      // 先读最新的再改，避免两个窗口互相覆盖
      let base = current;
      try {
        const latest = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Trip | null;
        if (latest && latest.version === 1) base = {...latest, me: current.me};
      } catch {
        // 忽略
      }
      const next = fn(base);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
        sessionStorage.setItem(ME, next.me);
      } catch {
        // 忽略
      }
      return next;
    });
  }, []);
  return {trip, update};
}
