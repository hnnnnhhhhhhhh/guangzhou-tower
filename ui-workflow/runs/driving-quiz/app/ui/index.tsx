// 这个应用自己的界面零件。屏幕文件只组合它们。
import type {ReactNode} from 'react';
import {BookOpen, NotebookPen, Timer} from 'lucide-react';
import {STICKERS} from '../stickers';
import type {StickerName} from '../stickers';
// 字体随应用打包，保证每台手机上看到的是同一套字
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/900.css';
import '@fontsource/noto-serif-sc/500.css';
import '@fontsource/noto-serif-sc/700.css';
import './ui.css';

export type Tab = 'practice' | 'mock' | 'mistakes';
const TABS: {id: Tab; label: string; icon: ReactNode}[] = [
  {id: 'practice', label: '练习', icon: <BookOpen size={20} aria-hidden />},
  {id: 'mock', label: '模考', icon: <Timer size={20} aria-hidden />},
  {id: 'mistakes', label: '错题', icon: <NotebookPen size={20} aria-hidden />},
];

export function Screen({screen, tone = 'road', tab, onTab, footer, children}: {screen: string; tone?: 'road' | 'paper'; tab?: Tab; onTab?: (t: Tab) => void; footer?: ReactNode; children: ReactNode}) {
  return (
    <div className="q-screen" data-screen={screen} data-tone={tone}>
      <main className="q-scroll">{children}</main>
      {footer}
      {tab && onTab ? (
        <nav className="q-tabs-wrap" aria-label="主导航">
          <div className="q-tabs">
            {TABS.map((t) => (
              <button key={t.id} type="button" className="q-tab" aria-current={t.id === tab ? 'page' : undefined} onClick={() => onTab(t.id)}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export const Sticker = ({name, size = 32}: {name: StickerName; size?: 32 | 48 | 72 | 96}) => <img className="q-sticker" src={STICKERS[name]} width={size} height={size} alt="" />;
export const Stack = ({gap = 3, children}: {gap?: 1 | 2 | 3 | 4 | 6; children: ReactNode}) => (
  <div className="q-stack" style={{gap: `var(--spacing-${gap})`}}>
    {children}
  </div>
);
export const Row = ({children}: {children: ReactNode}) => <div className="q-row">{children}</div>;
export const Grow = () => <div className="q-grow" />;
/** key 变化时内容轻轻浮上来 */
export const Enter = ({id, children}: {id: string; children: ReactNode}) => (
  <div key={id} className="q-enter q-stack" style={{gap: 'var(--spacing-6)', flex: 1}}>
    {children}
  </div>
);

export function Chapters({items, active, onPick}: {items: {id: string; name: string; sticker: StickerName; done: number; total: number}[]; active: string; onPick: (id: string) => void}) {
  return (
    <div className="q-chapters">
      {items.map((c) => (
        <button key={c.id} type="button" className="q-chapter" aria-pressed={c.id === active} aria-label={`${c.name}，已做 ${c.done} / ${c.total}`} onClick={() => onPick(c.id)}>
          <Sticker name={c.sticker} />
          {c.name}
          <b>
            {c.done}/{c.total}
          </b>
        </button>
      ))}
    </div>
  );
}

export const Bar = ({value, max, label}: {value: number; max: number; label: string}) => (
  <div className="q-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
    <i style={{width: `${max ? (value / max) * 100 : 0}%`}} />
  </div>
);
export const Count = ({children}: {children: ReactNode}) => <p className="q-count">{children}</p>;
export const QuestionText = ({size = 'main', children}: {size?: 'main' | 'title'; children: ReactNode}) => (
  <h1 className="q-text" data-size={size}>
    {children}
  </h1>
);
export const Title = ({children}: {children: ReactNode}) => <h1 className="q-title">{children}</h1>;
export const Note = ({children}: {children: ReactNode}) => <p className="q-note">{children}</p>;
export const Body = ({children}: {children: ReactNode}) => <p className="q-body">{children}</p>;
export const Hero = ({children}: {children: ReactNode}) => <div className="q-hero">{children}</div>;

const LETTERS = ['A', 'B', 'C', 'D'];
export type PlateState = 'idle' | 'right' | 'wrong' | 'dim';
/** 练习用的选项：一块块路牌。答完后对的变绿牌，选错的变红框。 */
export function Plates({options, states, onPick}: {options: string[]; states: PlateState[]; onPick?: (index: number) => void}) {
  return (
    <div className="q-plates">
      {options.map((o, i) => (
        <button
          key={i}
          type="button"
          className="q-plate"
          data-state={states[i]}
          aria-label={states[i] === 'right' ? `${o}，正确` : states[i] === 'wrong' ? `${o}，你选的` : o}
          disabled={!onPick}
          onClick={onPick ? () => onPick(i) : undefined}>
          <i>{LETTERS[i]}</i>
          <span>{o}</span>
          {states[i] === 'right' ? <em>正确</em> : states[i] === 'wrong' ? <em>你选的</em> : null}
        </button>
      ))}
    </div>
  );
}
export const Why = ({children}: {children: ReactNode}) => (
  <div className="q-why">
    <Sticker name="light-bulb" />
    <p>{children}</p>
  </div>
);

export const Btn = ({kind = 'main', onPress, children}: {kind?: 'main' | 'quiet'; onPress: () => void; children: ReactNode}) => (
  <button type="button" className="q-btn" data-kind={kind} onClick={onPress}>
    {children}
  </button>
);
export const LinkBtn = ({onPress, children}: {onPress: () => void; children: ReactNode}) => (
  <button type="button" className="q-link" onClick={onPress}>
    {children}
  </button>
);
export const Facts = ({items}: {items: [string, string][]}) => (
  <ul className="q-facts">
    {items.map(([k, v]) => (
      <li key={k}>
        <span>{k}</span>
        <b>{v}</b>
      </li>
    ))}
  </ul>
);

/** 模考用的答卷 */
export const SheetHead = ({left, timer}: {left: ReactNode; timer: string}) => (
  <div className="q-sheet-head">
    <Count>{left}</Count>
    <span className="q-timer" role="timer" aria-label="剩余时间">
      {timer}
    </span>
  </div>
);
export function Options({options, picked, onPick}: {options: string[]; picked?: number; onPick: (index: number) => void}) {
  return (
    <div className="q-options" role="radiogroup">
      {options.map((o, i) => (
        <button key={i} type="button" role="radio" className="q-option" aria-checked={picked === i} onClick={() => onPick(i)}>
          <i />
          {o}
        </button>
      ))}
    </div>
  );
}
export const SheetNav = ({children}: {children: ReactNode}) => <div className="q-nav">{children}</div>;
export const Score = ({score, total}: {score: number; total: number}) => (
  <p className="q-score">
    {score}
    <small> / {total}</small>
  </p>
);
export const Stamp = ({pass}: {pass: boolean}) => (
  <span className="q-stamp" data-pass={pass}>
    {pass ? '合格' : '未通过'}
  </span>
);
export const List = ({children}: {children: ReactNode}) => <ul className="q-list">{children}</ul>;
export const Item = ({title, sub}: {title: string; sub?: string}) => (
  <li>
    <p>{title}</p>
    {sub ? <p>{sub}</p> : null}
  </li>
);
