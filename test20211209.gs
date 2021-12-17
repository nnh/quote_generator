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
    fix20211209_total2total3_(ss.getSheetByName(x), 92, 32);
  });
  // Total3
  fix20211209_total2total3_(sheets.total3, 28, 32);
}
function fix20211209_total2total3_(inputSheet, targetRow, trialYearsStartRow){
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const setVal = new SetTestValues();
  let temp_res;
  // 初期処理 
  setVal.delDiscountAllPeriod();
  targetSheetsName.forEach((x, idx) => {
    setVal.delTrialYears(idx);
    setVal.delDiscountByYear(idx);     
  });
  targetSheetsName.forEach(x => {
    // Setup~Closingまでの全シートに金額を入力する
    setVal.setTestValue(ss.getSheetByName(x).getRange('F9'), 2)  // 税込110万円の項目
  });
  console.log('割引後金額（年度毎）が0以上の場合は正しい割引率（年度毎）が出力されていることを確認する');
  const res1 = targetSheetsName.map((x, idx) => {
    // 試験年数を設定
    setVal.setTrialYears(idx);
    // 割引後金額（年度毎）を設定
    setVal.setDiscountByYear(idx);
    return setVal.getDiscountRateValue(idx) == setVal.getComputeDiscountRateByDiscountValue(idx) ? true : false;
  });
  temp_res = isAllTrue_(res1, '割引率（年度）：NG');
  console.log('割引後金額（年度毎）が空白の場合は割引率（年度毎）が0であることを確認する');
  const res2 = targetSheetsName.map((x, idx) => {
    // 割引後金額（年度毎）を削除
    setVal.delDiscountByYear(idx);
    return setVal.getDiscountRateValue(idx) == 0 ? true : false;
  });
  temp_res = isAllTrue_(res2, '割引率（年度）：NG');
  console.log('試験年数が入っていない場合割引率（年度毎）が空白であることを確認する');
  const res3 = targetSheetsName.map((x, idx) => {
    // 試験年数を削除
    setVal.delTrialYears(idx);
    return setVal.getDiscountRateValue(idx) == '' ? true : false;
  });
  temp_res = isAllTrue_(res3, '割引率（年度）：NG');
  console.log('試験年数が入っていない場合割引後金額（年度毎）が入力されていても割引率（年度毎）が空白であることを確認する');
  const res4 = targetSheetsName.map((x, idx) => {
    // 割引後金額（年度毎）を設定
    setVal.setDiscountByYear(idx);
    return setVal.getDiscountRateValue(idx) == '' ? true : false;
  });
  temp_res = isAllTrue_(res4, '割引率（年度）：NG');
  console.log('割引後金額（合計）が空白でなければ個別の割引が適用されないことを確認する');
  setVal.setDiscountAllPeriod();
  targetSheetsName.forEach((x, idx) => {
    // 試験年数を設定
    setVal.setTrialYears(idx);
  });
  const res5 = targetSheetsName.map((x, idx) => {
    return setVal.getDiscountRateValue(idx) != setVal.getComputeDiscountRateByDiscountValue(idx) && setVal.getDiscountRateValue(idx) == setVal.getDiscountRateValueAllPeriod() ? true : false;
  });
  temp_res = isAllTrue_(res5, '割引率（年度）：NG');
}
function isAllTrue_(target, message){
  const res = target.every(x => x);
  if (!res){
    console.log(message);
  }
  return res;
}
class SetTestValues{
  constructor(){
    this.trialYearsStartRow = 32;
    this.trialYearsStartCol = 4;
    this.trialYearsDiscountCol = 7;
    this.trialYearsDiscountRateCol = 8;
    this.const_itemsDiscount = 1100000;
    this.constDiscountAllPeriodRangeAddr = 'B46';
  }
  setTestValue(targetRange, strValue){
    targetRange.setValue(strValue);
    SpreadsheetApp.flush();
  }
  delTestValue(targetRange){
    targetRange.clearContent();
  }
  getTrialYearStartRange(idx){
    this.idx = idx;
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow +this.idx, this.trialYearsStartCol);
  }
  setTrialYears(idx){
    this.idx = idx;
    const yearStartRange = this.getTrialYearStartRange(this.idx);
    this.setTestValue(yearStartRange, new Date(2020 + this.idx, 3, 1));
    this.setTestValue(yearStartRange.offset(0, 1), new Date(2021 + this.idx, 2, 31));
  }
  delTrialYears(idx){
    this.idx = idx;
    const yearStartRange = this.getTrialYearStartRange(this.idx);
    this.delTestValue(yearStartRange);
    this.delTestValue(yearStartRange.offset(0, 1));
  }
  setDiscountByYear(idx){
    this.idx = idx;
    this.setTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + this.idx, this.trialYearsDiscountCol), (this.const_itemsDiscount / 10) * (idx + 1)); 
  }
  delDiscountByYear(idx){
    this.idx = idx;
    this.delTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + this.idx, this.trialYearsDiscountCol));
  }
  getDiscountRateValue(idx){
    this.idx = idx;
    const temp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + this.idx, this.trialYearsDiscountRateCol).getValue();
    return Number.isFinite(temp) ? parseFloat(temp).toFixed(4) : temp;
  }
  getComputeDiscountRateByDiscountValue(idx){
    this.idx = idx;
    const temp = 1 - (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + idx, this.trialYearsDiscountCol).getValue() / this.const_itemsDiscount);
    return temp.toFixed(4);
  }
  setDiscountAllPeriod(){
    this.setTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.constDiscountAllPeriodRangeAddr), 440000);
  }
  delDiscountAllPeriod(){
    this.delTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.constDiscountAllPeriodRangeAddr));
  }
  getDiscountRateValueAllPeriod(){
    const temp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.constDiscountAllPeriodRangeAddr).offset(1, 0).getValue();
    return Number.isFinite(temp) ? parseFloat(temp).toFixed(4) : temp;
  }
}
