function fix20211209(){
  initial_process();
  const sheets = get_sheets();
  if (sheets.trial.getMaxColumns() <= 6){
    sheets.trial.insertColumnsAfter(6, 2);
  }
  sheets.trial.getRange('A46').setValue('割引後金額（合計）')
  sheets.trial.getRange('A47').setValue('割引率（合計）')
  sheets.trial.getRange('G31:H31').setValues([['割引後金額（年度毎）', '割引率（年度毎）']]);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheetsName = ['Setup', 'Registration_1', 'Registration_2', 'Interim_1', 'Observation_1', 'Interim_2', 'Observation_2', 'Closing'];
  const trialYearsStartRow = 32;

//  sheets.trial.getRange('H32:H39').setNumberFormat('0%');
//  sheets.trial.getRange('G32:G39').setNumberFormat('#,##0')
  targetSheetsName.forEach((x, idx) => {
    // Trialシート
    const trialTargetRow = parseInt(trialYearsStartRow + idx);
    ss.getSheetByName('Trial').getRange(trialTargetRow, 8).setValue('=if(C' + trialTargetRow + '<>"", if(not(isblank($B$46)), $B$47, if(and(not(ISBLANK($G$' + trialTargetRow + ')), ' + x + '!$H$91 > 0), (' + x + '!$H$91 - ($G$' + trialTargetRow + ' / (1 + $B$45))) / ' + x + '!$H$91, 0)), "")');
    ss.getSheetByName('Trial').getRange(trialTargetRow, 8).setNumberFormat('0%');
    ss.getSheetByName('Trial').getRange(trialTargetRow, 7).setNumberFormat('#,##0');
    ss.getSheetByName('Trial').getRange('B47').setValue('=if(not(ISBLANK(B46)),(Quote!D32-(B46/(1+$B$45)))/Quote!D32,if(COUNTBLANK(G32:G39)<>rows(G32:G39), sum(H32:H39)/counta(H32:H39), 0))');
    ss.getSheetByName('Trial').getRange('B47').setNumberFormat('0%');
    // 各シートへの割引後金額の反映
    ss.getSheetByName(x).getRange('H92').setValue('=if(Trial!H$' + parseInt(trialYearsStartRow + idx) + '>0, H91*(1-Trial!$H$' + parseInt(trialYearsStartRow + idx) + '), if(Trial!$B$47>0, H91*(1-Trial!$B$47), ""))');
    // フィルタ条件の修正
    ss.getSheetByName(x).getRange('L92').setValue('=if(H92<>"", 1, 0)');
  });
  sheets.trial.setColumnWidth(1, 120);
  sheets.trial.setColumnWidth(7, 130);
  sheets.trial.setColumnWidth(8, 120);
  // Quote, Totalは修正不要
  // Total2
  const total2Sheets = ['Total2', 'Total2_nmc', 'Total2_oscr'];
  total2Sheets.forEach(x => {
    fix20211209_total2total3(ss.getSheetByName(x), 92, 32);
  });
  // Total3
  fix20211209_total2total3(sheets.total3, 28, 32);
}
function fix20211209_total2total3(inputSheet, targetRow, trialYearsStartRow){
  const targetRange = inputSheet.getRange(targetRow, 4, 1, 8);
  const sumRow = targetRow - 1;
  for (let i = 0; i < targetRange.getNumColumns(); i++){
    const targetCell = targetRange.getCell(1, 1 + i);
    const colName = getColumnString(targetCell.getColumn());
    targetCell.setValue('=if(' + colName + sumRow + '<>"", if(Trial!$G$' + parseInt(trialYearsStartRow + i) + '>0, ' + colName + sumRow + '*(1-Trial!$H$' + parseInt(trialYearsStartRow + i) + '), if(Trial!$B$46>0, ' + colName + sumRow + '*(1-Trial!$B$47), ' + colName + sumRow + ')), "")');
  }
  // 合計
  inputSheet.getRange(targetRow, 12).setValue('=sum(D' + targetRow + ':' + 'K' + targetRow + ')');
}
function test_fix20211209(){
  const targetSheetsName = ['Setup', 'Registration_1', 'Registration_2', 'Interim_1', 'Observation_1', 'Interim_2', 'Observation_2', 'Closing'];
  const trialYearsStartRow = 32;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log('割引後金額（年度毎）が0以上の場合は正しい割引率（年度毎）が出力されていることを確認する');
  const const_itemsAmount = 1100000;
  const res1 = targetSheetsName.map((x, idx) => {
    // Setup~Closingまでの全シートに金額を入力する
    ss.getSheetByName(x).getRange('F9').setValue(2);  // 税込110万円の項目
    ss.getSheetByName('Trial').getRange(trialYearsStartRow + idx, 4).setValue(new Date(2020 + idx, 3, 1));
    ss.getSheetByName('Trial').getRange(trialYearsStartRow + idx, 5).setValue(new Date(2021 + idx, 2, 31));
    // 割引後金額（年度毎）を設定
    ss.getSheetByName('Trial').getRange(trialYearsStartRow + idx, 7).setValue((const_itemsAmount / 10) * (idx + 1));
    const temp = ss.getSheetByName('Trial').getRange(trialYearsStartRow + idx, 8).getValue();
    const temp2 = 1 - (ss.getSheetByName('Trial').getRange(trialYearsStartRow + idx, 7).getValue() / const_itemsAmount);
    return Math.round(temp, 0,001) == Math.round(temp2, 0.001) ? true : false;
  });
  if (!res1.every(x => x)){
    console.log('割引率（年度）：NG');
  }
  filterhidden();


  console.log('割引後金額（年度毎）が空白の場合は割引率（年度毎）が0であることを確認する');
  console.log('割引後金額（年度毎）が0の場合は割引率（年度毎）が0であることを確認する');
  console.log('Trials!C列が空白であれば割引後金額が入力されていても割引率が空白であることを確認する');
  console.log('割引後金額（合計）が空白でなければ個別の割引が適用されないことを確認する');

}
