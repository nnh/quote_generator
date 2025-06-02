const itemTargetRow = 15;
const priceTargetRow = 14;
const otherTargetRow = 17;
const itemAndPriceTargetCol = 2;
const otherTargetCol = 3;
const itemSheetName = "Items";
const priceSheetNames = [  
  'Price',
  'PriceLogicCompany',
  'PriceLogic'
];
const colb_sheets = [itemSheetName, ...priceSheetNames];
const total1SheetNames = [
  'Total',
  'Total_nmc',
  'Total_oscr'
];
const total2SheetNames = [
  'Total2',
  'Total2_nmc',
  'Total2_oscr'
];
const totalSheetNames = [
  ...total1SheetNames,
  ...total2SheetNames
];
const setupToClosingSheetNames = [
  'Setup',
  'Registration_1',
  'Registration_2',
  'Interim_1',
  'Observation_1',
  'Interim_2',
  'Observation_2',
  'Closing',
];
function issue100_getSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  return sheets;
}
function getTargetRow_(sheet) {
  return colb_sheets.includes(sheet.getName()) ? sheet.getName() === itemSheetName ? itemTargetRow: priceTargetRow : otherTargetRow;
}
function getTargetCol_(sheet) {
  return colb_sheets.includes(sheet.getName()) ? itemAndPriceTargetCol : otherTargetCol;
}
function insertRowTarget_(sheet) {
  const targetRow = getTargetRow_(sheet);
  const targetCol = getTargetCol_(sheet);
  if (sheet.getRange(targetRow, targetCol).getValue() !== "SOP一式、CTR登録案、TMF管理") {
    return;
  } 
  sheet.insertRowBefore(targetRow);
}
function issue100_editItems_() {
  const setValueText = "症例検討会準備・実行";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(itemSheetName);
  const addItemNameRange = sheet.getRange(itemTargetRow, itemAndPriceTargetCol);
    addItemNameRange.setDataValidation(null);
    addItemNameRange.setValue(setValueText);
    addItemNameRange.offset(0, 1).setFormula(`=round(R${itemTargetRow}*Trial!$B$44,-3)`);
    addItemNameRange.offset(0, 2).setValue("回");
    sheet.getRange(`R${itemTargetRow}`).setFormula(`=round(S${itemTargetRow}*T${itemTargetRow}*U${itemTargetRow},-3)`);
    sheet.getRange(`S${itemTargetRow}`).setValue(65000);
    sheet.getRange(`T${itemTargetRow}`).setFormula(`=if($B${itemTargetRow}="${setValueText}", 6.25, 0.25)`);
    sheet.getRange(`U${itemTargetRow}`).setFormula(`=if($B${itemTargetRow}="${setValueText}", 1, 5)`);
    sheet.getRange(`V${itemTargetRow}`).setValue(67);
    sheet.getRange(`W${itemTargetRow}`).setValue(33);
    const dataValidationItems = [setValueText, `Web${setValueText}`];
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(dataValidationItems, true)  // true: 値をドロップダウンに表示
      .setAllowInvalid(false)           // リストにない値は無効
      .build();
    addItemNameRange.setDataValidation(rule);
    // B14の入力規則にキックオフミーティングを追加
    issue100AddValidationItem_();
    const kickoffRow = itemTargetRow - 1;
    sheet.getRange(`T${kickoffRow}`).setFormula(`=if(or($B${kickoffRow}="ミーティング準備・実行", $B${kickoffRow}="キックオフミーティング準備・実行"), 6.25, 0.25)`);
    sheet.getRange(`U${kickoffRow}`).setFormula(`=if(or($B${kickoffRow}="ミーティング準備・実行", $B${kickoffRow}="キックオフミーティング準備・実行"), 1, 5)`);
    sheet.getRange(kickoffRow, 2).setValue("キックオフミーティング準備・実行");

}
function issue100_insertRow_() {
  const sheets = issue100_getSheets_();
  const itemSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(itemSheetName);
  const targetSheetName = [ 
  ...totalSheetNames,
  ...setupToClosingSheetNames,
  ...priceSheetNames ];
  const targetSheets = sheets.filter(sheet => targetSheetName.includes(sheet.getName()));
  const insertRowSheets = [itemSheet, ...targetSheets]; 
  insertRowSheets.forEach(sheet => insertRowTarget_(sheet));
}
function issue100_setPriceSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(priceSheetNames[0]);
  const targetRow = getTargetRow_(sheet);
  const itemRow = targetRow + 1;
  sheet.getRange(targetRow, 1).setFormula(`=Items!$A$${itemRow}`);
  sheet.getRange(targetRow, 2).setFormula(`=Items!$B$${itemRow}`);
  sheet.getRange(targetRow, 3).setFormula(`=Items!$R$${itemRow}`);
  sheet.getRange(targetRow, 4).setFormula(`=Items!$D$${itemRow}`);
  sheet.getRange(targetRow, 5).setFormula(`=round(Items!$R$${itemRow}*$F$1,-3)`);
  sheet.getRange(targetRow, 6).setFormula(`=Items!$D$${itemRow}`);
  sheet.getRange(targetRow, 8).setValue(1);
}
function issue100_setPriceLogicCompanySheet_(sheetIdx) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(priceSheetNames[sheetIdx]);
  const targetRow = getTargetRow_(sheet);
  const itemRow = targetRow + 1;
  const targetCol = sheetIdx === 1 ? "E" : "C";
  sheet.getRange(targetRow, 1).setFormula(`=Items!$A$${itemRow}`);
  sheet.getRange(targetRow, 2).setFormula(`=Items!$B$${itemRow}`);
  sheet.getRange(targetRow, 3).setFormula(`=Price!$${targetCol}$${targetRow}`);
  sheet.getRange(targetRow, 4).setFormula(`=Items!$D$${itemRow}`);
  sheet.getRange(targetRow, 5).setFormula(`=Items!$S$${itemRow}`);
  sheet.getRange(targetRow, 6).setFormula(`=Items!$T$${itemRow}`);
  sheet.getRange(targetRow, 7).setFormula(`=Items!$U$${itemRow}`);
  sheet.getRange(targetRow, 8).setValue(1);
}
function issue100_setSetupToClosingSheet_() {
  const targetRow = getTargetRow_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(setupToClosingSheetNames[0]));
  const itemRow = targetRow - 2;
  setupToClosingSheetNames.forEach(sheetName => {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      sheet.getRange(targetRow, 2).setFormula(`=Items!A${itemRow}`);
      sheet.getRange(targetRow, 3).setFormula(`=Items!B${itemRow}`);
      sheet.getRange(targetRow, 4).setFormula(`=Items!C${itemRow}`);
      sheet.getRange(targetRow, 5).setValue("x");
      sheet.getRange(targetRow, 7).setFormula(`=Items!D${itemRow}`);
      sheet.getRange(targetRow, 8).setFormula(`=IF(F${targetRow}="","",D${targetRow}*F${targetRow})`);
      sheet.getRange(targetRow, 12).setFormula(`=if(or(F${targetRow}="", F${targetRow}=0),0,1)`);
  });
}
function issue100_setTotal2Sheet_() {
  const targetRow = getTargetRow_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(total2SheetNames[0]));
  const itemRow = targetRow - 2;
  total2SheetNames.forEach(total2SheetName => {
      const total2Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(total2SheetName);
      total2Sheet.getRange(targetRow, 2).setFormula(`=Items!A${itemRow}`);
      total2Sheet.getRange(targetRow, 3).setFormula(`=Items!B${itemRow}`);
      setupToClosingSheetNames.forEach((sheetName, idx) => {
        if (total2SheetName === 'Total2_nmc') {
          total2Sheet.getRange(targetRow, idx + 4).setFormula(`=IF(or(${sheetName}!$B$2="", ${sheetName}!$H${targetRow}=""), "", ${sheetName}!$H${targetRow}*(Items!$V${itemRow} / 100))`);
        } else if (total2SheetName === 'Total2_oscr') {
          total2Sheet.getRange(targetRow, idx + 4).setFormula(`=IF(or(${sheetName}!$B$2="", ${sheetName}!$H${targetRow}=""), "", ${sheetName}!$H${targetRow}*(Items!$W${itemRow} / 100))`);
        }
        else {
          total2Sheet.getRange(targetRow, idx + 4).setFormula(`=IF(or(${sheetName}!$B$2="", ${sheetName}!$H${targetRow}=""), "", ${sheetName}!$H${targetRow})`);
        }
      });
      total2Sheet.getRange(`L${targetRow}`).setFormula(`=if(sum(D${targetRow}:K${targetRow})=0, "",sum(D${targetRow}:K${targetRow}))`);
      total2Sheet.getRange(`N${targetRow}`).setFormula(`=if(L${targetRow}="",0,1)`);
  });
}
function issue100_setTotal1Sheet_() {
  const targetRow = getTargetRow_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(total1SheetNames[0]));
  const itemRow = targetRow - 2;
  total1SheetNames.forEach(sheetName => {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      sheet.getRange(targetRow, 2).setFormula(`=Items!A${itemRow}`);
      sheet.getRange(targetRow, 3).setFormula(`=Items!B${itemRow}`);
      if (sheetName === "Total_nmc") {
        sheet.getRange(targetRow, 4).setFormula(`=Items!C${itemRow}*(Items!$V${itemRow} / 100)`);
      } else if (sheetName === "Total_oscr") {
        sheet.getRange(targetRow, 4).setFormula(`=Items!C${itemRow}*(Items!$W${itemRow} / 100)`);
      } else {
        sheet.getRange(targetRow, 4).setFormula(`=Items!C${itemRow}`);
      }
      sheet.getRange(targetRow, 5).setValue("x");
      sheet.getRange(targetRow, 6).setFormula(`=Setup!F${targetRow}*Trial!C32+Registration_1!F${targetRow}*Trial!C33+Registration_2!F${targetRow}*Trial!C34+Interim_1!F${targetRow}*Trial!C35+Observation_1!F${targetRow}*Trial!C36+Interim_2!F${targetRow}*Trial!C37+Observation_2!F${targetRow}*Trial!C38+Closing!F${targetRow}*Trial!C39`);
      sheet.getRange(targetRow, 7).setFormula(`=Items!D${itemRow}`);
      sheet.getRange(targetRow, 8).setFormula(`=IF(F${targetRow}="","",D${targetRow}*F${targetRow})`);
      sheet.getRange(`L${targetRow}`).setFormula('=if(or(indirect("H" & row())=0,indirect("H" & row())=""),0,1)');
  });
}
function issue100TrialTermEdit_(flag=0) {
  const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
  trialSheet.getRange("B44").setValue(1);
  const targetRowNumbers = Array.from({ length: 9 }, (_, i) => i + 32);
  targetRowNumbers.forEach(rowNumber => {
    const targetRange = trialSheet.getRange(rowNumber, 4);
    if (flag === 0) {
      targetRange.clearContent();
      targetRange.offset(0, 1).clearContent();
    } else {
      if (rowNumber === 40) {
        targetRange.setValue(new Date(2032, 3, 1));
        targetRange.offset(0, 1).setValue(new Date(2040, 2, 31));        
      } else {
        targetRange.setValue(new Date(2000+rowNumber, 3, 1));
        targetRange.offset(0, 1).setValue(new Date(2000+rowNumber+1, 2, 31));
      }
    }
  });
}
function issue100SetupClosingEdit_(flag=0) {
  const setText = flag === 0 ? "" : 2;
  setupToClosingSheetNames.forEach(sheetName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    sheet.getRange("F16").setValue(setText);
    sheet.getRange("F17").setValue(setText);
  });
}
function issue100TestSheetClear_() {
  issue100TrialTermEdit_(flag=0);
  issue100SetupClosingEdit_(flag=0);
  const itemSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Items");
  itemSheet.getRange("B14").setValue("キックオフミーティング準備・実行");
  itemSheet.getRange("B15").setValue("症例検討会準備・実行");
  SpreadsheetApp.flush();
}
function issue100Validate_(actual, expected, sheetName, cellAddress="") {
  if (actual !== expected) {
    const roundedExpected = Math.round(expected / 1000) * 1000;
    if (actual !== roundedExpected) {
      throw new Error(
        `シート「${sheetName}」の合計金額が一致しません（期待値: ${roundedExpected}, 実際: ${actual}）`
      );
    }
  }else {
    console.log(
      `シート「${sheetName}」のセル ${cellAddress} の合計金額が正しく設定されています（${actual}）`
    );
  }
}
function issue100ValidateTotal_(range, unitPrice, sheetCount=8, itemCount=2) {
  const actual = range.getValue();
  const expected = unitPrice * sheetCount * itemCount;
  const sheetName = range.getSheet().getName();
  issue100Validate_(actual, expected, sheetName, range.getA1Notation());
}
function issue100GetSumTotal_(itemPrice) {
  const res = [itemPrice, itemPrice * 0.67, itemPrice * 0.33];
  return(res);
}
function issue100PriceSheetTest_(itemPrice=81000, rowNumber=14) {
  const priceSheets = priceSheetNames.map(sheetName => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName));
  issue100Validate_(priceSheets[0].getRange(`C${rowNumber}`).getValue(), itemPrice, priceSheetNames[0]);
  issue100Validate_(priceSheets[0].getRange(`E${rowNumber}`).getValue(), itemPrice * 1.5, priceSheetNames[0]);
  issue100Validate_(priceSheets[1].getRange(`C${rowNumber}`).getValue(), itemPrice * 1.5, priceSheetNames[1]);
  issue100Validate_(priceSheets[2].getRange(`C${rowNumber}`).getValue(), itemPrice, priceSheetNames[2]);
}
function issue100_template_test_main() {
  const totalSheets = total1SheetNames.map(sheetName => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName));
  const total2Sheets = total2SheetNames.map(sheetName => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName));
  const itemSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Items");
  issue100TestSheetClear_();
  // test1:setup ~ closingまでの全てのシートの値が足し込まれることを確認する
  issue100TrialTermEdit_(flag=1);
  issue100SetupClosingEdit_(flag=1);
  SpreadsheetApp.flush();
  let testSum = issue100GetSumTotal_(406000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H17"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L17"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H16"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L16"), value));
  // test2:items!B15を「Web症例検討会準備・実行」に変更した場合のテスト
  itemSheet.getRange("B15").setValue("Web症例検討会準備・実行");
  SpreadsheetApp.flush();
  testSum = issue100GetSumTotal_(81000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H17"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L17"), value));
  testSum = issue100GetSumTotal_(406000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H16"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L16"), value));
  // test2:items!B14を「Webミーティング準備・実行」に変更した場合のテスト
  itemSheet.getRange("B14").setValue("Webミーティング準備・実行");
  SpreadsheetApp.flush();
  testSum = issue100GetSumTotal_(81000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H16"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L16"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H17"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L17"), value));
  // test2:items!B14を「キックオフミーティング準備・実行」に変更した場合のテスト
  itemSheet.getRange("B14").setValue("キックオフミーティング準備・実行");
  SpreadsheetApp.flush();
  testSum = issue100GetSumTotal_(406000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H16"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L16"), value));
  testSum = issue100GetSumTotal_(81000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H17"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L17"), value));
  // test2:items!B14を「Webミーティング準備・実行」に変更した場合のテスト
  itemSheet.getRange("B14").setValue("Webキックオフミーティング準備・実行");
  SpreadsheetApp.flush();
  testSum = issue100GetSumTotal_(81000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H16"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L16"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H17"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L17"), value));
  // test3:係数が正しくかかるか
  const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
  issue100PriceSheetTest_(itemPrice=81000, rowNumber=14);
  issue100PriceSheetTest_(itemPrice=81000, rowNumber=13);
  trialSheet.getRange("B44").setValue(1.5);
  issue100PriceSheetTest_(itemPrice=81000, rowNumber=14);
  issue100PriceSheetTest_(itemPrice=81000, rowNumber=13);
  issue100Validate_(itemSheet.getRange("C14").getValue(), 81000 * 1.5, itemSheet.getName());
  issue100Validate_(itemSheet.getRange("C15").getValue(), 81000 * 1.5, itemSheet.getName());
}
function issue100_template_fix_main() {
  issue100_insertRow_();
  issue100_editItems_();
  issue100_setPriceSheet_();
  issue100_setPriceLogicCompanySheet_(1);
  issue100_setPriceLogicCompanySheet_(2);
  issue100_setSetupToClosingSheet_();
  issue100_setTotal1Sheet_();
  issue100_setTotal2Sheet_();
}
function issue100_script_test(testFlag=null) {
  if (testFlag === null) {
    return;
  }
  issue100TestSheetClear_();
  const quotation_requestSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quotation Request");
  quotation_requestSheet.getRange("A2:AR2").clearContent();
  quotation_requestSheet.getRange("A2").setValue(new Date());
  quotation_requestSheet.getRange("B2").setValue("参考見積");
  quotation_requestSheet.getRange("C2:F2").setValues([["test", "test", "test", "test"]]);
  quotation_requestSheet.getRange("G2").setValue("医師主導治験");
  quotation_requestSheet.getRange("H2:K2").setValues([["なし", "なし", "なし", "なし"]]);
  quotation_requestSheet.getRange("O2:R2").setValues([[0,0,0,0]]);
  quotation_requestSheet.getRange("S2").setValue("設置・委託しない");
  quotation_requestSheet.getRange("T2").setValue("設置・委託しない");
  quotation_requestSheet.getRange("U2").setValue("なし");
  quotation_requestSheet.getRange("V2").setValue(20);
  quotation_requestSheet.getRange("W2").setValue(10);
  quotation_requestSheet.getRange("X2").setValue(100);
  quotation_requestSheet.getRange("Y2").setValue(new Date(2020, 0, 1));
  quotation_requestSheet.getRange("Z2").setValue(new Date(2025, 10, 30));
  quotation_requestSheet.getRange("AA2").setValue(new Date(2026, 9, 30));
  quotation_requestSheet.getRange("AB2").setValue("あり");
  quotation_requestSheet.getRange("AG2").setValue("なし");
  quotation_requestSheet.getRange("AL2").setValue("なし");
  quotation_requestSheet.getRange("AN2").setValue("営利企業原資（製薬企業等）");
  quotation_requestSheet.getRange("AO2").setValue("なし");
  quotation_requestSheet.getRange("AP2").setValue("なし");
  quotation_requestSheet.getRange("AQ2").setValue("あり");
  if (testFlag === 1) {
    quotation_requestSheet.getRange("I2").setValue("あり");
  }
  if (testFlag === 4) {
    quotation_requestSheet.getRange("AB2").setValue("なし");
  }
  SpreadsheetApp.flush();
  quote_script_main();
  total2_3_add_del_cols();
  check_output_values();
  const checkSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Check");
  issue100CheckCellsForOK_(checkSheet);
  console.log(`check ok.test:${testFlag}`);
}

function issue100CheckCellsForOK_(sheet) {
  const range = sheet.getRange("A3:A100");
  const values = range.getValues(); // 2次元配列（行ごとの配列）

  for (let i = 0; i < values.length; i++) {
    const val = values[i][0]; // A列の値
    if (val !== "" && val !== "OK") {
      throw new Error(`A${i + 3} に不正な値「${val}」が入力されています。`);
    }
  }
}

function issue100_script_test_main() {
  // 症例検討会は医師主導治験の場合のみ入力可能
  // test1: 医師主導治験かつ症例検討会ありの場合に症例検討会準備・実行が一回取られることを確認する
  issue100_script_test(testFlag=1);
  // test2: 医師主導治験かつ症例検討会なしの場合に症例検討会準備・実行がゼロ回であることを確認する
  issue100_script_test(testFlag=2);
  // test3: キックオフミーティングありの場合にキックオフミーティング準備・実行が一回取られることを確認する
  issue100_script_test(testFlag=3);
  // test4: キックオフミーティングなしの場合にミーティング準備・実行がゼロ回であることを確認する
  issue100_script_test(testFlag=4);
}

function issue100AddValidationItem_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Items");
  const range = sheet.getRange("B14");
  
  // 既存の入力規則を取得
  const rule = range.getDataValidation();
  
  if (!rule) {
    Logger.log("このセルには入力規則が設定されていません。");
    return;
  }

  const criteria = rule.getCriteriaType();
  const args = rule.getCriteriaValues();

  // 入力規則がリスト型の場合のみ処理
  if (criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
    const existingList = args[0];
    
    // 新しい項目を追加（重複しないように）
    if (!existingList.includes("キックオフミーティング準備・実行")) {
      existingList.push("キックオフミーティング準備・実行");
      existingList.push("Webキックオフミーティング準備・実行");

      // 新しいルールを作成しなおして設定
      const newRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(existingList, true) // true = ドロップダウン表示
        .setAllowInvalid(rule.getAllowInvalid())
        .build();

      range.setDataValidation(newRule);
    }
  } else {
    Logger.log("このセルの入力規則はリスト型ではありません。");
  }
}

