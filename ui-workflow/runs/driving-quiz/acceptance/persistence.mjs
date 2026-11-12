export default async function (t) {
  await t.screen('practice');
  await t.tap('违法行为');
  await t.tap('下一题');
  await t.tap('12 个月');
  await t.tap('下一题');
  await t.reload();
  await t.screen('practice');
  await t.see('第 3 / 6 题');
  await t.see(/法律法规\s*2\/6/);
  await t.see('申请换证');
}
