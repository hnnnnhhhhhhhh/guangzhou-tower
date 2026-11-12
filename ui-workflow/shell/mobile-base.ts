// 移动端基线：Astryx 的默认尺寸是给鼠标定的，这里把可点的东西统一抬到 44px 触控高度。
// 每个 run 的 theme.ts 都要展开它： components: {...mobileBase, /* 本风格自己的覆盖 */}
export const mobileBase = {
  tab: {base: {minHeight: '44px'}},
  button: {base: {minHeight: '44px'}},
} as const;
