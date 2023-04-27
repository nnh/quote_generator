function test20230427() {
  const total2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2');
  const setFormulaTotal2Array1 = new Array(8).fill('=getTotal2Years(address(2, column()))');
  total2.getRange('D4:K4').setFormulas([setFormulaTotal2Array1]);
}
