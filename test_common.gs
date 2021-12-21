/**
 * 
 */
class RoutineTest{
  setQuote(idx){
    const sheets = get_sheets();
    this.routineTestInit();
    quote_script_main();
    if (idx == 4){
      this.setTestInterimValues(sheets.observation_2);
      sheets.observation_2.getRange('F77').clearContent();
    }
    if (idx == 5){
      sheets.registration_2.getRange('F21').clearContent();
    }
    if (idx == 6){
      sheets.registration_1.getRange('F28').setValue(1);
      sheets.registration_1.getRange('F77').setValue(1);
    }
    if (idx == 7){
      this.setTestInterimValues(sheets.observation_2);
      sheets.observation_2.getRange('F21').setValue(1);
    }
    total2_3_add_del_cols();
  }
  execRoutineTest(targetValues){
    const res = targetValues.map((x, idx) => {
      if (idx > 0) {
        setQuotationRequestValuesForTest(idx)
        this.setQuote(idx)
        check_output_values();
        return this.getCheckResult_();
      } else {
        return true;
      }
    });
    return res;
  }
  routineTestInit(){
    filtervisible();
    const targetSheetsName = ['Setup', 'Registration_1', 'Registration_2', 'Interim_1', 'Observation_1', 'Interim_2', 'Observation_2', 'Closing'];
    const setVal = new SetTestValues();
    // Initial processing 
    setVal.delDiscountAllPeriod();
    targetSheetsName.forEach((x, idx) => {
      setVal.delTrialYears(idx);
      setVal.delDiscountByYear(idx);  
      setVal.delTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange('F5:F89'));   
    });
    const res = {targetSheetsName:targetSheetsName, setVal:setVal};
    return(res);
  }
  setTestInterimValues(targetSheet){
    targetSheet.getRange('F45').setValue(1);
    targetSheet.getRange('F53').setValue(1);
    targetSheet.getRange('F55').setValue(1);
  }
  getCheckResult_(){
    const checkSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Check');
    // Items not checked
    const exclusionIdx1 = checkSheet.getRange('B:B').getValues().map((x, idx) => x == 'シート名:Total,項目名:中間解析プログラム作成、解析実施（シングル）,想定値:回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認' ? idx : null).filter(x => x)[0];
    const checkSheetValue = checkSheet.getRange('A:A').getValues().filter((x, idx) => idx > 0 && x != '' && idx != exclusionIdx1);
    return checkSheetValue.every(x => x == 'OK');
  }
}
function routineTest(){
  const test = new RoutineTest();
  const targetValues = getQuotationRequestValues_();
  const testResults = test.execRoutineTest(targetValues);
  console.log(testResults);
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
/**
 * Check that the total and the discounted total on each sheet from Setup to Closing are output correctly.
 * @param {string} The sheet name.
 * @param {number} Discount rate for Trial sheets.
 * @return {boolean} Return True if OK, False otherwise.
 */
function checkAmountByYearSheet_(sheetName, discountRate){
  const sumRow = 91;
  const sumCol = 8;
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const sumValue = targetSheet.getRange(sumRow, sumCol).getValue();
  const discountValue = targetSheet.getRange(sumRow + 1, sumCol).getValue();
  const discountCheck = discountRate > 0 || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange('B2').getValue() == '' ? Math.round(sumValue * (1 - discountRate)) == Math.round(discountValue) : discountValue == '';
  return discountCheck;
}
/**
 * On the Quote, Total, Total2, and Total3 sheets, check that the totals and discounted totals are printed correctly.
 * @param none.
 * @return {boolean} <array> Return True if OK, False otherwise.
 */
function checkQuoteSum_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const checkAmount = [ss.getSheetByName('Quote').getRange('D32').getValue(),
                       ss.getSheetByName('Total').getRange('H91').getValue(),
                       ss.getSheetByName('Total2').getRange('L91').getValue(),
                       ss.getSheetByName('Total3').getRange('L27').getValue()].map(x => x == '' ? 0 : Math.round(x));
  const checkDiscount = [ss.getSheetByName('Quote').getRange('D34').getValue(),
                         ss.getSheetByName('Total').getRange('H92').getValue(),
                         ss.getSheetByName('Total2').getRange('L92').getValue(),
                         ss.getSheetByName('Total3').getRange('L28').getValue()].map(x => x == '' ? 0 : Math.round(x));
  return [checkAmount.every(x => (x, idx, arr) => x == arr[0]), checkDiscount.every((x, idx, arr) => x == arr[0])];
}
/**
 * Check the output for total and discount totals.
 * @param {string} <array> The sheet name.
 * @return {boolean} <array> Return True if OK, False otherwise.
 */
function checkSheetInfo_(targetSheetsName = ['Setup', 'Registration_1', 'Registration_2', 'Interim_1', 'Observation_1', 'Interim_2', 'Observation_2', 'Closing']){
  let testResults = [];
  const setVal = new SetTestValues;
  const res1 = targetSheetsName.map((x, idx) => checkAmountByYearSheet_(x, setVal.getDiscountRateValue(idx)));
  testResults.push(isAllTrue_(res1, 'Setup~Closingの各シートの割引後合計チェック：NG'));
  const res2 = checkQuoteSum_();
  testResults.push(isAllTrue_(res2, 'Quote, total, total2, total3の合計一致チェック：NG'));
  return testResults.every(x => x);
}
/**
 * @param none.
 * @return {string} <array>
 */
function getQuotationRequestValues_(){
  const url = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wk_property').getRange('B2').getValue();
  const sheetname = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wk_property').getRange('B3').getValue();
  const requestValues = SpreadsheetApp.openByUrl(url).getSheetByName(sheetname).getDataRange().getValues();
  // Output only those records for which "Existence of Coordination Office" has been entered.
  return requestValues.filter((x, idx) => idx > 25 || idx == 0);
}
/**
 * @param none.
 * @return none. 
 */
function setQuotationRequestValuesForTest(target_idx=-1){
  const requestValues = getQuotationRequestValues_();
  const sheetQuotationRequest = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotation Request');
  sheetQuotationRequest.clearContents();
  const target = target_idx > -1 ? requestValues.filter((x, idx) => idx == target_idx || idx == 0) : requestValues;
  sheetQuotationRequest.getRange(1, 1, target.length, target[0].length).setValues(target);
}