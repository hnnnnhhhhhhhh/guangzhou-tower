export default async function (t) {
  await t.screen('classes');
  await t.tap('教练');
  await t.screen('schedule');
  const pressed = '[data-k="week"] button[aria-pressed="true"]';
  await t.page.locator(`${pressed} + button + button`).click(); // 后天
  await t.see('1 节');
  await t.tap('每周重复（再排 3 周）');
  await t.tap('15:00');
  await t.see('2 节');
  await t.see('私教课');
  await t.shot('schedule-opened');

  await t.tap('学员');
  await t.screen('classes'); // 切回学员端时，停在刚才选的那一天
  await t.tap('15:00 私教课，可预约');
  await t.tap('立即约课');
  await t.see('你已经约了这节课');

  // 每周重复：七天后的同一时段也有课
  await t.nextDay(7);
  await t.screen('classes');
  await t.page.locator(`${pressed} + button + button`).click();
  await t.see('私教课');
}
