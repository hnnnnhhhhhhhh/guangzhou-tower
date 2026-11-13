export default async function (t) {
  await t.screen('classes');
  await t.tap('我的预约');
  await t.see('核心力量'); // 示例里我已经约了明天晚上七点的课
  await t.tap('课程');
  await t.tap('教练');
  await t.page.locator('[data-k="week"] button[aria-pressed="true"] + button').click();
  await t.tap('19:00 核心力量，可预约');
  await t.screen('manage');
  await t.tap('删除课程');
  await t.screen('schedule');
  await t.notSee('核心力量');

  await t.tap('学员');
  await t.tap('消息');
  await t.screen('messages');
  await t.see('被教练取消了');
  await t.tap('我的预约');
  await t.screen('bookings');
  await t.see('还没有预约');
}
