export default async function (t) {
  await t.screen('home');
  await t.tap('开始学习');
  for (let i = 0; i < 3; i++) {
    await t.tap('看答案');
    await t.tap('记住了');
  }
  await t.see('3 / 10');
  await t.tap('退出本轮');

  await t.screen('home', 'home-partial');
  await t.see('新词 7');
  await t.see(/7\s*个词/);
  await t.see(/3\s*\/ 60 词/);

  // 再进去，接着学的是第 4 个词，而不是从头
  await t.tap('开始学习');
  await t.see('assess');
  await t.see('0 / 7');
}
