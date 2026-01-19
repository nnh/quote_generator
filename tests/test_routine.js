/**
 * routine test
 */
class RoutineTest{
  setQuote(){
    const sheets = get_sheets();
    this.routineTestInit();
    quote_script_main();
    const quotation_request_last_col =  sheets.quotation_request.getDataRange().getLastColumn();
    const array_quotation_request = sheets.quotation_request.getRange(1, 1, 2, quotation_request_last_col).getValues();
    const interimCount = get_quotation_request_value(array_quotation_request, '中間解析業務の依頼') == 'あり' ? 1 : '';
    this.setTestInterimValues(sheets.setup, interimCount);
    total2_3_add_del_cols();
  }
  execRoutineTest(targetValues, targetIdx){
    const res = targetValues.map((_, idx) => {
      if (idx == targetIdx) {
        setQuotationRequestValuesForTest(idx)
        this.setQuote();
        check_output_values();
        return this.getCheckResult_();
      } else {
        return true;
      }
    });
    return res;
  }
  execTestMain(idx, discountValue){
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange('B46').setValue(discountValue);
    const targetValues = getQuotationRequestValues_();
    const testResults = this.execRoutineTest(targetValues, idx);
    const res = testResults.every(x => x);
    res ? console.log('*** test ok. ***') : console.log('!!! execTestMain ng. ' + testResults + ' !!!');
    return res;
  }
  routineTestDiscountInit(){
    const setVal = new SetTestValues();
    const targetSheetsName = setVal.getTrialYearsItemsName();
    //setVal.delDiscountAllPeriod();
    targetSheetsName.forEach((_, idx) => {
      setVal.delDiscountByYear(idx);  
    });
    const res = {targetSheetsName:targetSheetsName, setVal:setVal};
    return res;
  }
  routineTestInit(){
    filtervisible();
    const temp_init = this.routineTestDiscountInit();
    const targetSheetsName = temp_init.targetSheetsName;
    const setVal = temp_init.setVal;
    // Initial processing 
    targetSheetsName.forEach((x, idx) => {
      setVal.delTrialYears(idx);
      setVal.delTestValue(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange('F5:F89'));   
    });
    const res = {targetSheetsName:targetSheetsName, setVal:setVal};
    return(res);
  }
  setTestInterimValues(targetSheet, interimValue){
    const sheetQuotationRequest = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotation Request');
    const quotation_request_last_col =  sheetQuotationRequest.getDataRange().getLastColumn();
    const array_quotation_request = sheetQuotationRequest.getRange(1, 1, 2, quotation_request_last_col).getValues();
    const tableCount = interimValue != '' ? get_quotation_request_value(array_quotation_request, '中間解析に必要な図表数') : interimValue;
    targetSheet.getRange('F45').setValue(interimValue);
    targetSheet.getRange('F53').setValue(interimValue);
    targetSheet.getRange('F54').setValue(tableCount);
    targetSheet.getRange('F55').setValue(interimValue);
  }
  getCheckResult_(){
    const checkSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Check');
    // Items not checked
    const exclusionIdx1 = checkSheet.getRange('B:B').getValues().map((x, idx) => x == 'シート名:Total,項目名:中間解析プログラム作成、解析実施（シングル）,想定値:回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認' ? idx : null).filter(x => x)[0];
    const checkSheetValue = checkSheet.getRange('A:A').getValues().filter((x, idx) => idx > 0 && x != '' && idx != exclusionIdx1);
    return checkSheetValue.every(x => x == 'OK');
  }
}
/**
 * If all test results are True, output OK. Otherwise, it will output the test results.
 * @param none.
 * @return none.
 */
function routineTest(){
  initial_process();
  const test = new RoutineTest();
  const targetValues = getQuotationRequestValues_();
  const testResults = targetValues.map((_, idx) => {
    if (idx > 0){
      console.log('test' + idx);
      const res = test.execTestMain(idx, '');
      return res;
    } else {
      return true;
    }
  });
  testResults.every(x => x) ? console.log('*** All tests OK. ***') : console.log(testResults);
}
class RoutineTestIndividual extends RoutineTest{
  execRoutineTest(targetValues){
    const sheetQuotationRequest = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotation Request');
    sheetQuotationRequest.clearContents();
    sheetQuotationRequest.getRange(1, 1, targetValues.length, targetValues[0].length).setValues(targetValues);
    this.setQuote();
    check_output_values();
    return this.getCheckResult_();
  }
}
function routineTest_individual(){
  const targetIdx = 1;
  initial_process();
  const test = new RoutineTestIndividual();
  const targetValues = getQuotationRequestValues_().filter((_, idx) => idx == 0 || idx == targetIdx);
  const testResults = test.execRoutineTest(targetValues);
  testResults ? console.log('*** test OK. ***') : console.log('!!! test NG !!!');
}
function clearSheetsForTest(){
  const targetSheetsName = [
    'Setup',
    'Registration_1',
    'Registration_2',
    'Interim_1',
    'Observation_1',
    'Interim_2',
    'Observation_2',
    'Closing'
  ];
  targetSheetsName.forEach(x => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    sheet.getRange('F6:F94').clearContent();
  })
}