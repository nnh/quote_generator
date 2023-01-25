function setItemsSheet20230125() {
  // issue #47
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Items');
  itemsSheet.getRange('B14').clearDataValidations();
  itemsSheet.getRange('B14').setDataValidation(SpreadsheetApp.newDataValidation()
  .setAllowInvalid(false)
  .requireValueInList(['ミーティング準備・実行', 'Webミーティング準備・実行'], true)
  .build());
  itemsSheet.getRange('T14').setFormula('=if($B14="ミーティング準備・実行", 6.25, 0.25)');
  itemsSheet.getRange('U14').setFormula('=if($B14="ミーティング準備・実行", 1, 5)');
  itemsSheet.getRange('B85').clearContent();
  itemsSheet.getRange('S85:U85').clearContent();
}
