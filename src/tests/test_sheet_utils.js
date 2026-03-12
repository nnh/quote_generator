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

function test_findRowByValue() {
  const _ = get_sheets();
  const actual1 = findRowByValue_(
    _cachedSheets.total,
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    "PMDA対応、照会事項対応",
  );
  const expected1 = 25;
  assertEquals_(actual1, expected1, "find PMDA対応、照会事項対応 row");

  const actual2 = findRowByValue_(
    _cachedSheets.total,
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    "PMDA対応",
  );
  const expected2 = null;
  assertEquals_(actual2, expected2, "value not found");
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
