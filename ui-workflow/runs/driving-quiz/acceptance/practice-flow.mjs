export default async function (t) {
  await t.screen('practice');
  await t.see('第 1 / 6 题');
  await t.see('属于什么行为');
  await t.notSee('不再叫“违章”'); // 解析在作答前不出现
  await t.tap('违法行为');
  await t.see('正确');
  await t.see('不再叫“违章”');
  await t.shot('practice-right');
  await t.tap('下一题');

  await t.see('第 2 / 6 题');
  await t.tap('6 个月');
  await t.see('你选的');
  await t.see('12 个月为实习期');
  await t.shot('practice-wrong');
  await t.tap('下一题');
  await t.see('第 3 / 6 题');
  await t.see(/法律法规\s*2\/6/);

  await t.tap('错题');
  await t.screen('mistakes');
  await t.see('还有 1 题待巩固');
  await t.see('实习期是多长时间');
}
