/*
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
 */
function issue103_deleteTargetRow_(sheetName, rowNumber) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.deleteRow(rowNumber);
}
function issue103_fix_template() {
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(itemSheetName);
  if (itemsSheet.getRange("B27").getValue() === "開始前モニタリング・必須文書確認") {
    // setup ~ closing、Total、Total2の29行目を削除
    const deleteRow29SheetNames = [...setupToClosingSheetNames, ...totalSheetNames];
    const deleteSheetAndRowMap = new Map();
    deleteRow29SheetNames.forEach(sheetName => deleteSheetAndRowMap.set(sheetName, 29));
    // price関連の26行目を削除
    priceSheetNames.forEach(sheetName => deleteSheetAndRowMap.set(sheetName, 26));
    // itemsの27行目を削除
    deleteSheetAndRowMap.set(itemSheetName, 27);
    deleteSheetAndRowMap.forEach((rowNumber, sheetName) => issue103_deleteTargetRow_(sheetName, rowNumber));
  }
  itemsSheet.getRange("S27:U27").setValues([["=50000*TIAI!$B$2/100", "20", "2"]]);
  itemsSheet.getRange("B27").setDataValidation(null);
  itemsSheet.getRange("B27").setValue('="開始前モニタリング・必須文書確認" & char(10) & "症例モニタリング・SAE対応"');
  itemsSheet.getRange("D27").setValue("ヶ月");
}
function issue103_deleteRowCheck() {
  // 行削除後テスト
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(itemSheetName);
  // Items!A3:C92とsetup~closing、Totalの!B5:D94が一致することを確認
  const itemCheck1 = itemsSheet.getRange("A3:C92").getValues();
  const totalAndSetupToClosingSheetNames = ['Total', ...setupToClosingSheetNames];
  totalAndSetupToClosingSheetNames.forEach(sheetName => {
    const checkValues = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange("B5:D94").getValues();
    for (let col=0; col < 3; col++) {
      for (let row=0; row < checkValues.length; row++) {
        if (itemCheck1[row][col] !== checkValues[row][col]) {
          if (row === 8 && col === 2) {
            //console.log("プロジェクト管理はスキップ")
          } else {
            console.log("error:check1");
            console.log(itemCheck1[row][col]);
            console.log(checkValues[row][col]);
            throw Error(`sheetName:${sheetName}_row:${row}_col${col}`);
          }
        }
      }
    }
  });
  // Items!D3:D92とsetup~closing!G5:G94が一致することを確認
  const itemCheck2 = itemsSheet.getRange("D3:D92").getValues();
  totalAndSetupToClosingSheetNames.forEach(sheetName => {
    const checkValues = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange("G5:G94").getValues();
    for (let col=0; col < 1; col++) {
      for (let row=0; row < checkValues.length; row++) {
        if (itemCheck2[row][col] !== checkValues[row][col]) {
            console.log("error:check2");
            console.log(itemCheck2[row][col]);
            console.log(checkValues[row][col]);
          throw Error(`sheetName:${sheetName}_row:${row}_col${col}`);
        }
      }
    }
  });
  // Items!A3:B92とTotal2, Total_nmc, Total_oscrの!B5:D94が一致することを確認, Total_nmcとかの価格は別で確認
  const itemCheck3 = itemsSheet.getRange("A3:B92").getValues();
  const total2AndTotalNmcAndOscrSheetsNames = [...total2SheetNames, total1SheetNames[1], total1SheetNames[2]];
  total2AndTotalNmcAndOscrSheetsNames.forEach(sheetName => {
    const checkValues = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange("B5:C94").getValues();
    for (let col=0; col < 2; col++) {
      for (let row=0; row < checkValues.length; row++) {
        if (itemCheck3[row][col] !== checkValues[row][col]) {
            console.log("error:check3");
            console.log(itemCheck3[row][col]);
            console.log(checkValues[row][col]);
            throw Error(`sheetName:${sheetName}_row:${row}_col${col}`);
        }
      }
    }
  });

}