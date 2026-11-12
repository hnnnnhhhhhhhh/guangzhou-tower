export default async function (t) {
  await t.screen('plan');
  await t.tap('想去');
  await t.screen('ideas');
  await t.see('3 人想去'); // 哲学之道票最多，排在最前
  await t.tap('我也想去 金阁寺');
  await t.see('2 人想去');
  await t.shot('ideas-voted');

  await t.tap('把 哲学之道 排进行程');
  await t.screen('schedule');
  await t.tap('第 3 天，11/22，0 站');
  await t.page.getByLabel('时间').fill('09:30');
  await t.tap('排进去');

  await t.screen('plan', 'plan-day3');
  await t.see('第 3 天');
  await t.see('哲学之道');
  await t.see('小周 把「哲学之道」排进了第 3 天');
  await t.tap('想去');
  await t.notSee('哲学之道');
}
