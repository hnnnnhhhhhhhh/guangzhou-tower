const order = async (t) => t.page.locator('.t-stop .t-name').allTextContents();

export default async function (t) {
  await t.screen('plan');
  await t.see('京都四日');
  await t.see('第 1 天');
  await t.expect((await order(t)).join() === '伏见稻荷大社,清水寺,祇园花见小路', '第 1 天默认是三站，按时间排');

  await t.tap('在 伏见稻荷大社 之后加一站');
  await t.screen('stop');
  await t.page.getByLabel('地点').fill('锦市场');
  await t.tap('吃');
  await t.tap('保存');
  await t.screen('plan', 'plan-added');
  await t.expect((await order(t)).join() === '伏见稻荷大社,锦市场,清水寺,祇园花见小路', '插在两站之间，默认时间取中间');
  await t.see('小周 把「锦市场」加到了第 1 天');

  await t.tap('12:30 锦市场，小周加的，点开修改');
  await t.page.getByLabel('时间').fill('20:30');
  await t.tap('保存');
  await t.expect((await order(t)).join() === '伏见稻荷大社,清水寺,祇园花见小路,锦市场', '改了时间后重新排序');

  await t.tap('20:30 锦市场，小周加的，点开修改');
  await t.tap('删掉这一站');
  await t.screen('plan');
  await t.notSee('20:30');
  await t.see('小周 删掉了「锦市场」');
}
