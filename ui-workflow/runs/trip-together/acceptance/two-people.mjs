// 同一个行程开两个窗口：一边改，另一边不用刷新就看到。
export default async function (t) {
  await t.screen('plan');
  const other = await t.page.context().newPage();
  await other.goto(t.page.url());
  await other.getByRole('button', {name: '同行 4 人'}).click();
  await other.getByRole('button', {name: '以 小林 的身份编辑'}).click();
  await other.getByRole('button', {name: '完成', exact: true}).click();
  await other.getByRole('button', {name: '第 2 天，11/21，2 站'}).click();
  await other.getByRole('button', {name: '加一站', exact: true}).click();
  await other.getByLabel('地点').fill('天龙寺');
  await other.getByLabel('时间').fill('10:30');
  await other.getByRole('button', {name: '保存', exact: true}).click();
  await other.getByText('天龙寺').first().waitFor();

  // 回到第一个窗口：没有刷新
  await t.see('小林 把「天龙寺」加到了第 2 天');
  await t.tap('第 2 天，11/21，3 站');
  await t.see('天龙寺');
  await t.shot('plan-synced');
  await other.close();
}
