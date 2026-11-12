// 气质参考：Polarsteps 的行程规划屏（Mobbin 高清图，见 style/VISUAL.md）。颜色从图上量。
// 规范用 Astryx：字阶 = 基准 17 × 比例 1.2；圆角基数 6 → 控件 12 / 容器 18 / 页面级 42。
import {defineTheme} from '@astryxdesign/core/theme';

export const theme = defineTheme({
  name: 'app',
  typography: {scale: {base: 17, ratio: 1.2}, body: {family: 'Noto Sans SC', fallbacks: 'system-ui, -apple-system, sans-serif'}},
  radius: {base: 6, multiplier: 1},
  tokens: {
    '--color-background-body': ['#FDFEFE', '#FDFEFE'],
    '--color-background-card': ['#FFFFFF', '#FFFFFF'],
    '--color-background-muted': ['#F0F1F3', '#F0F1F3'],
    '--color-text-primary': ['#061A28', '#061A28'],
    '--color-text-secondary': ['#566572', '#566572'],
    '--color-accent': ['#061A28', '#061A28'],
    '--color-on-accent': ['#FFFFFF', '#FFFFFF'],
    '--shadow-low': '0 1px 0 rgba(6,26,40,0.04), 0 6px 16px rgba(6,26,40,0.05)',
    '--shadow-med': '0 2px 4px rgba(6,26,40,0.06), 0 14px 32px rgba(6,26,40,0.12)',
  },
  components: {
    button: {base: {borderRadius: 'var(--radius-full)', minHeight: 'var(--spacing-11)', fontWeight: 'var(--font-weight-semibold)'}, 'size:lg': {minHeight: 'calc(var(--spacing-7) * 2)'}},
  },
});
