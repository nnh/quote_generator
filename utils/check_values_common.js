function check_itemName_and_value(target, item_name, value_ok){
  if (target.footer != null){
    var temp_item_name = item_name + target.footer; 
  } else {
    var temp_item_name = item_name; 
  }
  const res_message = 'シート名:' + target.sheet.getName() + ',項目名:' + temp_item_name + ',想定値:' + value_ok;
  if (!(target.array_item[item_name] > 0)){
    return ['NG：該当する項目名なし', res_message];
  }
  var check_value = target.sheet.getRange(target.array_item[item_name], target.col).getValue();
  if (check_value != value_ok){
    return ['NG：値が想定と異なる', res_message];
  }
  return ['OK', res_message];
}
function get_total_amount(target){
  const items = target.sheet.getRange(target.item_cols).getValues().flat();
  const target_row = items.indexOf(target.total_row_itemname) + 1;
  const header = target.sheet.getRange(target.header_row, 1, 1, target.sheet.getLastColumn()).getValues().flat();
  const target_col = header.indexOf(target.total_col_itemname) + 1;
  return target.sheet.getRange(target_row, target_col).getValue();
} 
/**
 * Set, delete, and retrieve values for testing.
 */
class SetTestValues{
  constructor(){
    this.trialYearsStartRow = parseInt(PropertiesService.getScriptProperties().getProperty('trial_setup_row'));
    this.trialYearsStartCol = parseInt(PropertiesService.getScriptProperties().getProperty('trial_start_col'));
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
  setDiscountByYear(idx, setPrice = null){
    this.idx = idx;
    const setPrice_ = setPrice ? setPrice : (this.const_itemsDiscount / 10) * (idx + 1); 
    this.setTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + this.idx, this.trialYearsDiscountCol), setPrice_); 
  }
  delDiscountByYear(idx){
    this.idx = idx;
    this.delTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + this.idx, this.trialYearsDiscountCol));
  }
  getDiscountRateValue(idx){
    this.idx = idx;
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + this.idx, this.trialYearsDiscountRateCol).getValue();
  }
  getComputeDiscountRateByDiscountValue(idx){
    this.idx = idx;
    return 1 - (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.trialYearsStartRow + idx, this.trialYearsDiscountCol).getValue() / this.const_itemsDiscount);
  }
  setDiscountAllPeriod(setPrice = 440000){
    this.setTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.constDiscountAllPeriodRangeAddr), setPrice);
  }
  delDiscountAllPeriod(){
    this.delTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.constDiscountAllPeriodRangeAddr));
  }
  getDiscountRateValueAllPeriod(){
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(this.constDiscountAllPeriodRangeAddr).offset(1, 0).getValue();
  }
  getTrialYearsItemsName(){
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(parseInt(PropertiesService.getScriptProperties().getProperty('trial_setup_row')), 
                                                                                  1, 
                                                                                  parseInt(PropertiesService.getScriptProperties().getProperty('trial_closing_row')) - parseInt(PropertiesService.getScriptProperties().getProperty('trial_setup_row')) + 1,
                                                                                  1).getValues().flat();
  }
}
/**
 * Check the price after discount.
 * @param {string} <array> The sheet name.
 * @return {boolean} <array> Return True if OK, False otherwise.
 */
function checkDiscountByYearSheet_(targetSheetsName = null){
  const setVal = new SetTestValues;
  const target = targetSheetsName ? targetSheetsName : setVal.getTrialYearsItemsName();
  const res = target.map((x, idx) => checkAmountByYearSheet_(x, setVal.getDiscountRateValue(idx)));
  if (!res.every(x => x)){
    console.log('checkDiscountByYearSheet NG\n' + target + '\n' + res);
  }
  return res;
}
/**
 * If the first arguments are all True, return True. Otherwise, it outputs a message and returns False.
 * @param {array} <boolean>
 * @param {string} Message to output.
 * @return {boolean}  
 */
function isAllTrue_(target, message){
  const res = target.every(x => x);
  if (!res){
    console.log(message);
  }
  return res;
}
/**
 * Check that the total and the discounted total on each sheet from Setup to Closing are output correctly.
 * @param {string} The sheet name.
 * @param {number} Discount rate for Trial sheets.
 * @return {boolean} Return True if OK, False otherwise.
 */
function checkAmountByYearSheet_(sheetName, discountRate){
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const GetRowCol = new GetTargetRowCol;
  const sumRow = GetRowCol.getTargetRow(targetSheet, 2, '合計');
  const sumCol = GetRowCol.getTargetCol(targetSheet, 4, '金額');;
  const sumValue = targetSheet.getRange(sumRow, sumCol).getValue();
  const discountValue = targetSheet.getRange(sumRow + 1, sumCol).getValue();
  const test1 = Math.trunc(sumValue * (1 - discountRate));
  const test2 = Math.trunc(discountValue);
  const discountCheck = discountRate >= 0 || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange('B2').getValue() == '' ? test1 == test2 : discountValue == '';
  return discountCheck;
}
/**
 * On the Quote, Total, Total2, and Total3 sheets, check that the totals and discounted totals are printed correctly.
 * @param none.
 * @return {boolean} <array> Return True if OK, False otherwise.
 */
function checkQuoteSum_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const GetRowCol = new GetTargetRowCol;
  const quoteGoukeiRow = GetRowCol.getTargetRow(ss.getSheetByName('Quote'), 3, '小計');
  const totalGoukeiRow = GetRowCol.getTargetRow(ss.getSheetByName('Total'), 2, '合計');
  const total2GoukeiRow = GetRowCol.getTargetRow(ss.getSheetByName('Total2'), 2, '合計');
  const total3GoukeiRow = GetRowCol.getTargetRow(ss.getSheetByName('Total3'), 2, '合計');
  const quoteGoukeiCol = GetRowCol.getTargetCol(ss.getSheetByName('Quote'), 11, '金額');
  const totalGoukeiCol = GetRowCol.getTargetCol(ss.getSheetByName('Total'), 4, '金額');
  const total2GoukeiCol = GetRowCol.getTargetCol(ss.getSheetByName('Total2'), 4, '合計');
  const total3GoukeiCol = GetRowCol.getTargetCol(ss.getSheetByName('Total3'), 3, '合計');
  const checkAmount = [ss.getSheetByName('Quote').getRange(quoteGoukeiRow, quoteGoukeiCol).getValue(),
                       ss.getSheetByName('Total').getRange(totalGoukeiRow, totalGoukeiCol).getValue(),
                       ss.getSheetByName('Total2').getRange(total2GoukeiRow, total2GoukeiCol).getValue(),
                       ss.getSheetByName('Total3').getRange(total3GoukeiRow, total3GoukeiCol).getValue()].map(x => x == '' ? 0 : Math.round(x));
  const checkDiscount = [ss.getSheetByName('Quote').getRange(quoteGoukeiRow + 2, quoteGoukeiCol).getValue(),
                         ss.getSheetByName('Total').getRange(totalGoukeiRow + 1, totalGoukeiCol).getValue(),
                         ss.getSheetByName('Total2').getRange(total2GoukeiRow + 1, total2GoukeiCol).getValue(),
                         ss.getSheetByName('Total3').getRange(total3GoukeiRow + 1, total3GoukeiCol).getValue()].map(x => x == '' ? 0 : Math.round(x));
  return [checkAmount.every(x => (x, _, arr) => x == arr[0]), checkDiscount.every((x, _, arr) => x == arr[0])];
}
/**
 * Get the value from "Quotation Request".
 * @param none.
 * @return {string} <array> The value of "Quotation Request".
 */
function getQuotationRequestValues_(){
  const url = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wk_property').getRange('B2').getValue();
  const sheetname = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wk_property').getRange('B3').getValue();
  const requestValues = SpreadsheetApp.openByUrl(url).getSheetByName(sheetname).getDataRange().getValues();
  // Output only those records for which "Existence of Coordination Office" has been entered.
  return requestValues.filter((x, idx) => idx > 25 || idx == 0);
}
/**
 * Output the values retrieved from the "Quotation Request" spreadsheet to the "Quotation Request" sheet.
 * @param {number=} If specified in the argument, outputs the value at the specified index. Otherwise, all values are output.
 * @return none. 
 */
function setQuotationRequestValuesForTest(target_idx=-1){
  const requestValues = getQuotationRequestValues_();
  const sheetQuotationRequest = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotation Request');
  sheetQuotationRequest.clearContents();
  const target = target_idx > -1 ? requestValues.filter((x, idx) => idx == target_idx || idx == 0) : requestValues;
  sheetQuotationRequest.getRange(1, 1, target.length, target[0].length).setValues(target);
}
/**
 * Get the column and row numbers.
 */
class GetTargetRowCol{
  getTargetRowIndex(targetSheet, targetIdx, targetStr){
    const targetValues = targetSheet.getDataRange().getValues();
    const targetRowIndex = targetValues.map((x, idx) => x[targetIdx] == targetStr ? idx : null).filter(x => x);
    return targetRowIndex[0];
  }
  getTargetRow(targetSheet, targetColNumber, targetStr){
    const res = this.getTargetRowIndex(targetSheet, targetColNumber - 1, targetStr);
    return res + 1;
  }
  getTargetColIndex(targetSheet, targetIdx, targetStr){
    const targetValues = targetSheet.getDataRange().getValues();
    const targetColIndex = targetValues[targetIdx].indexOf(targetStr);
    return targetColIndex;
  }
  getTargetCol(targetSheet, targetRowNumber, targetStr){
    const res = this.getTargetColIndex(targetSheet, targetRowNumber - 1, targetStr);
    return res + 1;
  }
}
