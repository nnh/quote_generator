function myFunction(){
  const targetSheetNames = ['Price', 'PriceLogicCompany', 'PriceLogic'];
  targetSheetNames.forEach(sheetName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    const targetRange = sheet.getRange(2, 8, lastRow, 1);
    const targetValues = targetRange.getValues();
    // 2行目から最終行までH列に1をセット
    targetValues.fill(['1']);
    targetRange.setValues(targetValues);
    // 57-68行目を非表示にするためH列に0をセット
    const targetRange1 = sheet.getRange('H57:H68');
    const targetValues1 = targetRange1.getValues();
    targetValues1.fill(['0']);
    targetRange1.setValues(targetValues1);
    // 72-91行目を非表示にするためH列に0をセット
    const targetRange2 = sheet.getRange('H72:H91');
    const targetValues2 = targetRange2.getValues();
    targetValues2.fill(['0']);
    targetRange2.setValues(targetValues2);
    test20230125_2(sheet, targetRange);
  });
}
function test20230125_2(sheet, targetRange){
  let conditionalFormatRules = sheet.getConditionalFormatRules();
  conditionalFormatRules.splice(conditionalFormatRules.length - 1, 1, SpreadsheetApp.newConditionalFormatRule()
  .setRanges([targetRange])
  .whenTextEqualTo('1')
  .setBackground('#FFFFFF')
  .setFontColor('#FFFFFF')
  .build());
  sheet.setConditionalFormatRules(conditionalFormatRules);
}
