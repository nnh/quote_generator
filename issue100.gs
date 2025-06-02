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
    sheet.getRange("F17").setValue(setText);
  });
}
function issue100TestSheetClear_() {
  issue100TrialTermEdit_(flag=0);
  issue100SetupClosingEdit_(flag=0);
  const itemSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Items");
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
function issue100PriceSheetTest_(itemPrice=81000) {
  const priceSheets = priceSheetNames.map(sheetName => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName));
  issue100Validate_(priceSheets[0].getRange("C14").getValue(), itemPrice, priceSheetNames[0]);
  issue100Validate_(priceSheets[0].getRange("E14").getValue(), itemPrice * 1.5, priceSheetNames[0]);
  issue100Validate_(priceSheets[1].getRange("C14").getValue(), itemPrice * 1.5, priceSheetNames[1]);
  issue100Validate_(priceSheets[2].getRange("C14").getValue(), itemPrice, priceSheetNames[2]);
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
  // test2:items!B15を「Web症例検討会準備・実行」に変更した場合のテスト
  itemSheet.getRange("B15").setValue("Web症例検討会準備・実行");
  SpreadsheetApp.flush();
  testSum = issue100GetSumTotal_(81000);
  testSum.forEach((value, idx) => issue100ValidateTotal_(totalSheets[idx].getRange("H17"), value));
  testSum.forEach((value, idx) => issue100ValidateTotal_(total2Sheets[idx].getRange("L17"), value));
  // test3:係数が正しくかかるか
  const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
  issue100PriceSheetTest_();
  trialSheet.getRange("B44").setValue(1.5);
  issue100PriceSheetTest_();
  issue100Validate_(itemSheet.getRange("C15").getValue(), 81000 * 1.5, itemSheet.getName());
}
function issue100_fix_main() {
  issue100_insertRow_();
  issue100_editItems_();
  issue100_setPriceSheet_();
  issue100_setPriceLogicCompanySheet_(1);
  issue100_setPriceLogicCompanySheet_(2);
  issue100_setSetupToClosingSheet_();
  issue100_setTotal1Sheet_();
  issue100_setTotal2Sheet_();
}
