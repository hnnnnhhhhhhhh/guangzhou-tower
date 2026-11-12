// 卷子顺序固定：每章轮流取题。答案按题库：前 8 题选对，最后 2 题故意选错。
const RIGHT = ['违法行为', '正确', '120 公里/小时', '150 米', '12 个月', '注意瞭望，确认安全后通过', '100 米以上', '立即停车，保护现场，抢救伤员并报警'];
const WRONG = ['30 日内', '可以跨越超车'];

export default async function (t) {
  await t.screen('practice');
  await t.tap('模考');
  await t.screen('mock');
  await t.see('还没考过');
  await t.tap('开始考试');
  await t.screen('mock-run');
  await t.see('05:00');

  const picks = [...RIGHT, ...WRONG];
  for (let i = 0; i < picks.length; i++) {
    await t.see(`第 ${i + 1} / 10 题`);
    await t.page.getByRole('radio', {name: picks[i], exact: true}).click();
    await t.notSee('正确答案'); // 考试过程中不提示对错
    await t.notSee('你选的');
    if (i < picks.length - 1) await t.tap('下一题');
  }
  await t.tap('交卷');

  await t.screen('mock-result');
  await t.see(/8\s*\/ 10/);
  await t.see('未通过');
  await t.see('答错的 2 题');
  await t.tap('去错题本重做');
  await t.screen('mistakes', 'mistakes-after-mock');
  await t.see('还有 2 题待巩固');
}
