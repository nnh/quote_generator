function test_getTrialTermInfo() {
  test_calculateMonthSpan_();
  test_calculateYearSpan_();
  test_normalizeTrialTermInfo_();
  test_filterTargetTerms_();
  test_calculateTotalCount_();
  //test_getArrayDividedItemsCount_();
  test_getActiveTrialTermSheets_();
  test_getTrialTermInfo_();
}
function test_getTrialTermInfo_() {
  const dummy = get_sheets();
  const trialSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
  const targetRangeAddress = TRIAL_TERM_RANGE_ADDRESS;
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
function test_calculateMonthSpan_() {
  const cases = [
    // 同一月
    [new Date("2020-01-01"), new Date("2020-01-31"), 1],
    // 複数月
    [new Date("2020-01-01"), new Date("2020-03-31"), 3],
    // 年またぎ
    [new Date("2020-12-01"), new Date("2021-02-28"), 3],
  ];

  cases.forEach(([start, end, expected]) => {
    const actual = calculateMonthSpan_(start, end);
    assertEquals_(actual, expected, "test calculateMonthSpan_");
  });

  // nullケース
  assertEquals_(calculateMonthSpan_(null, new Date()), null);
}

function test_calculateYearSpan_() {
  const cases = [
    [new Date("2020-04-01"), new Date("2020-12-31"), 1],
    [new Date("2020-04-01"), new Date("2021-03-31"), 1],
    [new Date("2020-04-01"), new Date("2022-03-31"), 2],
  ];

  cases.forEach(([start, end, expected]) => {
    const actual = calculateYearSpan_(start, end);
    assertEquals_(actual, expected, "test calculateYearSpan_");
  });
}

function test_normalizeTrialTermInfo_() {
  const COL = TRIAL_SHEET.COLUMN_INDEX;

  const input = [
    ["A", "x", "3"],
    ["B", "y", ""],
    ["C", "z", "abc"],
  ];

  const actual = normalizeTrialTermInfo_(input);

  const expected = [
    ["A", "x", 3],
    ["B", "y", 0],
    ["C", "z", 0],
  ];

  assertEquals_(actual, expected, "test normalizeTrialTermInfo_");
}

function test_filterTargetTerms_() {
  const COL = TRIAL_SHEET.COLUMN_INDEX;

  const data = [
    ["A", "x", 2],
    ["B", "y", 0],
    ["C", "z", 3],
  ];

  const actual = filterTargetTerms_(data, ["C"]);

  const expected = [["A", "x", 2]];

  assertEquals_(actual, expected, "test filterTargetTerms_");
}

function test_calculateTotalCount_() {
  const COL = TRIAL_SHEET.COLUMN_INDEX;

  const target = [
    ["A", "x", 2],
    ["B", "y", 3],
  ];

  const setValueList = [1, 2];

  // 1*2 + 2*3 = 8
  const actual = calculateTotalCount_(setValueList, target);

  assertEquals_(actual, 8, "test calculateTotalCount_");
}

function test_getArrayDividedItemsCount_() {
  const data = [
    ["A", "x", 1],
    ["B", "y", 2],
  ];

  const total = 6;

  const result = getArrayDividedItemsCount_(total, data);

  // 合計チェック
  const sum = result.reduce((acc, [, count]) => acc + count, 0);

  assertEquals_(sum, total, "total check");

  // 件数チェック
  assertEquals_(result.length, 2, "length check");
}

function test_getActiveTrialTermSheets_() {
  const dummy = get_sheets();
  const actual = getActiveTrialTermSheets_();

  // 少なくとも配列であること
  if (!Array.isArray(actual)) {
    throw new Error("not array");
  }

  // active が true のみ
  actual.forEach((row) => {
    if (!row.active) {
      throw new Error("inactive included");
    }
  });
}
