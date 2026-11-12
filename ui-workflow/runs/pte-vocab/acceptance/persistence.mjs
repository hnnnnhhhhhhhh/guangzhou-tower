import {fullRound} from './_steps.mjs';

export default async function (t) {
  await t.screen('home');
  await fullRound(t);
  await t.reload();
  await t.screen('home', 'home-done');
  await t.see('今天学完了');
  await t.see(/10\s*\/ 60 词/);
  await t.see('连续 1 天');
}
