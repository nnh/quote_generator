function testApplyTargetItemsToValues_(target_items, test_str, target_row) {
  const total_and_phase_sheet_columns_itemname =
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME;
  if (total_and_phase_sheet_columns_itemname === undefined) {
    throw new Error(
      "TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME is undefined. Please check the constant definition.",
    );
  }
  const total_and_phase_sheet_columns_count =
    TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT;
  if (total_and_phase_sheet_columns_count === undefined) {
    throw new Error(
      "TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT is undefined. Please check the constant definition.",
    );
  }
  const totalColName =
    total_and_phase_sheet_columns_count === 6 ? "F" : undefined;
  if (totalColName === undefined) {
    throw new Error(
      "TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT does not correspond to a known column name. Please check the constant definition.",
    );
  }
  const targetSheetsName = getTargetSheetNameForTest_();
  targetSheetsName.forEach((sheetname) => {
    const test_name = `testApplyTargetItemsToValues_ : ${test_str} シート[${sheetname}]の場合`;
    const array_item = get_fy_items_(
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname),
      total_and_phase_sheet_columns_itemname,
    );

    const rangeValues = getTargetCountRange_(
      sheetname,
      totalColName,
    ).getValues();
    const array_count = rangeValues.map((row) => row.map(() => ""));

    const actual = applyTargetItemsToValues_(
      array_count,
      array_item,
      target_items,
    );

    // --- expected を作る ---
    const expected = array_count.map((row, idx) => {
      if (idx === target_row) {
        return [target_items[0][1]];
      }
      return [""];
    });

    // --- assert ---
    assertEquals_(actual, expected, test_name);
  });
}

function testApplyTargetItemsToValues() {
  // Case1: 正常ケース
  // 各シートのC列に存在する項目名がtarget_itemsの要素１に存在する場合
  const case1 = [
    ["統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成", 999],
  ];
  testApplyTargetItemsToValues_(case1, "Case1", 53);
  // Case2: 項目名が存在しないケース
  const case2 = [["存在しない項目名", 999]];
  testApplyTargetItemsToValues_(case2, "Case2", -1);
  console.log("[PASS] testApplyTargetItemsToValues");
}
