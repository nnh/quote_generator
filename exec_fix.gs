function fix20220124(){
  PropertiesService.getScriptProperties().deleteAllProperties();
  initial_process();
  filtervisible();
  let sheetsAddRow = get_sheets();
  sheetsAddRow.items.getRange('B85').setValue('TV会議');
  sheetsAddRow.items.getRange('S85').setValue(65000);
  sheetsAddRow.items.getRange('T85').setValue(0.25);
  sheetsAddRow.items.getRange('U85').setValue(5);
  sheetsAddRow.items.getRange('V85').setValue(90);
  sheetsAddRow.items.getRange('W85').setValue(10);
  const targetSheets = [ 'Items',
  'Setup',
  'Registration_1',
  'Registration_2',
  'Interim_1',
  'Observation_1',
  'Interim_2',
  'Observation_2',
  'Closing',
  'Total',
  'Total2',
  'Total_nmc',
  'Total2_nmc',
  'Total_oscr',
  'Total2_oscr' ];
  targetSheets.forEach(x => {
    const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    const insertTargetRow = targetSheet.getName() == 'Items' ? 87 : 89;
    targetSheet.insertRowsAfter(insertTargetRow, 5);
    const copyFromRow = insertTargetRow;
    const lastCol = targetSheet.getLastColumn();
    for (let i = 1; i <= 5; i++){
      let rowNumber = insertTargetRow + i;
      targetSheet.getRange(copyFromRow, 1, 1, lastCol).copyTo(targetSheet.getRange(rowNumber, 1, 1, lastCol));  
      if (targetSheet.getName() == 'Total' || targetSheet.getName() == 'Total_nmc' || targetSheet.getName() == 'Total_oscr'){
        let totalCol6Value = '=Setup!F' + rowNumber + '*Trial!C32+Registration_1!F' + rowNumber + '*Trial!C33+Registration_2!F' + rowNumber + '*Trial!C34+Interim_1!F' + rowNumber + '*Trial!C35+Observation_1!F' + rowNumber + '*Trial!C36+Interim_2!F' + rowNumber + '*Trial!C37+Observation_2!F' + rowNumber + '*Trial!C38+Closing!F' + rowNumber + '*Trial!C39'; 
        targetSheet.getRange(rowNumber, 6).setValue(totalCol6Value); 
      }
      if (targetSheet.getName() != 'Total2' && targetSheet.getName() != 'Total2_nmc' && targetSheet.getName() != 'Total2_oscr' && targetSheet.getName() != 'Items'){
        targetSheet.getRange(96, 8).setValue('=sum(H6:H95)'); 
        targetSheet.getRange(80, 9).setValue('=sum(H81:H94)'); 
        targetSheet.getRange(80, getColumnNumber('L')).setValue('=if(I80 > 0, 2, 0)');
      }
    }
  });
  let temp = Array(7);
  temp.fill(100);
  const percentageValues = temp.map(x => [x, 0]);
  sheetsAddRow.items.getRange('V86:W92').setValues(percentageValues);
}
function fix20220113_(){
  PropertiesService.getScriptProperties().deleteAllProperties();
  initial_process();
  filtervisible();
  const sheets = get_sheets();
  if (sheets.trial.getMaxColumns() <= 6){
    sheets.trial.insertColumnsAfter(6, 2);
  }
  sheets.trial.getRange('G31:H31').setValues([['現在未使用：割引後金額（年度毎）', '現在未使用：割引率（年度毎）']]);
  for (let i = 32; i < 40; i++){
    sheets.trial.getRange(i, 8).setValue('=$B$47');
    sheets.trial.getRange(i, 8).setNumberFormat('0%');
  }
  // Total2
  const get_s_p = PropertiesService.getScriptProperties();
  const total_foot_T = ['', '_' + get_s_p.getProperty('name_nmc'), '_' + get_s_p.getProperty('name_oscr')];
  const total2List = total_foot_T.map(x => 'total2' + x);
  total2List.forEach(x => {
    for (i = 4; i <= 11; i++){
      let tempBefore = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange(92, i).getFormula();
      let targetCol = getColumnString(i);
      let tempAfter = tempBefore.substring(1, tempBefore.length - 3) + targetCol + '91)';
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange(92, i).setFormula(tempAfter);
    }
  });
  const beforeformulas = total2List.map(x => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange('L92').getFormula());
  const afterformulas = beforeformulas.map(x => String(x).replace(/""\)$/, 'L91)'));
  total2List.forEach((x, idx) => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange('L92').setFormula(afterformulas[idx]));
  // Total3
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('total3').getRange('L28').setFormula('=if(and(L27>0, Trial!$B$47<>0),(L27*(1-Trial!$B$47)), L27)');
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('total3').getRange('L28').setNumberFormat('#,##0');
  for (i = 4; i <= 11; i++){
    let targetCol = getColumnString(i);
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('total3').getRange(28, i).setFormula('=if(and(' + targetCol + '27<>"", Trial!$B$47<>0),(' + targetCol + '27*(1-Trial!$B$47)), ' + targetCol + '27)');
  }
}
