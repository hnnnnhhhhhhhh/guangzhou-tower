import {finishRound, fullRound} from './_steps.mjs';

export default async function (t) {
  await t.screen('home');
  await fullRound(t);

  await t.nextDay();
  await t.screen('home', 'home-day2');
  await t.see('复习 10');
  await t.see('新词 10');
  await t.see(/20\s*个词/);

  await t.tap('开始学习');
  await t.screen('study', 'study-review');
  await t.see('复习'); // 先出复习
  await t.see('analyse');
  await finishRound(t);

  await t.screen('summary', 'summary-day2');
  await t.see('10 个新词');
  await t.see('复习了');
  await t.see('100%');
  await t.tap('回到首页');
  await t.see('连续 2 天');
  await t.see(/20\s*\/ 60 词/);

  await t.tap('词表');
  await t.screen('words');
  await t.expect((await t.count('分析 · 2 天后复习')) === 1, 'analyse 复习答对后，下次复习应该在 2 天后');
}
