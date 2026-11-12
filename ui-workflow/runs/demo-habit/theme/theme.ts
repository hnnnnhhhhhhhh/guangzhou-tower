// 风格的机器可执行部分。所有颜色、字阶、圆角只在这里出现。
// 冒烟测试用的是手写的示例值，不是从参考 app 提炼的。
import {defineTheme} from '@astryxdesign/core/theme';
import {mobileBase} from '../../../shell/mobile-base';

export const theme = defineTheme({
  name: 'app',
  typography: {
    scale: {base: 16, ratio: 1.2},
    body: {family: 'system-ui', fallbacks: '-apple-system, "PingFang SC", "Noto Sans SC", sans-serif'},
    heading: {weight: 'semibold', weights: {1: 'bold'}},
  },
  radius: {base: 6, multiplier: 1},
  components: {...mobileBase},
  tokens: {
    '--color-accent': ['#1F7A4D', '#4CC38A'],
    '--color-on-accent': ['#FFFFFF', '#06240F'],
    '--color-background-body': ['#F6F5F1', '#111311'],
  },
});
