export default async function (t) {
  await t.screen('classes');
  await t.tap('教练');
  await t.tap('19:00 全身循环训练，可预约');
  await t.screen('manage');
  await t.page.getByLabel('人数上限').fill('2');
  await t.tap('保存');
  await t.see('已有 3 人预约，上限不能更小');
  await t.page.getByLabel('人数上限').fill('8');
  await t.tap('保存');
  await t.see('已保存');
  await t.tap('开始上课');
  await t.see('在上课');
  await t.see('结束课程');
  await t.tap('返回');
  await t.see('已约 3 / 8 人');
}
