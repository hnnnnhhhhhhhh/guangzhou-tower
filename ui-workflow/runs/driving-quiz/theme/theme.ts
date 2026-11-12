// 气质参考：Commons 的答题屏（Mobbin 高清图，来源见 style/VISUAL.md）。颜色是从图上量的。
// 规范全部用 Astryx 自己的：字阶由基准 17 和比例 1.2 生成，间距和圆角用它的刻度。
import {defineTheme} from '@astryxdesign/core/theme';

export const theme = defineTheme({
  name: 'app',
  typography: {
    scale: {base: 17, ratio: 1.2},
    body: {family: 'system-ui', fallbacks: '-apple-system, "PingFang SC", "Noto Sans SC", sans-serif'},
  },
  tokens: {
    '--color-background-body': ['#F8F8F8', '#F8F8F8'],
    '--color-background-muted': ['#E8E7E3', '#E8E7E3'],
    '--color-text-primary': ['#0A0A0A', '#0A0A0A'],
    '--color-text-secondary': ['#5C5C58', '#5C5C58'],
    '--color-accent': ['#000098', '#000098'],
    '--color-on-accent': ['#FFFFFF', '#FFFFFF'],
    '--color-error-muted': ['#F0BCB4', '#F0BCB4'],
  },
});
