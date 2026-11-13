// 由 scripts/style.mjs 从 style/visual.json 生成，不要手改。参考：Equinox+
import {defineTheme} from '@astryxdesign/core/theme';

export const theme = defineTheme({
  name: 'app',
  typography: {scale: {base: 17, ratio: 1.2}, body: {family: 'Noto Sans SC', fallbacks: 'system-ui, -apple-system, sans-serif'}},
  tokens: {
    '--color-background-body': ['#000000', '#000000'],
    '--color-background-surface': ['#000000', '#000000'],
    '--color-background-card': ['#151516', '#151516'],
    '--color-background-muted': ['#151516', '#151516'],
    '--color-text-primary': ['#FFFFFF', '#FFFFFF'],
    '--color-text-secondary': ['#A5A7AA', '#A5A7AA'],
    '--color-accent': ['#FFFFFF', '#FFFFFF'],
    '--color-on-accent': ['#000000', '#000000'],
    '--radius-container': '0px',
    '--radius-element': '0px',
    '--radius-inner': '0px',
  },
});
