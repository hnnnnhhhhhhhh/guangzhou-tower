export default async function (t) {
  await t.screen('plan');
  await t.tap('加一站');
  await t.screen('stop');
  await t.tap('保存');
  await t.see('先写上地点的名字');
  await t.page.getByLabel('地点').fill('二条城');
  await t.page.getByLabel('时间').fill('25:00');
  await t.tap('保存');
  await t.see('时间写成 10:30 这样的格式');
  await t.screen('stop'); // 没有离开这一屏
  await t.page.getByLabel('时间').fill('16:00');
  await t.tap('保存');
  await t.screen('plan');
  await t.see('二条城');
}
