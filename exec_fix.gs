function test(){
  const aaa = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2').getRange('D87').getFormula();
  const bbb = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2').getRange('D88').getFormula();
  console.log(aaa);
  console.log(bbb);
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2').getRange('D87').copyTo(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2').getRange('D88'));
}
function fix20220124(){
  // 85行目以降に5行追加する
  let sheetsAddRow = get_sheets();
  sheetsAddRow.items.getRange('B85').setValue('TV会議');
  sheetsAddRow.items.getRange('S85').setValue(65000);
  sheetsAddRow.items.getRange('T85').setValue(0.25);
  sheetsAddRow.items.getRange('U85').setValue(5);
  sheetsAddRow.items.getRange('V85').setValue(90);
  sheetsAddRow.items.getRange('W85').setValue(10);
  const insertTargetRow = 87;
  const total2Sheets = Object.keys(sheetsAddRow).map(x => sheetsAddRow[x].getName().toLowerCase()).filter(x => x.match('total2'));
  const excludeSheets = ['trial', 'quotation_request', 'total3', 'quote', 'check', 'items'].concat(total2Sheets);
  excludeSheets.forEach(x => delete sheetsAddRow[x]);
  Object.keys(sheetsAddRow).forEach(x => {
    const targetSheet = sheetsAddRow[x];
    targetSheet.insertRowsAfter(insertTargetRow, 5);
    for (let i = 1; i <= 5; i++){
      let rowNumber = insertTargetRow + i;
      let itemsRowNumber = rowNumber - 2;
      if (targetSheet.getName() != 'items'){
        targetSheet.getRange(rowNumber, 2).setValue('=Items!A' + itemsRowNumber); 
        targetSheet.getRange(rowNumber, 3).setValue('=Items!B' + itemsRowNumber); 
        targetSheet.getRange(rowNumber, 4).setValue('=Items!C' + itemsRowNumber); 
        targetSheet.getRange(rowNumber, 5).setValue('x'); 
        targetSheet.getRange(rowNumber, 7).setValue('=Items!D' + itemsRowNumber); 
        targetSheet.getRange(rowNumber, 8).setValue('=IF(F' + rowNumber + '="","",D' + rowNumber + '*F' + rowNumber + '))'); 
        targetSheet.getRange(rowNumber, 12).setValue('=if(F' + rowNumber + '="",0,1)'); 
      }
      if (targetSheet.getName() == 'Total'){
        // F列
        let totalCol6Value = '=Setup!F' + rowNumber + '*Trial!C32+Registration_1!F' + rowNumber + '*Trial!C33+Registration_2!F' + rowNumber + '*Trial!C34+Interim_1!F' + rowNumber + '*Trial!C35+Observation_1!F' + rowNumber + '*Trial!C36+Interim_2!F' + rowNumber + '*Trial!C37+Observation_2!F' + rowNumber + '*Trial!C38+Closing!F' + rowNumber + '*Trial!C39'; 
        targetSheet.getRange(rowNumber, 6).setValue(totalCol6Value); 
      }
      if (targetSheet.getName() == 'items'){
        let rowNumber = insertTargetRow + i;
        sheetsAddRow.items.getRange(rowNumber, 3).setValue('=round(R' + rowNumber + '*Trial!$B$44, -3)');
        sheetsAddRow.items.getRange(rowNumber, 4).setValue('回');
        sheetsAddRow.items.getRange(rowNumber, 3).setValue('=round(S' + rowNumber + '*T' + rowNumber + '*U' + rowNumber + ', -3)');
      }
    }
  });
  total2Sheets.forEach(x => {
    const targetSheet = sheetsAddRow[x];
    targetSheet.insertRowsAfter(insertTargetRow, 5);
    for (let i = 1; i <= 5; i++){
      let rowNumber = insertTargetRow + i;
      let itemsRowNumber = rowNumber - 2;
      targetSheet.getRange(rowNumber, 2).setValue('=Items!A' + itemsRowNumber); 
      targetSheet.getRange(rowNumber, 3).setValue('=Items!B' + itemsRowNumber); 


    }
  });
  PropertiesService.getScriptProperties().deleteAllProperties();
  initial_process();
  filtervisible();
  // 85行目以降に5行追加する

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
