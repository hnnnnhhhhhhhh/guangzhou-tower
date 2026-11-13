// 门禁里的“现在”是早上九点
export default async function (t) {
  await t.screen('classes');
  await t.tap('07:00 晨间拉伸，已结束');
  await t.see('课程已结束');
  await t.see('不能预约');
  await t.tap('返回');

  // 明天十点的臀腿力量 4 / 4 已约满
  const tomorrow = t.page.locator('[data-k="week"] button[aria-pressed="true"] + button');
  await tomorrow.click();
  await t.tap('10:00 臀腿力量，已约满');
  await t.see('名额已满');
  await t.shot('class-full');
}
