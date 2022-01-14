function fix20220113(){
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
    sheets.trial.getRange(i, 8).setNumberFormat('0%');;
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