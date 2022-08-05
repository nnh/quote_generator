function fix20220806testExec(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // 全てのシートを表示する
  ss.getSheets().forEach(x => x.showSheet());
  const outputSheetName = 'testOutput';
  try{
    if (!ss.getSheetByName(outputSheetName)){
      throw e;
    };
  } catch(e){
    ss.insertSheet();
    ss.getActiveSheet().setName(outputSheetName);
  }
  const outputSheet = ss.getSheetByName(outputSheetName);
  outputSheet.clearContents();
  fix20220806test1_(outputSheet);
  fix20220806test2_(outputSheet);
  // 全てのシートを表示する
  ss.getSheets().forEach(x => x.showSheet());
}
function fileNameChange_(targetName){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ss_id = ss.getId();
  const file = DriveApp.getFileById(ss_id);
  file.setName(targetName);
}
function fix20220806test1_(outputSheet){
  // テスト1：全てのシートが表示の場合、PDFが正しく出力され、非表示になっているシートがないことを確認する。
  fileNameChange_('test20220805_1');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // 全てのシートを表示する
  ss.getSheets().forEach(x => x.showSheet());
  ssToPdf();
  const res = outputConsoleLogSheetNameAndisHidden();
  const checkOkNg = res.every(x => x.isSheetHidden === "表示") ? 'OK' :'NG';
  outputLog_(outputSheet, [['test1 start：全てのシートが表示の場合、PDFが正しく出力され、非表示になっているシートがないことを確認する。']]);
  outputLog_(outputSheet, [['シートの表示状態：' + checkOkNg]]);
  outputLog_(outputSheet, [['test1 end']]);
}
function outputLog_(sheet, values){
  const outputRow = sheet.getDataRange().getLastRow() + 1;
  sheet.getRange(outputRow, 1, values.length, values[0].length).setValues(values);
}
function outputConsoleLogSheetNameAndisHidden(){
  const res = SpreadsheetApp.getActiveSpreadsheet().getSheets().map(x => {
    let temp = {};
    temp.name = x.getName();
    temp.isSheetHidden = x.isSheetHidden() ? '非表示' : '表示';
    return temp;
  });  
  return res;
}
function fix20220806test2_(outputSheet){
  // テスト2：PDF出力対象シートが全て非表示の場合にPDFが出力されないことを確認する
  fileNameChange_('test20220805_2');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  // 全てのシートを表示する
  ss.getSheets().forEach(x => x.showSheet());
  let target_sheets = get_target_term_sheets();
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('quote_sheet_name')));
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('total_sheet_name')));
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('total2_sheet_name')));
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('total3_sheet_name')));
  const targetsheetname = target_sheets.map(x => x.getName());
  ss.getSheets().forEach(x => {
    if (targetsheetname.includes(x.getName())){
      x.hideSheet();
    }
  });
  const saveStatus = outputConsoleLogSheetNameAndisHidden();
  // nmc, oscr, 横だけ出力されればOK
  ssToPdf();
  const res = outputConsoleLogSheetNameAndisHidden();  
  const checkOkNg = JSON.stringify(saveStatus) === JSON.stringify(res) ? 'OK' :'NG';
  outputLog_(outputSheet, [['test2 start：PDF出力対象シートが全て非表示の場合にPDFが出力されないことを確認する']]);
  outputLog_(outputSheet, [['シートの表示状態：'+ checkOkNg]]);
  outputLog_(outputSheet, [['test2 end']]);
}
function fix20220124_(){
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
