function test_findRowByValue() {
  // --- 準備 ---
  const sheets = get_sheets();
  const sheet = sheets.items; // Itemsシート想定

  const columnNumber = 2; // B列
  const targetValue = "保険料";

  // --- 実行 ---
  const actualValue = findRowByValue_(sheet, columnNumber, targetValue);

  // --- 検証 ---
  const expectedValue = 78;

  assertEquals_(
    expectedValue,
    actualValue,
    "should return row 78 when value '保険料' exists in column B",
  );

  const notFoundValue = findRowByValue_(sheet, columnNumber, "存在しない値");

  assertEquals_(
    0,
    notFoundValue,
    "should return 0 when value does not exist in the column",
  );
}

function test_getColumnNumber() {
  // --- 基本 ---
  const actual1 = getColumnNumber_("A");
  const expected1 = 1;
  assertEquals_(actual1, expected1, "A should be 1");

  const actual2 = getColumnNumber_("Z");
  const expected2 = 26;
  assertEquals_(actual2, expected2, "Z should be 26");

  // --- 2桁境界 ---
  const actual3 = getColumnNumber_("AA");
  const expected3 = 27;
  assertEquals_(actual3, expected3, "AA should be 27");

  const actual4 = getColumnNumber_("AZ");
  const expected4 = 52;
  assertEquals_(actual4, expected4, "AZ should be 52");

  const actual5 = getColumnNumber_("BA");
  const expected5 = 53;
  assertEquals_(actual5, expected5, "BA should be 53");

  const actual6 = getColumnNumber_("ZZ");
  const expected6 = 702;
  assertEquals_(actual6, expected6, "ZZ should be 702");

  // --- 3桁境界 ---
  const actual7 = getColumnNumber_("AAA");
  const expected7 = 703;
  assertEquals_(actual7, expected7, "AAA should be 703");

  // --- 小文字入力 ---
  const actual8 = getColumnNumber_("aa");
  const expected8 = 27;
  assertEquals_(actual8, expected8, "aa should be 27");

  // --- 空白付き ---
  const actual9 = getColumnNumber_("  B ");
  const expected9 = 2;
  assertEquals_(actual9, expected9, "trim should work");
}

function test_getColumnString() {
  // --- 基本 ---
  const actual1 = getColumnString_(1);
  const expected1 = "A";
  assertEquals_(actual1, expected1, "1 should be A");

  const actual2 = getColumnString_(26);
  const expected2 = "Z";
  assertEquals_(actual2, expected2, "26 should be Z");

  // --- 2桁境界 ---
  const actual3 = getColumnString_(27);
  const expected3 = "AA";
  assertEquals_(actual3, expected3, "27 should be AA");

  const actual4 = getColumnString_(52);
  const expected4 = "AZ";
  assertEquals_(actual4, expected4, "52 should be AZ");

  const actual5 = getColumnString_(53);
  const expected5 = "BA";
  assertEquals_(actual5, expected5, "53 should be BA");

  const actual6 = getColumnString_(702);
  const expected6 = "ZZ";
  assertEquals_(actual6, expected6, "702 should be ZZ");

  // --- 3桁境界 ---
  const actual7 = getColumnString_(703);
  const expected7 = "AAA";
  assertEquals_(actual7, expected7, "703 should be AAA");

  // --- string入力 ---
  const actual8 = getColumnString_("27");
  const expected8 = "AA";
  assertEquals_(actual8, expected8, "string number should work");
}

function test_columnConversionRoundTrip() {
  const testColumns = ["A", "B", "Z", "AA", "AZ", "BA", "ZZ", "AAA"];

  for (const column of testColumns) {
    const number = getColumnNumber_(column);
    const actual = getColumnString_(number);
    const expected = column;

    assertEquals_(actual, expected, "round trip: " + column);
  }
}

function test_setSheetVisibility() {
  const _ = get_sheets();
  const sheet = _cachedSheets.total2;
  const targetValue = sheet.getRange(1, 2).getValue();

  // --- 非表示にするテスト ---
  setSheetVisibility_(sheet, targetValue === "");
  const actual1 = sheet.isSheetHidden();
  const expected1 = true;
  assertEquals_(actual1, expected1, "sheet should be hidden");

  // --- 表示にするテスト ---
  setSheetVisibility_(sheet, targetValue !== "");
  const actual2 = sheet.isSheetHidden();
  const expected2 = false;
  assertEquals_(actual2, expected2, "sheet should be visible");

  // 念のため元に戻す
  sheet.showSheet();
}

function test_findColumnByValue() {
  const _ = get_sheets();
  const actual1 = findColumnByValue_(_cachedSheets.total2, 4, "合計");
  const expected1 = 12;
  assertEquals_(actual1, expected1, "合計");

  const actual2 = findColumnByValue_(_cachedSheets.total2, 4, "　合計");
  const expected2 = null;
  assertEquals_(actual2, expected2, "value not found");
}
function test_findColumnIndexByValue() {
  const values = [
    ["A", "B", "C"],
    ["X", "Y", "Z"],
    ["SUM", "ITEM", "TOTAL"],
  ];

  const tests = [
    {
      rowIndex: 0,
      value: "A",
      expected: 0,
      message: "match: first column",
    },
    {
      rowIndex: 0,
      value: "C",
      expected: 2,
      message: "match: last column",
    },
    {
      rowIndex: 1,
      value: "Y",
      expected: 1,
      message: "match: middle column",
    },
    {
      rowIndex: 2,
      value: "TOTAL",
      expected: 2,
      message: "match: another row",
    },
    {
      rowIndex: 1,
      value: "NOT_FOUND",
      expected: null,
      message: "not match: value does not exist",
    },
    {
      rowIndex: 10,
      value: "A",
      expected: null,
      message: "not match: row out of range",
    },
  ];

  tests.forEach((t) => {
    const actual = findColumnIndexByValue_(values, t.rowIndex, t.value);
    assertEquals_(actual, t.expected, t.message);
  });
}

function test_findRowIndexByValue() {
  const values = [["A"], ["B"], ["SUM"], ["C"]];

  const actual1 = findRowIndexByValue_(values, 0, "SUM");

  const expected1 = 2;

  assertEquals_(actual1, expected1, "find SUM row");

  const actual2 = findRowIndexByValue_(values, 0, "D");
  const expected2 = null;

  assertEquals_(actual2, expected2, "value not found");
}
