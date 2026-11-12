// 各场景共用的操作
/** 把当前这一轮剩下的词全部答“记住了”，直到进入小结 */
export async function finishRound(t) {
  for (let i = 0; i < 80; i++) {
    if ((await t.page.locator('[data-screen="summary"]').count()) > 0) return;
    await t.tap('看答案');
    await t.tap('记住了');
  }
  throw new Error('一轮超过 80 次还没结束');
}
/** 从首页开始，学完一整轮，回到首页 */
export async function fullRound(t, startWith = '开始学习') {
  await t.tap(startWith);
  await finishRound(t);
  await t.tap('回到首页');
  await t.screen('home', 'home-done');
}
