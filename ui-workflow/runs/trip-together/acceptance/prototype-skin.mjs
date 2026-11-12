// 同一套结构的“原型皮”：没有风格，单独看信息结构。
export default async function (t) {
  await t.page.goto(t.page.url().split('?')[0] + '?skin=proto');
  await t.screen('plan', 'proto-plan');
  await t.see('京都四日');
  await t.tap('想去');
  await t.screen('ideas', 'proto-ideas');
  await t.tap('我也想去 金阁寺');
  await t.see('2 人想去');
}
