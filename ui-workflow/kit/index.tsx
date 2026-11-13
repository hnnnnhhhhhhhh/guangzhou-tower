// 通用零件。屏幕文件用它们拼界面，不写样式。
// 样子由 app/style.css 决定（scripts/style.mjs 从 style/visual.json 生成）。
// 每个零件都带 data-k 标记，门禁靠它核对“做出来的”和“参考图上读到的”是否一致。
import type {CSSProperties, ReactNode} from 'react';
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/600.css';
import '@fontsource/noto-sans-sc/700.css';
import './kit.css';

const skin = typeof location !== 'undefined' && new URLSearchParams(location.search).get('skin') === 'proto' ? 'proto' : 'styled';
type Gap = 1 | 2 | 3 | 4 | 5 | 6 | 8;
const gapOf = (gap: Gap): CSSProperties => ({gap: `var(--spacing-${gap})`});

// ---------- 骨架 ----------
export type TabItem = {id: string; label: string; icon: ReactNode; badge?: number};
/** 一屏。screen 是规格里的屏 id。foot 是固定在底部的操作；tabs 是底部导航（需要才给）。 */
export function Screen({screen, foot, tabs, tab, onTab, children}: {screen: string; foot?: ReactNode; tabs?: TabItem[]; tab?: string; onTab?: (id: string) => void; children: ReactNode}) {
  return (
    <div className="k-screen" data-screen={screen} data-skin={skin}>
      <main className="k-scroll">{children}</main>
      {foot ? <div className="k-foot">{foot}</div> : null}
      {tabs && onTab ? (
        <nav className="k-tabs" data-k="tabs" aria-label="主导航">
          {tabs.map((t) => (
            <button key={t.id} type="button" className="k-tab" aria-current={t.id === tab ? 'page' : undefined} aria-label={t.label} onClick={() => onTab(t.id)}>
              {t.icon}
              {t.label}
              {t.badge ? <i>{t.badge}</i> : null}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
export const Stack = ({gap = 3, children}: {gap?: Gap; children: ReactNode}) => (
  <div className="k-stack" style={gapOf(gap)}>
    {children}
  </div>
);
export const Row = ({children}: {children: ReactNode}) => <div className="k-row">{children}</div>;
export const Wrap = ({children}: {children: ReactNode}) => <div className="k-wrap">{children}</div>;
export const Grow = () => <div className="k-grow" />;
export const Divider = () => <hr className="k-divider" />;
/** key 变化时内容轻轻浮上来 */
export const Enter = ({id, gap = 5, children}: {id: string; gap?: Gap; children: ReactNode}) => (
  <div key={id} className="k-enter k-stack" style={gapOf(gap)}>
    {children}
  </div>
);

// ---------- 字 ----------
/** 页面标题。一屏一个。 */
export const Title = ({children}: {children: ReactNode}) => (
  <h1 className="k-title" data-k="title">
    {children}
  </h1>
);
export const H2 = ({children}: {children: ReactNode}) => <h2 className="k-h2">{children}</h2>;
/** 分类小标签（“今日”“教练”这类），不是按钮。 */
export const Label = ({children}: {children: ReactNode}) => <p className="k-label">{children}</p>;
export const Text = ({tone = '1', size = 'md', children}: {tone?: '1' | '2'; size?: 'sm' | 'md' | 'lg'; children: ReactNode}) => (
  <p className="k-text" data-tone={tone} data-size={size}>
    {children}
  </p>
);
/** 日期：月 / 日 分三段，分隔符小一档（细节规则 D03）。value 形如 "11/20"。 */
export function DateNum({value}: {value: string}) {
  const [m, d] = value.split('/');
  return (
    <span className="k-date" aria-label={`${m} 月 ${d} 日`}>
      {m}
      <i>/</i>
      {d}
    </span>
  );
}
/** 数字 + 单位或货币符号：符号小一档、基线对齐（细节规则 D04）。 */
export const Num = ({value, unit, prefix}: {value: ReactNode; unit?: string; prefix?: string}) => (
  <span className="k-num">
    {prefix ? <small>{prefix}</small> : null}
    {value}
    {unit ? <small>{unit}</small> : null}
  </span>
);

// ---------- 容器与清单 ----------
/** 一组内容的容器。它有没有底色、描边、阴影、圆角，由参考图决定，不由你决定。
    只给“能单独拿走的一个东西”用；页面的分区用 Section。 */
export const Surface = ({children}: {children: ReactNode}) => (
  <div className="k-surface" data-k="surface">
    {children}
  </div>
);
/** 页面的一个区：小标签或标题 + 内容。区与区之间用 Divider 或留白分开。 */
export function Section({label, title, end, children}: {label?: string; title?: string; end?: ReactNode; children: ReactNode}) {
  return (
    <section className="k-stack" style={gapOf(4)}>
      {label || title || end ? (
        <Row>
          <Stack gap={1}>
            {label ? <Label>{label}</Label> : null}
            {title ? <H2>{title}</H2> : null}
          </Stack>
          {end}
        </Row>
      ) : null}
      {children}
    </section>
  );
}
/** 同类的一组东西排成行。不要给每一项套 Surface。 */
export const List = ({children}: {children: ReactNode}) => (
  <ul className="k-list" data-k="list">
    {children}
  </ul>
);
/** 清单里的一行。lead 放在最前（时间、序号）；end 放在最后（状态、箭头）。给了 onPress 整行可点。 */
export function Item({lead, title, sub, extra, end, label, onPress}: {lead?: ReactNode; title: ReactNode; sub?: ReactNode; extra?: ReactNode; end?: ReactNode; label?: string; onPress?: () => void}) {
  const body = (
    <>
      {lead ? <span className="k-item-lead">{lead}</span> : null}
      <span className="k-item-main">
        <span className="k-text" data-size="lg">
          {title}
        </span>
        {sub ? (
          <span className="k-text" data-tone="2" data-size="sm">
            {sub}
          </span>
        ) : null}
        {extra}
      </span>
      {end}
    </>
  );
  return (
    <li>
      {onPress ? (
        <button type="button" className="k-item" data-k="row" aria-label={label} onClick={onPress}>
          {body}
        </button>
      ) : (
        <div className="k-item" data-k="row">
          {body}
        </div>
      )}
    </li>
  );
}

// ---------- 控件 ----------
/** 按钮。primary 一屏最多一个。 */
export const Btn = ({kind = 'primary', full, disabled, label, onPress, children}: {kind?: 'primary' | 'secondary' | 'quiet' | 'danger'; full?: boolean; disabled?: boolean; label?: string; onPress: () => void; children: ReactNode}) => (
  <button type="button" className="k-btn" data-k="btn" data-kind={kind} data-full={full ? 'true' : undefined} disabled={disabled} aria-label={label} onClick={onPress}>
    {children}
  </button>
);
export const IconBtn = ({label, onPress, children}: {label: string; onPress: () => void; children: ReactNode}) => (
  <button type="button" className="k-icon" aria-label={label} onClick={onPress}>
    {children}
  </button>
);
/** 状态：一个色点加文字。只用来表示真实状态，不是装饰，也不是按钮。 */
export const Status = ({tone = 'plain', children}: {tone?: 'plain' | 'good' | 'warn' | 'bad'; children: ReactNode}) => (
  <span className="k-chip" data-tone={tone}>
    {children}
  </span>
);
export const Meter = ({value, max, label, tone}: {value: number; max: number; label: string; tone?: 'warn'}) => (
  <div className="k-meter" data-tone={tone} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
    <i style={{width: `${max ? Math.min(100, (value / max) * 100) : 0}%`}} />
  </div>
);
export type Day = {id: string; week: string; day: string; past?: boolean; label: string};
/** 一周七天的选择条。 */
export const Week = ({days, active, onPick}: {days: Day[]; active: string; onPick: (id: string) => void}) => (
  <div className="k-week" data-k="week">
    {days.map((d) => (
      <button key={d.id} type="button" className="k-day" data-k="selectable" data-past={d.past} aria-pressed={d.id === active} aria-label={d.label} onClick={() => onPick(d.id)}>
        <small>{d.week}</small>
        <b>{d.day}</b>
      </button>
    ))}
  </div>
);
/** 两到四个选项里选一个。 */
export const Segments = ({items, active, onPick, label}: {items: {id: string; label: string}[]; active: string; onPick: (id: string) => void; label: string}) => (
  <div className="k-seg" role="group" aria-label={label}>
    {items.map((i) => (
      <button key={i.id} type="button" data-k="selectable" aria-pressed={i.id === active} onClick={() => onPick(i.id)}>
        {i.label}
      </button>
    ))}
  </div>
);
/** 一组可以多选的格子（时段、标签）。 */
export const Cells = ({items, onToggle}: {items: {id: string; label: string; on: boolean; disabled?: boolean; aria: string}[]; onToggle: (id: string) => void}) => (
  <div className="k-cells">
    {items.map((c) => (
      <button key={c.id} type="button" className="k-cell" data-k="selectable" aria-pressed={c.on} aria-label={c.aria} disabled={c.disabled} onClick={() => onToggle(c.id)}>
        {c.label}
      </button>
    ))}
  </div>
);

// ---------- 人、图、空 ----------
export type Person = {id: string; name: string; hue: number};
/** 头像：没有真实头像时用名字的一个字加颜色（细节规则 D08）。 */
export const Avatars = ({people}: {people: Person[]}) => (
  <span className="k-avatars" role="img" aria-label={people.map((p) => p.name).join('、')}>
    {people.map((p) => (
      <span key={p.id} className="k-avatar" style={{['--hue' as string]: p.hue}} aria-hidden>
        {p.name.slice(-1)}
      </span>
    ))}
  </span>
);
/** 图片位。有真图就传 src；没有就留空并写明（细节规则 D07），不要用表情顶替。ratio 是宽除以高。 */
export const ImageSlot = ({src, alt, ratio = 16 / 9}: {src?: string; alt: string; ratio?: number}) => (
  <div className="k-image" data-k="image" style={{aspectRatio: String(ratio)}}>
    {src ? <img src={src} alt={alt} /> : <span>暂无图片</span>}
  </div>
);
/** 空状态。注意：应用打开的第一屏不应该是空状态，示例数据要让第一屏有内容。 */
export const Empty = ({title, text, action}: {title: string; text?: string; action?: ReactNode}) => (
  <div className="k-empty" data-k="empty">
    <Text size="lg">{title}</Text>
    {text ? <Text tone="2">{text}</Text> : null}
    {action}
  </div>
);
