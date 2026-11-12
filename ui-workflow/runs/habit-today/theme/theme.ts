// 风格来源：Joi。颜色取自 style/measured.json 的中性色阶；没有品牌彩色（见 style/DESIGN.md 第 2 节）。
import {defineTheme} from '@astryxdesign/core/theme';
import {mobileBase} from '../../../shell/mobile-base';

export const theme = defineTheme({
  name: 'app',
  typography: {
    scale: {base: 17, ratio: 1.25},
    body: {family: 'system-ui', fallbacks: '-apple-system, "PingFang SC", "Noto Sans SC", sans-serif'},
    heading: {weight: 'bold', weights: {1: 'bold', 2: 'bold'}},
  },
  radius: {base: 8, multiplier: 1},
  tokens: {
    // 墨黑当强调色；深色模式下反过来（推导）
    '--color-accent': ['#181818', '#F2F2F2'],
    '--color-on-accent': ['#FFFFFF', '#141414'],
    '--color-background-body': ['#FEFEFE', '#0F0F0F'],
    '--color-background-card': ['#F6F6F6', '#1B1B1B'],
    '--color-background-muted': ['#EDEDED', '#262626'],
    '--color-text-primary': ['#181818', '#F2F2F2'],
    // 比参考里深，为了 4.5:1（见 DESIGN.md 第 10 节）
    '--color-text-secondary': ['#6B6B6B', '#A3A3A3'],
  },
  components: {
    ...mobileBase,
    // 成组内容：无边框的浅灰大圆角块
    card: {base: {borderStyle: 'none', borderRadius: 'var(--radius-container)'}},
    // 未完成是虚线方框，完成后变实心
    'checkbox-indicator': {base: {borderStyle: 'dashed', borderColor: 'var(--color-text-secondary)'}, checked: {borderStyle: 'solid'}},
  },
});
