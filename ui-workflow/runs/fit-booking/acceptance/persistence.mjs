export default async function (t) {
  await t.screen('classes');
  await t.tap('20:00 普拉提垫上，可预约');
  await t.tap('立即约课');
  await t.reload();
  await t.screen('classes');
  await t.tap('我的预约');
  await t.see('普拉提垫上');
}
