class SetTestValues{
  constructor(){
    const scriptProperties = PropertiesService.getScriptProperties();
    this.trialYearsStartRow = parseInt(scriptProperties.getProperty('trial_setup_row'));
    this.trialYearsStartCol = parseInt(scriptProperties.getProperty('trial_start_date_col'));
    this.trialYearsDiscountCol = parseInt(scriptProperties.getProperty('trial_discount_col'));
    this.trialYearsDiscountRateCol = parseInt(scriptProperties.getProperty('trial_discount_rate_col'));
    this.const_itemsDiscount = parseInt(scriptProperties.getProperty('const_itemsDiscount'));
    this.constDiscountAllPeriodRangeAddr = scriptProperties.getProperty('const_discount_all_period_range_addr');
  }
  
  setTestValue(targetRange, setValue){
    if (!targetRange) {
      throw new Error('Target range is required');
    }
    targetRange.setValue(setValue);
  }
  
  delTestValue(targetRange){
    if (!targetRange) {
      throw new Error('Target range is required');
    }
    targetRange.clearContent();
  }
  
  getTrialYearStartRange(idx){
    if (typeof idx !== 'number' || idx < 0) {
      throw new Error('Index must be a non-negative number');
    }
    const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial');
    if (!trialSheet) {
      throw new Error('Trial sheet not found');
    }
    return trialSheet.getRange(this.trialYearsStartRow + idx, this.trialYearsStartCol);
  }
  
  setTrialYears(idx){
    const yearStartRange = this.getTrialYearStartRange(idx);
    this.setTestValue(yearStartRange, new Date(2020 + idx, 3, 1));
    this.setTestValue(yearStartRange.offset(0, 1), new Date(2021 + idx, 2, 31));
  }
  
  delTrialYears(idx){
    const yearStartRange = this.getTrialYearStartRange(idx);
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

function getQuotationRequestValues_(){
  const url = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wk_property').getRange('B2').getValue();
  const sheetname = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wk_property').getRange('B3').getValue();
  const requestValues = SpreadsheetApp.openByUrl(url).getSheetByName(sheetname).getDataRange().getValues();
  return requestValues.filter((x, idx) => idx > 25 || idx == 0);
}

function setQuotationRequestValuesForTest(target_idx=-1){
  const requestValues = getQuotationRequestValues_();
  const sheetQuotationRequest = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotation Request');
  sheetQuotationRequest.clearContents();
  const target = target_idx > -1 ? requestValues.filter((x, idx) => idx == target_idx || idx == 0) : requestValues;
  sheetQuotationRequest.getRange(1, 1, target.length, target[0].length).setValues(target);
}
