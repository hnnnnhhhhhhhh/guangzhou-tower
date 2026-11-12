// 把从 ABY Journal 高清图里读出的数值，映射进 Astryx 的主题。
// 规范（字阶、间距刻度、圆角层级、阴影层级）全部是 Astryx 自己的，这里只填数。
import {defineTheme} from '@astryxdesign/core/theme';

export const theme = defineTheme({
  name: 'app',
  typography: {
    // 手机正文 17；比例 1.2 → 标题 1 ≈ 29，展示字 1 ≈ 51（组件库规定的最大字）
    scale: {base: 17, ratio: 1.2},
    body: {family: 'system-ui', fallbacks: '-apple-system, "PingFang SC", "Noto Sans SC", sans-serif'},
    heading: {weight: 'semibold'},
  },
  radius: {base: 8, multiplier: 1},
  tokens: {
    '--color-background-body': ['#F1F1F2', '#F1F1F2'],
    '--color-background-surface': ['#F1F1F2', '#F1F1F2'],
    '--color-background-card': ['#FFFFFF', '#FFFFFF'],
    '--color-background-muted': ['#E9E9EB', '#E9E9EB'],
    '--color-text-primary': ['#111112', '#111112'],
    '--color-text-secondary': ['#6B6B70', '#6B6B70'],
    '--color-accent': ['#111112', '#111112'],
    '--color-on-accent': ['#FFFFFF', '#FFFFFF'],
    // 阴影层级沿用 Astryx 的 low / med / high，只把形状换成参考图里那种又淡又散的
    '--shadow-low': '0 0.5px 1px rgba(17,17,18,0.04), 0 6px 18px rgba(17,17,18,0.045), 0 22px 56px rgba(17,17,18,0.07)',
    '--shadow-med': '0 1px 2px rgba(17,17,18,0.05), 0 12px 32px rgba(17,17,18,0.1), 0 32px 72px rgba(17,17,18,0.1)',
  },
  components: {
    // 卡片：无描边，靠阴影浮起；圆角就是组件库的“容器”那一档（基数 8 时为 24）
    card: {base: {borderStyle: 'none'}},
    // 按钮：胶囊；触控高度
    button: {base: {borderRadius: 'var(--radius-full)', minHeight: 'var(--spacing-11)'}, 'size:lg': {minHeight: 'calc(var(--spacing-7) * 2)', fontWeight: 'var(--font-weight-semibold)'}},
    // 标签：虚线描边的浅色胶囊
    token: {base: {borderRadius: 'var(--radius-full)', borderStyle: 'dashed', borderWidth: '1.5px', borderColor: 'color-mix(in srgb, currentColor 40%, transparent)'}},
  },
});
