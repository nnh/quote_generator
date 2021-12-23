function fix20211209(){
  PropertiesService.getScriptProperties().deleteAllProperties();
  initial_process();
  filtervisible();
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
  targetSheetsName.forEach((x, idx) => {
    // Trialシート
    const trialTargetRow = parseInt(trialYearsStartRow + idx);
    ss.getSheetByName('Trial').getRange(trialTargetRow, 8).setValue('=if(C' + trialTargetRow + '<>"", if(not(isblank($B$46)), $B$47, if(and(not(ISBLANK($G$' + trialTargetRow + ')), ' + x + '!$H$91 > 0), round((' + x + '!$H$91 - ($G$' + trialTargetRow + ' / (1 + $B$45))) / ' + x + '!$H$91, 4), 0)), "")');
    ss.getSheetByName('Trial').getRange(trialTargetRow, 8).setNumberFormat('0%');
    ss.getSheetByName('Trial').getRange(trialTargetRow, 7).setNumberFormat('#,##0');
    ss.getSheetByName('Trial').getRange('B47').setValue('=if(not(ISBLANK(B46)),(Quote!D32-(B46/(1+$B$45)))/Quote!D32,if(COUNTBLANK(G32:G39)<>rows(G32:G39), 1-(Total2!L92/Total2!L91), 0))');
    ss.getSheetByName('Trial').getRange('B47').setNumberFormat('0%');
    // 各シートへの割引後金額の反映
    ss.getSheetByName(x).getRange('H92').setValue('=if(Trial!H$' + parseInt(trialYearsStartRow + idx) + '>0, H91*(1-Trial!$H$' + parseInt(trialYearsStartRow + idx) + '), "")');
    // フィルタ条件の修正
    ss.getSheetByName(x).getRange('L92').setValue('=if(H92<>"", 1, 0)');
  });
  sheets.trial.setColumnWidth(1, 120);
  sheets.trial.setColumnWidth(7, 130);
  sheets.trial.setColumnWidth(8, 120);
  // Quote, Totalは修正不要
  // Total2
  const total2Sheets = ['Total2', 'Total2_nmc', 'Total2_oscr'];
  const total2TargetRow = 92;
  total2Sheets.forEach(x => {
    fix20211209_total2total3_(ss.getSheetByName(x), total2TargetRow, 32);
  // 合計
    ss.getSheetByName(x).getRange(total2TargetRow, 12).setValue('=if(sum(D' + total2TargetRow + ':K' + total2TargetRow + ')=0, "" ,sum(D' + total2TargetRow + ':K' + total2TargetRow + '))');  
  });
  // Total3
  const total3TargetRow = 28;
  fix20211209_total2total3_(sheets.total3, total3TargetRow, 32);
  // 合計
  sheets.total3.getRange(total3TargetRow, 12).setValue('=if(sum(D' + total3TargetRow + ':K' + total3TargetRow + ')=0, 0 ,sum(D' + total3TargetRow + ':K' + total3TargetRow + '))');
}
function fix20211209_total2total3_(inputSheet, targetRow, trialYearsStartRow){
  const targetRange = inputSheet.getRange(targetRow, 4, 1, 8);
  const sumRow = targetRow - 1;
  for (let i = 0; i < targetRange.getNumColumns(); i++){
    const targetCell = targetRange.getCell(1, 1 + i);
    const colName = getColumnString(targetCell.getColumn());
    targetCell.setValue('=if(' + colName + sumRow + '<>"", if(Trial!$G$' + parseInt(trialYearsStartRow + i) + '>0, ' + colName + sumRow + '*(1-Trial!$H$' + parseInt(trialYearsStartRow + i) + '), ' + colName + sumRow + '), "")');
  }
}
function test_fix20211209_1(){
  const test = new RoutineTest;
  const temp_init = test.routineTestInit();
  const targetSheetsName = temp_init.targetSheetsName;
  const setVal = temp_init.setVal;
  let testResults = [];
  // Setup~Closingまでの全シートに金額を入力する
  targetSheetsName.forEach(x => {
    setVal.setTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange('F9'), 2)  // 税込110万円の項目
  });
  /* テスト１ */
  console.log('割引後金額（年度毎）が0以上の場合は正しい割引率（年度毎）が出力されていることを確認する');
  const res1 = targetSheetsName.map((x, idx) => {
    // 試験年数を設定
    setVal.setTrialYears(idx);
    // 割引後金額（年度毎）を設定
    setVal.setDiscountByYear(idx);
    return setVal.getDiscountRateValue(idx) == setVal.getComputeDiscountRateByDiscountValue(idx);
  });
  testResults.push(isAllTrue_(res1, '割引率（年度）：NG'));
  testResults.push(checkSheetInfo_(targetSheetsName));
  /* テスト2 */
  console.log('割引後金額（年度毎）が空白の場合は割引率（年度毎）が0であることを確認する');
  const res2 = targetSheetsName.map((x, idx) => {
    // 割引後金額（年度毎）を削除
    setVal.delDiscountByYear(idx);
    return setVal.getDiscountRateValue(idx) == 0;
  });
  testResults.push(isAllTrue_(res2, '割引率（年度）：NG'));  
  testResults.push(checkSheetInfo_(targetSheetsName));
  /* テスト3 */
  console.log('試験年数が入っていない場合割引率（年度毎）が空白であることを確認する');
  const res3 = targetSheetsName.map((x, idx) => {
    // 試験年数を削除
    setVal.delTrialYears(idx);
    return setVal.getDiscountRateValue(idx) == '';
  });
  testResults.push(isAllTrue_(res3, '割引率（年度）：NG'));  
  testResults.push(checkSheetInfo_(targetSheetsName));
  /* テスト4 */
  console.log('試験年数が入っていない場合割引後金額（年度毎）が入力されていても割引率（年度毎）が空白であることを確認する');
  const res4 = targetSheetsName.map((x, idx) => {
    // 割引後金額（年度毎）を設定
    setVal.setDiscountByYear(idx);
    return setVal.getDiscountRateValue(idx) == '';
  });
  testResults.push(isAllTrue_(res4, '割引率（年度）：NG'));  
  testResults.push(checkSheetInfo_(targetSheetsName));
  /* テスト5 */
  console.log('割引後金額（合計）が空白でなければ個別の割引が適用されないことを確認する');
  setVal.setDiscountAllPeriod();
  targetSheetsName.forEach((x, idx) => {
    // 試験年数を設定
    setVal.setTrialYears(idx);
  });
  const res5 = targetSheetsName.map((x, idx) => {
    return setVal.getDiscountRateValue(idx) != setVal.getComputeDiscountRateByDiscountValue(idx) && setVal.getDiscountRateValue(idx) == setVal.getDiscountRateValueAllPeriod();
  });
  testResults.push(isAllTrue_(res5, '割引率（年度）：NG')); 
  testResults.push(checkSheetInfo_(targetSheetsName));
  /* over all */
  testResults.every(x => x) ? console.log('*** TEST OK **+') : console.log('*** TEST NG ***') 
}
class Test_fix20211209_2 extends RoutineTest{
  test_fix20211209_2(idx){
    setQuotationRequestValuesForTest(idx)
    super.setQuote(idx);
  }
  test_byYears(idx, price){
    const temp = this.routineTestDiscountInit();
    temp.setVal.setDiscountByYear(idx, price);
    return checkSheetInfo_();
  }
}
function test_fix20211209_2(){
  const targetValues = getQuotationRequestValues_();
  const test = new Test_fix20211209_2;
  const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial');
  // setup 単年度
  trialSheet.getRange('G32:G39').clearContent()
  trialSheet.getRange('G32').setValue(5000000);
  const testResults = test.test_fix20211209_2(1);
  console.log(testResults);
}
function test_fix20211209_3(){
  const test = new Test_fix20211209_2;
  let testResults = [];
  let temp;
  test.test_fix20211209_2(2);
  // Registration_2 複数年度
  testResults.push(test.test_byYears(0, 4000000));
  return null;
/*  temp = test.routineTestDiscountInit();
  temp.setVal.setDiscountByYear(0, 4000000);
  testResults.push(checkSheetInfo_());*/
  // 全体割引
  temp = test.routineTestDiscountInit();
  temp.setVal.setDiscountAllPeriod(40000000);
  testResults.push(checkSheetInfo_());
  console.log(testResults);
}
function aaa(){
  checkSheetInfo_();
}
