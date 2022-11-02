function test20221102() {
  const inputSheetsName = [
    'Setup',
    'Registration_1',
    'Registration_2',
    'Interim_1',
    'Observation_1',
    'Interim_2',
    'Observation_2',
    'Closing'
  ];
  const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial');
  trialSheet.getRange('B28').setValue(100);
  trialSheet.getRange('B29').setValue(50);
  trialSheet.getRange('B30').setValue(1000);
  trialSheet.getRange('D32').setValue('2022/4/1');
  trialSheet.getRange('D33').setValue('2023/4/1');
  trialSheet.getRange('D34').setValue('2024/4/1');
  trialSheet.getRange('D35').setValue('2025/4/1');
  trialSheet.getRange('D36').setValue('2026/4/1');
  trialSheet.getRange('D37').setValue('2027/4/1');
  trialSheet.getRange('D38').setValue('2028/4/1');
  trialSheet.getRange('D39').setValue('2029/4/1');
  trialSheet.getRange('E32').setValue('2023/3/31');
  trialSheet.getRange('E33').setValue('2024/3/31');
  trialSheet.getRange('E34').setValue('2025/3/31');
  trialSheet.getRange('E35').setValue('2026/3/31');
  trialSheet.getRange('E36').setValue('2027/3/31');
  trialSheet.getRange('E37').setValue('2028/3/31');
  trialSheet.getRange('E38').setValue('2029/3/31');
  trialSheet.getRange('E39').setValue('2030/3/31');
  inputSheetsName.forEach(x => {
    const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    for (let i = 6; i < 84; i++){
      if (targetSheet.getRange(i, 4).getValue() > 0){
        targetSheet.getRange(i, 6).setValue(2);
      }
    }
  });
}
// 削除予定、システム開発の項目削除を行う
function edit20221102() {
  const targetSheetsName = [
    'Total',
    'Total2',
    'Total_nmc',
    'Total2_nmc',
    'Total_oscr',
    'Total2_oscr',
    'Setup',
    'Registration_1',
    'Registration_2',
    'Interim_1',
    'Observation_1',
    'Interim_2',
    'Observation_2',
    'Closing'
  ];
  // Total~Closing
  const targetSheets = targetSheetsName.map(x => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x)); 
  targetSheets.forEach(x => deleteTargetRows_(x, 12, 2));
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Items');
  // Quote
  ['Quote', 'Quote_nmc', 'Quote_oscr'].forEach(x => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    if (sheet.getRange('C15').getValue() === '削除予定'){
      sheet.deleteRows(15, 2);
    }
  });
  // Items 10~13行目を削除
  deleteTargetRows_(itemsSheet, 10, 1);
  // Quote
  ['Quote', 'Quote_nmc', 'Quote_oscr'].forEach(x => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    if (sheet.getRange('C28').getValue() === ''){
      sheet.deleteRows(28, 2);
    }
  });
}
function deleteTargetRows_(sheet, startRow, headingCol){
  if (sheet.getRange(startRow, headingCol).getValue() === '削除予定'){
    sheet.deleteRows(startRow, 4);
  }
}