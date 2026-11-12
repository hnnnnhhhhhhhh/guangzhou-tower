// 这个应用的界面零件。屏幕文件只组合它们；表单控件用 Astryx 的。
import type {ReactNode} from 'react';
import {Plus} from 'lucide-react';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/900.css';
import {STICKERS} from '../stickers';
import type {StickerName} from '../stickers';
import type {Member} from '../data/seed';
import './ui.css';

export type View = 'plan' | 'ideas';
const skin = new URLSearchParams(location.search).get('skin') === 'proto' ? 'proto' : 'styled';

export function Screen({screen, view, counts, onView, children}: {screen: string; view?: View; counts?: {plan: number; ideas: number}; onView?: (v: View) => void; children: ReactNode}) {
  return (
    <div className="t-screen" data-screen={screen} data-skin={skin}>
      <main className="t-page">{children}</main>
      {view && onView ? (
        <nav className="t-dock" aria-label="切换视图">
          <div className="t-switch">
            <button type="button" aria-current={view === 'plan' ? 'page' : undefined} aria-label="行程" onClick={() => onView('plan')}>
              行程 <b>{counts?.plan}</b>
            </button>
            <button type="button" aria-current={view === 'ideas' ? 'page' : undefined} aria-label="想去" onClick={() => onView('ideas')}>
              想去 <b>{counts?.ideas}</b>
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
export const Sticker = ({name, size = 32}: {name: StickerName; size?: 24 | 32 | 44 | 72}) => <img className="t-sticker" src={STICKERS[name]} width={size} height={size} alt="" />;
export const Stack = ({gap = 3, children}: {gap?: 1 | 2 | 3 | 4 | 5 | 6; children: ReactNode}) => (
  <div className="t-stack" style={{gap: `var(--spacing-${gap})`}}>
    {children}
  </div>
);
export const Row = ({children}: {children: ReactNode}) => <div className="t-row">{children}</div>;
export const Grow = () => <div className="t-grow" />;
export const Enter = ({id, children}: {id: string; children: ReactNode}) => (
  <div key={id} className="t-enter t-stack" style={{gap: 'var(--spacing-5)'}}>
    {children}
  </div>
);
export const Title = ({children}: {children: ReactNode}) => <h1 className="t-title">{children}</h1>;
export const Sub = ({children}: {children: ReactNode}) => <p className="t-sub">{children}</p>;
export const H2 = ({children}: {children: ReactNode}) => <h2 className="t-h2">{children}</h2>;
export const Note = ({children}: {children: ReactNode}) => <p className="t-note">{children}</p>;
export const Label = ({children}: {children: ReactNode}) => <p className="t-label">{children}</p>;

export const Avatar = ({m, size, me}: {m: Member; size?: 'sm'; me?: boolean}) => (
  <span className="t-avatar" data-size={size} data-me={me} style={{['--hue' as string]: m.hue}} aria-hidden>
    {m.name.slice(-1)}
  </span>
);
/** 头部的一排头像：点开是成员与邀请 */
export const Avatars = ({members, onPress}: {members: Member[]; onPress: () => void}) => (
  <button type="button" className="t-avatars" aria-label={`同行 ${members.length} 人`} onClick={onPress}>
    {members.map((m) => (
      <Avatar key={m.id} m={m} />
    ))}
  </button>
);
/** 最近一条改动：谁做了什么 */
export const Pulse = ({m, text}: {m: Member; text: string}) => (
  <div className="t-pulse" role="status">
    <Avatar m={m} size="sm" />
    <span>
      {m.name} {text}
    </span>
  </div>
);
export function Days({items, active, onPick}: {items: {day: number; short: string; week: string; count: number}[]; active: number; onPick: (d: number) => void}) {
  return (
    <div className="t-days">
      {items.map((d) => (
        <button key={d.day} type="button" className="t-day" aria-pressed={d.day === active} aria-label={`第 ${d.day} 天，${d.short}，${d.count} 站`} onClick={() => onPick(d.day)}>
          {d.short}
          <small>{d.week}</small>
        </button>
      ))}
    </div>
  );
}
export const Route = ({children}: {children: ReactNode}) => <div className="t-route">{children}</div>;
/** 一站。图片位留空，上面放一张表示类型的贴纸。 */
export function StopCard({index, name, time, note, sticker, by, onPress}: {index: number; name: string; time: string; note?: string; sticker: StickerName; by: Member; onPress: () => void}) {
  return (
    <button type="button" className="t-stop" aria-label={`${time} ${name}，${by.name}加的，点开修改`} onClick={onPress}>
      <span className="t-thumb">
        <Sticker name={sticker} size={44} />
        <i>{index}</i>
      </span>
      <span className="t-stop-main">
        <span className="t-name">{name}</span>
        <span className="t-time">{time}</span>
        {note ? <span className="t-stop-note">{note}</span> : null}
      </span>
      <Avatar m={by} size="sm" />
    </button>
  );
}
/** 两站之间的加号：在这里插一站 */
export const Gap = ({label, onAdd}: {label: string; onAdd: () => void}) => (
  <div className="t-gap">
    <button type="button" className="t-plus" aria-label={label} onClick={onAdd}>
      <i>
        <Plus size={16} aria-hidden />
      </i>
    </button>
  </div>
);
export const Empty = ({children}: {children: ReactNode}) => <div className="t-empty">{children}</div>;
export function IdeaCard({name, note, sticker, voters, mine, onVote, onSchedule}: {name: string; note?: string; sticker: StickerName; voters: Member[]; mine: boolean; onVote: () => void; onSchedule: () => void}) {
  return (
    <div className="t-idea">
      <div className="t-idea-head">
        <span className="t-thumb">
          <Sticker name={sticker} size={44} />
        </span>
        <span className="t-stop-main">
          <span className="t-name">{name}</span>
          {note ? <span className="t-note">{note}</span> : null}
        </span>
      </div>
      <span className="t-votes">
        <span className="t-row" style={{gap: 0}}>
          {voters.map((m) => (
            <Avatar key={m.id} m={m} size="sm" />
          ))}
        </span>
        {voters.length} 人想去
      </span>
      <div className="t-actions">
        <button type="button" className="t-pill" aria-pressed={mine} aria-label={mine ? `取消想去 ${name}` : `我也想去 ${name}`} onClick={onVote}>
          {mine ? '已想去' : '我也想去'}
        </button>
        <button type="button" className="t-pill" aria-label={`把 ${name} 排进行程`} onClick={onSchedule}>
          排进行程
        </button>
      </div>
    </div>
  );
}
export const IconBtn = ({label, onPress, children}: {label: string; onPress: () => void; children: ReactNode}) => (
  <button type="button" className="t-icon" aria-label={label} onClick={onPress}>
    {children}
  </button>
);
export function Kinds({items, active, onPick}: {items: {id: string; name: string; sticker: StickerName}[]; active: string; onPick: (id: string) => void}) {
  return (
    <div className="t-kinds">
      {items.map((k) => (
        <button key={k.id} type="button" className="t-kind" aria-pressed={k.id === active} onClick={() => onPick(k.id)}>
          <Sticker name={k.sticker} size={24} />
          {k.name}
        </button>
      ))}
    </div>
  );
}
export function People({members, me, onPick}: {members: Member[]; me: string; onPick: (id: string) => void}) {
  return (
    <ul className="t-people">
      {members.map((m) => (
        <li key={m.id}>
          <button type="button" className="t-person" aria-pressed={m.id === me} aria-label={`以 ${m.name} 的身份编辑`} onClick={() => onPick(m.id)}>
            <Avatar m={m} />
            {m.name}
            <em>{m.id === me ? '这是我' : '可编辑'}</em>
          </button>
        </li>
      ))}
    </ul>
  );
}
