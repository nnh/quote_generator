function testApplyTargetItemsToValues_(target_items, test_name, target_row) {
  // Setupシートをテスト対象とする
  const sheetname = "Setup";
  const array_item = get_fy_items_(
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname),
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
  );
  const rangeValues = getTargetCountRange_(sheetname, "F").getValues();
  const array_count = rangeValues.map((row) => row.map(() => ""));
  const result = applyTargetItemsToValues_(
    array_count,
    array_item,
    target_items,
  );
  // resultのtarget_row行目の値がtarget_itemsの要素１の値と等しいことを確認, それ以外は空文字であることを確認
  for (let i = 0; i < result.length; i++) {
    if (i === target_row) {
      const expectedValue = target_items[0][1];
      const actualValue = result[i][0];
      if (actualValue !== expectedValue) {
        throw new Error(
          `${test_name} failed: Expected ${expectedValue} at row ${target_row}, but got ${actualValue}`,
        );
      }
    } else {
      const actualValue = result[i][0];
      if (actualValue !== "") {
        throw new Error(
          `${test_name} failed: Expected empty string at row ${i}, but got ${actualValue}`,
        );
      }
    }
  }
  console.log(`${test_name} passed.`);
}
function testApplyTargetItemsToValues() {
  // Case1: 正常ケース
  // SetupシートのC列に存在する項目名がtarget_itemsの要素１に存在する場合
  const case1 = [
    ["統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成", 999],
  ];
  testApplyTargetItemsToValues_(case1, "Case1", 53);
  // Case2: 項目名が存在しないケース
  const case2 = [["存在しない項目名", 999]];
  testApplyTargetItemsToValues_(case2, "Case2", -1);
}
