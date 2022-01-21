/**
 * routine test
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
    if (idx == 8){
      sheets.registration_1.getRange('F21').setValue(1);
      sheets.registration_1.getRange('F28').setValue(1);
      sheets.registration_1.getRange('F29').setValue(54);
      sheets.registration_2.getRange('F33').setValue(10);
      sheets.registration_2.getRange('F44').setValue(10);
      sheets.registration_2.getRange('F50').setValue(10);
      sheets.registration_2.getRange('F51').setValue(10);
      sheets.items.getRange('C63').setValue(2000000);
      sheets.items.getRange('C65').setValue(500000);
    }
    total2_3_add_del_cols();
  }
  execRoutineTest(targetValues, targetIdx){
    const res = targetValues.map((_, idx) => {
      if (idx == targetIdx) {
        setQuotationRequestValuesForTest(idx)
        this.setQuote(idx);
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
/**
 * If all test results are True, output OK. Otherwise, it will output the test results.
 * @param none.
 * @return none.
 */
function routineTest(){
  const test = new RoutineTest();
  const targetValues = getQuotationRequestValues_();
  const testResults = targetValues.map((_, idx) => {
    if (idx > 0){
      console.log('test' + idx);
      const res = test.execTestMain(idx, '');
      return res;
    }
  });
  //testResults.every(x => x) ? console.log('*** test ok. ***') : console.log(testResults);
}
