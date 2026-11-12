export default async function (t) {
  await t.screen('practice');
  await t.tap('违法行为');
  await t.tap('下一题');

  await t.tap('安全行车，已做 0 / 6');
  await t.see('最高车速不得超过多少');
  await t.tap('120 公里/小时');
  await t.tap('下一题');
  await t.see(/安全行车\s*1\/6/);

  await t.tap('法律法规，已做 1 / 6');
  await t.see('第 2 / 6 题');
  await t.see('实习期是多长时间');
  await t.see(/安全行车\s*1\/6/);
}
