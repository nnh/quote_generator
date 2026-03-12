function test_getTrialTermInfo() {
  const sheets = get_sheets();
  const trialSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
  const targetRangeAddress = "D32:E40";
  const targetRange = trialSheet.getRange(targetRangeAddress);
  targetRange.clearContent();
  const testData = [
    ["1990/04/01", "1991/03/31"], // 1年
    ["1991/04/01", "1993/03/31"], // 2年
    ["1993/04/01", "1996/03/31"], // 3年
    ["1996/04/01", "2000/03/31"], // 4年
    ["2000/04/01", "2005/03/31"], // 5年
    ["2005/04/01", "2011/03/31"], // 6年
    ["2011/04/01", "2018/03/31"], // 7年
    ["2018/04/01", "2026/03/31"], // 8年
    ["1990/04/01", "2026/03/31"], // 36年
  ];
  targetRange.setValues(testData);
  const actual = getTrialTermInfo_();
  const expected = [
    ["Setup", "【見積明細：1年毎（1990年度）】", 1],
    ["Registration_1", "【見積明細：1年毎（1991〜1992年度）】", 2],
    ["Registration_2", "【見積明細：1年毎（1993〜1995年度）】", 3],
    ["Interim_1", "【見積明細：1年毎（1996〜1999年度）】", 4],
    ["Observation_1", "【見積明細：1年毎（2000〜2004年度）】", 5],
    ["Interim_2", "【見積明細：1年毎（2005〜2010年度）】", 6],
    ["Observation_2", "【見積明細：1年毎（2011〜2017年度）】", 7],
    ["Closing", "【見積明細：1年毎（2018〜2025年度）】", 8],
  ];
  assertEquals_(actual, expected, "test getTrialTermInfo");
  targetRange.clearContent();
}
