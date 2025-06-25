/*
const total2SheetNames = [
  'Total2',
  'Total2_nmc',
  'Total2_oscr'
];
*/
function issue105() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  total2SheetNames.forEach(sheetName => ss.getSheetByName(sheetName).getRange("N75").setValue('=if(AND(L76="", L77=""),0,2)'));
  total2SheetNames.forEach(sheetName => console.log(ss.getSheetByName(sheetName).getRange("N75").getFormula()));
}
