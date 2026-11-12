export default async function (t) {
  await t.screen('practice');
  await t.tap('违章行为'); // 故意答错，进错题本
  await t.tap('错题');
  await t.screen('mistakes');
  await t.see('还有 1 题待巩固');

  await t.tap('违章行为'); // 在错题本里再错一次：还在
  await t.tap('下一题');
  await t.see('还有 1 题待巩固');

  await t.tap('违法行为'); // 答对：移出
  await t.tap('完成');
  await t.screen('mistakes', 'mistakes-empty');
  await t.see('没有错题');
}
