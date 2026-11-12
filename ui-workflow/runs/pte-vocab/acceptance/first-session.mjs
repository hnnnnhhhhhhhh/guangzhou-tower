export default async function (t) {
  await t.screen('home');
  await t.see('新词 10');
  await t.see(/10\s*个词/);

  await t.tap('开始学习');
  await t.screen('study');
  await t.see('0 / 10');
  await t.see('analyse');
  await t.notSee('分析'); // 答案在点之前不能露出来

  await t.tap('看答案');
  await t.see('分析');
  await t.shot('study-revealed');
  await t.tap('没记住');
  await t.see('approach');
  await t.see('0 / 10'); // 没记住不算过

  for (let i = 0; i < 9; i++) {
    await t.tap('看答案');
    await t.tap('记住了');
  }
  await t.see('9 / 10');
  await t.see('analyse'); // 没记住的词回来了
  await t.tap('看答案');
  await t.tap('记住了');

  await t.screen('summary');
  await t.see('10 个新词');
  await t.see('90%');
  await t.see('这几个多看一眼');
  await t.see('明天有 10 个词到期复习');

  await t.tap('回到首页');
  await t.screen('home', 'home-done');
  await t.see('今天学完了');
  await t.see(/10\s*\/ 60 词/);
  await t.see('连续 1 天');
}
