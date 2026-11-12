// 视觉配方库：屏幕文件只组合这些配方、填参数，不自己写 CSS。
// 每个配方对应参考图里的一种“做法”，样式在 recipes.css，数值来自那里的变量。
import type {CSSProperties, ReactNode} from 'react';
import './recipes.css';

export type Hue = 'blue' | 'green' | 'amber' | 'rose' | 'violet';
const hue = (h?: Hue) => (h ? ({'--rx-chip-hue': `var(--rx-hue-${h})`} as CSSProperties) : undefined);
// 间距只能取组件库刻度上的档位（4px 一档）
const GAP = {1: 'var(--spacing-1)', 2: 'var(--spacing-2)', 3: 'var(--spacing-3)', 4: 'var(--spacing-4)', 6: 'var(--spacing-6)', 8: 'var(--spacing-8)'} as const;
type Gap = keyof typeof GAP;

/** 一屏：带色调的底 + 滚动内容 + 可选的底部浮层。screen 用于验收测试识别当前在哪一屏。 */
export function Screen({screen, dock, children}: {screen: string; dock?: ReactNode; children: ReactNode}) {
  return (
    <div className="rx-ground" data-screen={screen}>
      <span className="rx-ground-blob" data-at="top" />
      <span className="rx-ground-blob" data-at="bottom" />
      <div className="rx-screen">
        <main className="rx-screen-scroll" data-dock={dock ? 'true' : 'false'}>
          {children}
        </main>
        {dock ? <div className="rx-dock">{dock}</div> : null}
      </div>
    </div>
  );
}

/** 两行同字号的标题：上灰下黑。end 放右侧的小操作。 */
export function TwoToneTitle({eyebrow, title, end}: {eyebrow: string; title: string; end?: ReactNode}) {
  return (
    <div className="rx-title-row">
      <h1 className="rx-title">
        <span className="rx-title-eyebrow">{eyebrow}</span>
        {title}
      </h1>
      {end}
    </div>
  );
}

/** 白、厚、软的卡。给了 onPress 就是整张可点。 */
export function SoftCard({
  tone = 'surface',
  tall,
  onPress,
  label,
  children,
}: {
  tone?: 'surface' | 'sunk' | 'ink';
  /** 撑到大半屏高，给“整屏只有这一张卡”的场合 */
  tall?: boolean;
  onPress?: () => void;
  label?: string;
  children: ReactNode;
}) {
  return onPress ? (
    <button type="button" className="rx-card" data-tone={tone} onClick={onPress} aria-label={label}>
      {children}
    </button>
  ) : (
    <div className="rx-card" data-tone={tone} data-tall={tall ? 'true' : undefined}>
      {children}
    </div>
  );
}

/** 一叠卡：depth 是后面还露出几张（0–2）。cardKey 变了会播放“下一张浮上来”。 */
export function Deck({depth, cardKey, children}: {depth: number; cardKey: string; children: ReactNode}) {
  return (
    <div className="rx-deck" data-depth={Math.max(0, Math.min(2, depth))}>
      <div key={cardKey} className="rx-deck-enter">
        {children}
      </div>
    </div>
  );
}

export function Chip({kind = 'soft', hue: h, size = 'md', children}: {kind?: 'soft' | 'tint' | 'dashed' | 'bubble'; hue?: Hue; size?: 'md' | 'lg'; children: ReactNode}) {
  return (
    <span className="rx-chip" data-kind={kind} data-size={size} style={hue(h)}>
      {children}
    </span>
  );
}
export const Chips = ({children}: {children: ReactNode}) => <div className="rx-chips">{children}</div>;

/** 一句话，里面可以嵌 Chip 当数字块。 */
export const Sentence = ({children}: {children: ReactNode}) => <p className="rx-sentence">{children}</p>;
/** 句子里不可拆开的一小段（文字 + 它的数字块），整段一起换行。 */
export const Phrase = ({children}: {children: ReactNode}) => <span className="rx-phrase">{children}</span>;
export const Word = ({children}: {children: ReactNode}) => <p className="rx-word">{children}</p>;
export const Big = ({value, unit, size = 'hero'}: {value: ReactNode; unit?: string; size?: 'hero' | 'title'}) => (
  <span className="rx-big" data-size={size}>
    {value}
    {unit ? <small>{unit}</small> : null}
  </span>
);
export const P = ({tone = '1', size = 'md', weight, children}: {tone?: '1' | '2'; size?: 'sm' | 'md' | 'lg'; weight?: 'medium'; children: ReactNode}) => (
  <p className="rx-text" data-tone={tone} data-size={size} data-weight={weight}>
    {children}
  </p>
);
export const Label = ({children}: {children: ReactNode}) => <p className="rx-label">{children}</p>;
export const Row = ({children}: {children: ReactNode}) => <div className="rx-row">{children}</div>;
export const Stack = ({gap = 4, children}: {gap?: Gap; children: ReactNode}) => (
  <div className="rx-stack" style={{gap: GAP[gap]}}>
    {children}
  </div>
);
/** 占满卡片剩余高度并把内容垂直居中。 */
export const Fill = ({children}: {children: ReactNode}) => <div className="rx-fill">{children}</div>;
export const Divider = () => <hr className="rx-divider" />;
/** 内容出现时轻轻浮上来。 */
export const Reveal = ({children}: {children: ReactNode}) => <div className="rx-reveal rx-stack" style={{gap: GAP[4]}}>{children}</div>;

export function Meter({value, max, label}: {value: number; max: number; label: string}) {
  return (
    <div className="rx-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <i style={{width: `${max ? Math.min(100, (value / max) * 100) : 0}%`}} />
    </div>
  );
}

export type DayDot = {label: string; state: 'done' | 'today' | 'idle'};
export function WeekDots({days}: {days: DayDot[]}) {
  return (
    <div className="rx-dots">
      {days.map((d, i) => (
        <span key={i} className="rx-dot" data-state={d.state}>
          <i />
          {d.label}
        </span>
      ))}
    </div>
  );
}

export function Btn({kind = 'ink', hue: h, fit, onPress, children}: {kind?: 'ink' | 'soft' | 'tint' | 'ghost'; hue?: Hue; fit?: boolean; onPress: () => void; children: ReactNode}) {
  return (
    <button type="button" className="rx-btn" data-kind={kind} data-fit={fit ? 'true' : undefined} style={hue(h)} onClick={onPress}>
      {children}
    </button>
  );
}
export const BtnRow = ({children}: {children: ReactNode}) => <div className="rx-btn-row">{children}</div>;
export function IconBtn({label, onPress, children}: {label: string; onPress: () => void; children: ReactNode}) {
  return (
    <button type="button" className="rx-icon-btn" aria-label={label} onClick={onPress}>
      {children}
    </button>
  );
}
export const List = ({children}: {children: ReactNode}) => <ul className="rx-list">{children}</ul>;
export const Item = ({children}: {children: ReactNode}) => <li>{children}</li>;
