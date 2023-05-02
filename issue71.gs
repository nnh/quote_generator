function test20230427() {
  const total2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2');
  total2.getRange('D4:K4').clearContent();
}
