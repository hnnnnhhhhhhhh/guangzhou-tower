import {fullRound} from './_steps.mjs';

export default async function (t) {
  await t.screen('home');
  await fullRound(t);
  await fullRound(t, '再学 10 个');
  await t.see(/20\s*\/ 60 词/);

  await t.tap('词表');
  await t.screen('words');
  await t.expect((await t.count('学习中')) === 20, '词表里应该有 20 个“学习中”');
  await t.expect((await t.count('未学')) === 40, '词表里应该有 40 个“未学”');
  await t.tap('返回');
  await t.screen('home', 'home-done');
}
