const addSheetName = "TIAI";

function issue102_logAllDataValidationInfoInRange_() {
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
  new Issue102PriceLogicTable2(priceLogicSheet, "表2 単価(1人日)基準").pricelogic();
  new Issue102PriceLogicTable2(priceLogicCompanySheet, "表2 主担当者単価(1人日)基準").pricelogic();
  // PriceLogicCompany, PriceLogicシートの※1を更新する
  [priceLogicCompanySheet, priceLogicSheet].forEach(sheet => issue102_priceLogic_annotation1_(sheet));
  // Items, Priceシートの一番下の行、PriceLogicCompany, PriceLogicシートの94行目くらいに「*2015年の第3次産業活動指数を基準に単価を調整」「*1 2015年の第3次産業活動指数：100」「*2 2025年の第3次産業活動指数：107」を入れる
  issue102_addText_([itemsSheet, priceSheet, priceLogicSheet, priceLogicCompanySheet]);
}
function issue102_addText_(targetSheets) {
  const [itemsSheet, priceSheet, priceLogicSheet, priceLogicCompanySheet] = targetSheets;
  const [itemsAddTextRow, priceAddTextRow] = itemsSheet.getRange("A96").getValue() === "合計" ? [97, 94] : itemsSheet.getRange("A96").getValue() === "" ? [96, 93] : [-1, -1];
  if (itemsAddTextRow === -1) {
    throw Error("itemsAndPriceAddTextRow");
  }
  const setTextArray =[["*2015年の第3次産業活動指数を基準に単価を調整"], ["*1 2015年の第3次産業活動指数：100"], ["*2 2025年の第3次産業活動指数：107"]];
  itemsSheet.getRange(itemsAddTextRow, 1, setTextArray.length, 1).setValues(setTextArray);
  itemsSheet.getRange(itemsAddTextRow, 1, setTextArray.length, 1).setFontWeight(null);
  priceSheet.getRange(priceAddTextRow, 1, setTextArray.length, 1).setValues(setTextArray);
  priceSheet.getRange(priceAddTextRow, 1, setTextArray.length, 1).setFontWeight(null);
  const priceLogicAddTextRow = priceLogicSheet.getRange("A94").getValue() === "※1:" ? 93 : priceLogicSheet.getRange("A95").getValue() === "※1:" ? 94 : -1;
  if (priceLogicAddTextRow === -1) {
    return;
  } 
  [priceLogicSheet, priceLogicCompanySheet].forEach(sheet => {
    sheet.insertRowsBefore(priceLogicAddTextRow, 3);
    sheet.getRange(priceLogicAddTextRow, 1, setTextArray.length, 1).setValues(setTextArray);
    sheet.getRange(priceLogicAddTextRow, 1, setTextArray.length, 1).setFontWeight(null);
  }); 

}
function issue102_priceLogic_annotation1_(sheet) {
  console.log(sheet.getRange("B99").getValue());
  if (sheet.getName() === "PriceLogic" && sheet.getRange("B99").getValue() !== 550000) {
    return;
  }
  if (sheet.getName() === "PriceLogicCompany" && sheet.getRange("B99").getValue() !== 550000) {
    return;
  }
  for (let row = 98; row <= 102; row++) {
    const range = sheet.getRange(row, 2);
    const value = range.getValue();
    const setValueNum = sheet.getName() === "PriceLogic" ? issue102_roundToNearest100_(Number(value) * 1.07) : issue102_roundToNearest100_(issue102_roundToNearest100_(Number(value) * 1.07) *1.5);
    range.setValue(setValueNum);
  }
  for (let row = 107; row <= 109; row++) {
    const annotationRange = sheet.getRange(row, 1);
    if (!issue102_iSsFirstCharEquals_(annotationRange.getValue())) {
      const temp = `="${annotationRange.getValue()}*" & ${addSheetName}!$B$2/100`;
      annotationRange.setValue(temp);
    }
  }
}
class Issue102PriceLogicTable2{
  constructor(sheet, title) {
    this.sheet = sheet;
    this.title = title
    this.targetRow = this.getTitleRow();
  }
  getTitleRow() {
    const titleRow = this.sheet.getRange(1, 3, this.sheet.getLastRow(), 1).getValues().map((value, idx) => value[0] === this.title ? idx : null).filter(x => x !== null);
    if (titleRow.length === 0) {
      throw Error("getTitleRow");
    }
    const targetStartRow = titleRow[0] + 3;
    return targetStartRow;
  }
  pricelogic() {
    for (let i = 0; i < 4; i++) {
      const outputRow = this.targetRow + i;
      const range = this.sheet.getRange(outputRow, 3);
      const value = range.getValue();
      let setFormulaText = null;
      if (this.sheet.getName() === "PriceLogic") {
        if (!issue102_iSsFirstCharEquals_(range.getFormula())) {
          setFormulaText = `=${value}*${addSheetName}!$B$2/100`;
        }
      } else if (this.sheet.getName() === "PriceLogicCompany") {
        const test = this.sheet.getRange(1, 3, this.sheet.getLastRow(), 1).getValues();
        const coefficientRow = this.sheet.getRange(1, 3, this.sheet.getLastRow(), 1).getValues().map((value, idx) => value[0] === "係数" ? idx :null).filter(x => x !== null);
        if (coefficientRow.length === 0) {
          throw Error(coefficientRow);
        }
        const coefficientRange = `$D${coefficientRow[0]+1}`;
        setFormulaText = `=PriceLogic!C${outputRow}*${coefficientRange}`;        
      }
      if (setFormulaText !== null) {
        range.setValue(setFormulaText);
      }
    }
  }
}
function issue102_roundToNearest100_(amount) {
  return Math.round(amount / 1000) * 1000;
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