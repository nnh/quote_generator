function issue102_logAllDataValidationInfoInRange() {
  const target = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Items").getRange("B4:B94");
  const res = issue102_logAllDataValidationInfoInRange_(target);
  console.log(res);
}
function issue102_logAllDataValidationInfoInRange_(range) {
  const result = [];
  try {
    const dataValidations = range.getDataValidations(); // DataValidation[][] 型の2次元配列
    for (let i = 0; i < dataValidations.length; i++) { // 行のループ
      for (let j = 0; j < dataValidations[i].length; j++) { // 列のループ
        const cellValidation = dataValidations[i][j];
        const currentCell = range.getCell(i + 1, j + 1); // (i+1, j+1) は1-based index
        const cellAddress = currentCell.getA1Notation();

        if (cellValidation != null) {
          const criteriaType = cellValidation.getCriteriaType();
          const criteriaValues = cellValidation.getCriteriaValues(); // Object[] 型 配列で値が返る
          const allowInvalid = cellValidation.getAllowInvalid();
          const helpText = cellValidation.getHelpText();          
          // よく使われる条件タイプについて、より分かりやすく値を表示
          if (criteriaType === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST && criteriaValues[1]) {
            // criteriaValues[0] はリスト項目の配列
            // criteriaValues[1] はドロップダウンをセル内に表示するかのブール値
            const listArray = Array.isArray(criteriaValues[0]) ? criteriaValues[0] : [""]; 
            const cellAddressAndListArray = listArray.map(x => [cellAddress, x]);
            result.push(...cellAddressAndListArray);
          } else if (criteriaType === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE) {
            // criteriaValues[0] はRangeオブジェクト (参照範囲)
            // criteriaValues[1] はドロップダウンをセル内に表示するかのブール値
            const referencedRange = criteriaValues[0];
            if (referencedRange && typeof referencedRange.getA1Notation === 'function') {
              Logger.log("    参照範囲: " + referencedRange.getA1Notation());
            } else {
              Logger.log("    参照範囲: (直接の範囲指定ではないか、取得できませんでした)");
            }
            Logger.log("    ドロップダウン表示: " + criteriaValues[1]);
          }
        }
      }
    }
  } catch (e) {
    Logger.log("エラーが発生しました: " + e.toString());
    Logger.log("スタックトレース: " + e.stack);
  }
  return result;
}
function issue102_template_fix_main() {
  const addSheetName = "TIAI";
  const itemsSheetName = "Items"; // ★ 移動先の基準となる「Items」シートの名前
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName(itemsSheetName);
  const priceLogicCompanySheet = ss.getSheetByName("PriceLogicCompany");
  const priceLogicSheet = ss.getSheetByName("PriceLogic");
  const priceSheet = ss.getSheetByName("Price");
  if (itemsSheet === null || priceLogicCompanySheet === null || priceLogicSheet === null || priceSheet === null) {
    return;
  }
  let targetSheet = ss.getSheetByName(addSheetName);
  if (targetSheet === null) {
    // シートが存在しない場合は新しいシートを挿入し、名前を設定
    targetSheet = ss.insertSheet();
    targetSheet.setName(addSheetName);
    const itemsSheetIndex = itemsSheet.getIndex(); // "Items" シートの現在の位置 (1から始まるインデックス)
    ss.moveActiveSheet(itemsSheetIndex);
  }
  targetSheet.clear();
  const setTextArray = [
    ["年", "第3次産業活動指数"],
    ["2025", "107"],
    ["2015", "100"]
  ];
  targetSheet.getRange(1, 1, setTextArray.length, setTextArray[0].length).setValues(setTextArray);
  // TIAI!B2を参照し、ItemsシートのS列に最新の指数（今回は1.07）がかかっていくようにする
  const itemsPriceFormulas = ["単価(1人日)",
"",
"",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"",
"=100000*TIAI!$B$2/100",
"",
"=100000*TIAI!$B$2/100",
"",
"=100000*TIAI!$B$2/100",
"",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
`=if($B$16="CTR登録案",50000*TIAI!$B$2/100, 65000*TIAI!$B$2/100)`,
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"",
"=80000*TIAI!$B$2/100",
"=80000*TIAI!$B$2/100",
"=80000*TIAI!$B$2/100",
"",
"",
"=65000*TIAI!$B$2/100",
"=50000*TIAI!$B$2/100",
"",
"=65000*TIAI!$B$2/100",
"=50000*TIAI!$B$2/100",
"=50000*TIAI!$B$2/100",
"=50000*TIAI!$B$2/100",
"",
"=50000*TIAI!$B$2/100",
"=50000*TIAI!$B$2/100",
"",
"=50000*TIAI!$B$2/100",
"=65000*TIAI!$B$2/100",
"",
"=50000*TIAI!$B$2/100",
"=50000*TIAI!$B$2/100",
"",
"=80000*TIAI!$B$2/100",
"=80000*TIAI!$B$2/100",
"=80000*TIAI!$B$2/100",
"=80000*TIAI!$B$2/100",
"=80000*TIAI!$B$2/100",
"",
"=65000*TIAI!$B$2/100",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"=100000*TIAI!$B$2/100",
"",
"",
"",
"",
"=50000*TIAI!$B$2/100",
"=50000*TIAI!$B$2/100",
"",
"",
"",
"",
"=100000*TIAI!$B$2/100",
"=100000*TIAI!$B$2/100",
"=3000*TIAI!$B$2/100",
"=100000*TIAI!$B$2/100",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
""].map(x => [x]);
  itemsSheet.getRange("S1:S99").setValues(itemsPriceFormulas);
  itemsSheet.getRange("S83").setNumberFormat("#,##0_);(#,##0)");
  // 人日の設定がない項目に対応
  itemsSheet.getRange("R72").setValue('=round(800000*TIAI!$B$2/100, -3)');
  itemsSheet.getRange("R73").setValue('=round(200000*TIAI!$B$2/100, -3)');
  // 変動項目
  itemsSheet.getRange("R38").setValue('=round((100000+IF(Trial!$B$30<100,4500*Trial!$B$30,IF(Trial!$B$30<1000,4500*100+2250*(Trial!$B$30-100),4500*100+2250*900+1100*(Trial!$B$30-1000))))*TIAI!$B$2/100, -3)');
  itemsSheet.getRange("R39").setValue('=round((Trial!$B$30*250)*TIAI!$B$2/100, -3)');
  itemsSheet.getRange("R43").setValue('=round((round(log(Trial!$B$28,10+log(Trial!$B$28,2))*log(Trial!$B$30,10)*Trial!$C$27*25000,-3))*TIAI!$B$2/100, -3)');
  itemsSheet.getRange("R44").setValue('=round((round(log(Trial!$B$28,10)*log(Trial!$B$30,10)*Trial!$C$27*75000,-3))*TIAI!$B$2/100, -3)');

  ss.getSheetByName("PrimaryItems").getRange("A1").setValue(`=QUERY(Items!A:A, "where A <> '' and A <> '準備作業' and A <> 'EDC構築' and A <> '中央モニタリング' and A <> 'データセット作成' and NOT A LIKE '%合計' and NOT A LIKE '*%'")`);
  // PriceLogicCompany, PriceLogicシートの表2 単価(1人日)基準を更新する
  const priceLogicTargetStartRow = 103;
  [priceLogicSheet].forEach(sheet => {
    let setFormulaText = "";
    for (let i = 0; i < 4; i++) {
      const range = sheet.getRange(priceLogicTargetStartRow + i, 3);
      const value = range.getValue();
      if (!issue102_iSsFirstCharEquals_(value))
        setFormulaText = `=${value}*${addSheetName}!$B$2/100`;
        range.setValue(setFormulaText);
    }
  });
  priceLogicCompanySheet.getRange(priceLogicTargetStartRow, 3).setValue(`=50000*$D112*${addSheetName}!$B$2/100`);
  priceLogicCompanySheet.getRange(priceLogicTargetStartRow + 1, 3).setValue(`=65000*$D112*${addSheetName}!$B$2/100`);
  priceLogicCompanySheet.getRange(priceLogicTargetStartRow + 2, 3).setValue(`=80000*$D112*${addSheetName}!$B$2/100`);
  priceLogicCompanySheet.getRange(priceLogicTargetStartRow + 3, 3).setValue(`=100000*$D112*${addSheetName}!$B$2/100`);
  // Items, Priceシートの一番下の行、PriceLogicCompany, PriceLogicシートの94行目くらいに「*2015年の第3次産業活動指数を基準に単価を調整」「*1 2015年の第3次産業活動指数：100」「*2 2025年の第3次産業活動指数：107」を入れる
  const sheetAndStartRowAndCol = [
    [itemsSheet, 97, 1],
    [priceSheet, 97, 1],
  ];
  const setTextArray2 =["*2015年の第3次産業活動指数を基準に単価を調整", "*1 2015年の第3次産業活動指数：100", "*2 2025年の第3次産業活動指数：107"];
  sheetAndStartRowAndCol.forEach(([sheet, startRow, col]) => {
    issue102_setTextArray_(setTextArray2, sheet, startRow, col);
  });
  const sheetAndInsertRowAndCol = [
    [priceLogicSheet, 92, 1],
    [priceLogicCompanySheet, 92, 1]
  ];
  sheetAndInsertRowAndCol.forEach(([sheet, insertRow, col]) => {
    if (sheet.getRange(insertRow + 1, col).getValue() !== setTextArray2[0]) {
      sheet.insertRowsAfter(insertRow, setTextArray2.length);
    } 
    const startRow = insertRow + setTextArray2.length;
    issue102_setTextArray_(setTextArray2, sheet, startRow, col);    
  });
}
function issue102_setTextArray_(setTextArray, sheet, startRow, col) {
      setTextArray.forEach((value, idx) => {
      const targetRange = sheet.getRange(startRow + idx, col);
      targetRange.setValue(value);
      targetRange.setFontWeight("normal");
    }); 
}
function issue102_iSsFirstCharEquals_(text) {
  if (typeof text === 'string') { // 対象が文字列であることを確認
    return text.startsWith('=');
  }
  return false;
}