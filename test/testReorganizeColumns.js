function setTestValuesAndCompare_(dateArray, testIdx, total2SumAddress) {
  const sheets = get_sheets();
  const yearsRange = sheets.trial.getRange("D32:E40");
  const lastElement = dateArray[dateArray.length - 1];
  const startYear = lastElement[0].split("/")[0];
  const endYear = lastElement[1].split("/")[0];
  yearsRange.clearContent();
  yearsRange.setValues(dateArray);
  total2_3_add_del_cols();
  SpreadsheetApp.flush();
  const total2YearsRowNumber = 4;
  const setupColumnNumber = 4;
  let totalSumValue = sheets.total.getRange("H99").getValue();
  if (totalSumValue === "#DIV/0!") {
    totalSumValue = 0;
  }
  const total2SumValue = sheets.total2.getRange(total2SumAddress).getValue();
  if (totalSumValue !== total2SumValue) {
    throw new Error(`testReorganizeColumns test ${testIdx} error`);
  }
  const sumColumn = sheets.total2.getLastColumn();
  const total2SetupToClosingColumnsIndex = Array.from(
    { length: sumColumn - setupColumnNumber },
    (_, i) => setupColumnNumber + i
  );
  const total2SetupToClosingColumnsShowIndex =
    total2SetupToClosingColumnsIndex.filter(
      (colNumber) => !sheets.total2.isColumnHiddenByUser(colNumber)
    );
  if (total2SetupToClosingColumnsShowIndex.length > 0) {
    const start = parseInt(startYear, 10);
    const end = parseInt(endYear, 10) - 1;
    const targetYears = Array.from({ length: end - start + 1 }, (_, i) =>
      String(start + i)
    );
    targetYears.forEach((year, idx) => {
      const col = total2SetupToClosingColumnsShowIndex[idx];
      const cellValue = sheets.total2
        .getRange(total2YearsRowNumber, col)
        .getValue()
        .toString();
      if (cellValue !== year.toString()) {
        console.warn(
          `Warning: Year mismatch at column ${col} (expected: ${year}, actual: ${cellValue})`
        );
      }
    });
  }
  console.log(`testReorganizeColumns test ${testIdx} ok`);
}
function testReorganizeColumns() {
  console.log("列再構成のテストを開始します");
  const setupToClosingSheet = get_target_term_sheets();
  setupToClosingSheet.forEach((sheet, idx) => {
    sheet.getRange("F:F").clearContent();
    sheet.getRange("F7").setValue(idx + 1);
    sheet.getRange("F13").setValue(1);
  });
  console.log("正常系のテストを開始します");
  let testIndex = 1;
  const test1Values = [
    ["2022/4/1", "2023/3/31"],
    ["2023/4/1", "2026/3/31"],
    ["2026/4/1", "2029/3/31"],
    ["2029/4/1", "2031/3/31"],
    ["2031/4/1", "2033/3/31"],
    ["2033/4/1", "2036/3/31"],
    ["2036/4/1", "2039/3/31"],
    ["2039/4/1", "2040/3/31"],
    ["2022/4/1", "2040/3/31"],
  ];
  setTestValuesAndCompare_(test1Values, testIndex, "V99");
  // 正常系、見積作成処理未実施
  testIndex++;
  const test2Values = new Array(9);
  test2Values.fill(["", ""]);
  setTestValuesAndCompare_(test2Values, testIndex, "L99");
  // 正常系、Setupがない
  testIndex++;
  const test3Values = [
    ["", ""],
    ["2020/4/1", "2021/3/31"],
    ["2021/4/1", "2022/3/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2022/4/1", "2023/3/31"],
    ["2020/4/1", "2023/3/31"],
  ];
  setTestValuesAndCompare_(test3Values, testIndex, "L99");
  // 正常系, Closingがない
  testIndex++;
  const test4Values = [
    ["2020/4/1", "2021/3/31"],
    ["", ""],
    ["2021/4/1", "2022/3/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2022/4/1", "2023/3/31"],
    ["", ""],
    ["2020/4/1", "2023/3/31"],
  ];
  setTestValuesAndCompare_(test4Values, testIndex, "L99");
  console.log("✅ 列再構成のテストがすべて完了しました");
}
