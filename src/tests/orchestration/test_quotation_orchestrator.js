function test_updateTermSheetVisibility() {
  const targetSheets = getTargetSheetNameForTest_().map((sheetName) =>
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName),
  );
  const trialSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
  const targetRangeAddress = TRIAL_TERM_RANGE_ADDRESS;
  const targetRange = trialSheet.getRange(targetRangeAddress);
  targetRange.clearContent();
  // 全て表示になるケース
  const testData1 = [
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
  targetRange.setValues(testData1);
  updateTermSheetVisibility_();
  const actual1 = targetSheets.every((sheet) => !sheet.isSheetHidden());
  const expected1 = true;
  assertEquals_(actual1, expected1, "sheet should be visible");
  // 一部非表示になるケース
  const testData2 = [
    ["1990/04/01", "1991/03/31"], // 1年
    ["", ""],
    ["1993/04/01", "1996/03/31"], // 3年
    ["", ""], // 4年
    ["2000/04/01", "2005/03/31"], // 5年
    ["", ""], // 6年
    ["2011/04/01", "2018/03/31"], // 7年
    ["", ""], // 8年
    ["1990/04/01", "2026/03/31"], // 36年
  ];
  targetRange.setValues(testData2);
  updateTermSheetVisibility_();
  const actual2 = targetSheets.map((sheet) => sheet.isSheetHidden());
  const expected2 = [false, true, false, true, false, true, false, true];
  assertEquals_(actual2, expected2, "some sheets should be hidden");
  // 全て非表示になるケース
  const testData3 = [
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
  ];
  targetRange.setValues(testData3);
  updateTermSheetVisibility_();
  const actual3 = targetSheets.map((sheet) => sheet.isSheetHidden());
  const expected3 = [true, true, true, true, true, true, true, true];
  assertEquals_(actual3, expected3, "all sheets should be hidden");
}
