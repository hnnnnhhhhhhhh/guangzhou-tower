export default async function (t) {
  await t.screen('classes');
  await t.see('全身循环训练');
  await t.see('已约 3 / 6 人');
  await t.tap('19:00 全身循环训练，可预约');
  await t.screen('class');
  await t.tap('立即约课');
  await t.see('你已经约了这节课');
  await t.see(/4\s*\/ 6 人/);
  await t.shot('class-booked');
  await t.tap('返回');
  await t.tap('我的预约');
  await t.screen('bookings');
  await t.see('全身循环训练');

  await t.tap('消息');
  await t.tap('课程');
  await t.tap('教练');
  await t.screen('schedule');
  await t.tap('消息');
  await t.screen('messages');
  await t.see('学员 我 约了');

  await t.tap('排课');
  await t.tap('学员');
  await t.tap('19:00 全身循环训练，可预约');
  await t.tap('取消预约');
  await t.see('立即约课');
  await t.see(/3\s*\/ 6 人/);
}
