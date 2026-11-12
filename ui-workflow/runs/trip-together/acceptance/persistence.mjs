export default async function (t) {
  await t.screen('plan');
  await t.tap('同行 4 人');
  await t.screen('members');
  await t.tap('完成');
  await t.tap('想去');
  await t.tap('加一个想去的地方');
  await t.screen('idea-new');
  await t.page.getByLabel('地点').fill('鸭川');
  await t.tap('保存');
  await t.screen('ideas');
  await t.see('鸭川');
  await t.reload();
  await t.tap('想去');
  await t.see('鸭川');
}
