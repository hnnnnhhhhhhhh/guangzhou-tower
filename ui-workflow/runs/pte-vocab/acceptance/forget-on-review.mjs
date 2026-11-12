import {finishRound, fullRound} from './_steps.mjs';

export default async function (t) {
  await t.screen('home');
  await fullRound(t);
  await t.nextDay();

  await t.tap('开始学习');
  await t.see('analyse');
  await t.tap('看答案');
  await t.tap('没记住');
  await t.see('approach');
  await t.see('0 / 20');
  await finishRound(t);
  await t.see('95%');
  await t.tap('回到首页');

  await t.tap('词表');
  await t.screen('words');
  await t.expect((await t.count('分析 · 明天复习')) === 1, '复习时没记住的词应该明天再复习');
  await t.expect((await t.count('方法；途径 · 2 天后复习')) === 1, '复习时记住的词应该 2 天后复习');
}
