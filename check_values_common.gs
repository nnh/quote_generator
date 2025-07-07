/**
 * Check if an item name exists in the target sheet and validate its value
 * @param {Object} target - Target object containing sheet, array_item, col, and optional footer
 * @param {string} item_name - The item name to search for
 * @param {*} value_ok - The expected value to validate against
 * @return {Array} Array with [status, message] where status is 'OK' or 'NG:...'
 */
function check_itemName_and_value(target, item_name, value_ok){
  if (!target || !target.sheet || !target.array_item || !target.col) {
    return ['NG：対象オブジェクトが不正です', 'target object is invalid or missing required properties'];
  }
  
  if (!item_name) {
    return ['NG：項目名が指定されていません', 'item_name is required'];
  }
  
  const displayItemName = target.footer ? item_name + target.footer : item_name;
  
  const resultMessage = `シート名:${target.sheet.getName()},項目名:${displayItemName},想定値:${value_ok}`;
  
  const itemRowNumber = target.array_item[item_name];
  if (!itemRowNumber || itemRowNumber <= 0) {
    return ['NG：該当する項目名なし', resultMessage];
  }
  
  let actualValue;
  try {
    actualValue = target.sheet.getRange(itemRowNumber, target.col).getValue();
  } catch (error) {
    return ['NG：セル値の取得に失敗しました', `${resultMessage}, エラー:${error.message}`];
  }
  
  if (actualValue != value_ok) {
    return ['NG：値が想定と異なる', `${resultMessage}, 実際の値:${actualValue}`];
  }
  
  return ['OK', resultMessage];
}
/**
 * Get the total amount from a target sheet based on item and column names
 * @param {Object} target - Target object containing sheet, item_cols, total_row_itemname, header_row, total_col_itemname
 * @return {*} The value from the specified cell
 */
function get_total_amount(target){
  if (!target || !target.sheet || !target.item_cols || !target.total_row_itemname || !target.header_row || !target.total_col_itemname) {
    throw new Error('Invalid target object: missing required properties');
  }
  
  let items, header;
  try {
    items = target.sheet.getRange(target.item_cols).getValues().flat();
    header = target.sheet.getRange(target.header_row, 1, 1, target.sheet.getLastColumn()).getValues().flat();
  } catch (error) {
    throw new Error(`Failed to get sheet data: ${error.message}`);
  }
  
  const targetRowIndex = items.indexOf(target.total_row_itemname);
  if (targetRowIndex === -1) {
    throw new Error(`Item name '${target.total_row_itemname}' not found in items`);
  }
  const targetRow = targetRowIndex + 1;
  
  const targetColIndex = header.indexOf(target.total_col_itemname);
  if (targetColIndex === -1) {
    throw new Error(`Column name '${target.total_col_itemname}' not found in header`);
  }
  const targetCol = targetColIndex + 1;
  
  try {
    return target.sheet.getRange(targetRow, targetCol).getValue();
  } catch (error) {
    throw new Error(`Failed to get cell value at row ${targetRow}, col ${targetCol}: ${error.message}`);
  }
}
/**
 * Set, delete, and retrieve values for testing.
 */
class SetTestValues{
  constructor(){
    const scriptProperties = PropertiesService.getScriptProperties();
    this.trialYearsStartRow = parseInt(scriptProperties.getProperty('trial_setup_row'));
    this.trialYearsStartCol = parseInt(scriptProperties.getProperty('trial_start_col'));
    this.trialYearsDiscountCol = 7;
    this.trialYearsDiscountRateCol = 8;
    this.const_itemsDiscount = 1100000;
    this.constDiscountAllPeriodRangeAddr = 'B46';
  }
  /**
   * Set a test value in the specified range
   * @param {Range} targetRange - The range to set the value in
   * @param {*} value - The value to set
   */
  setTestValue(targetRange, value){
    if (!targetRange) {
      throw new Error('Target range is required');
    }
    targetRange.setValue(value);
    SpreadsheetApp.flush();
  }
  
  /**
   * Clear content from the specified range
   * @param {Range} targetRange - The range to clear
   */
  delTestValue(targetRange){
    if (!targetRange) {
      throw new Error('Target range is required');
    }
    targetRange.clearContent();
  }
  
  /**
   * Get the trial year start range for the specified index
   * @param {number} idx - The index for the trial year
   * @return {Range} The range for the trial year start
   */
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
  /**
   * Set trial years for the specified index
   * @param {number} idx - The index for the trial year
   */
  setTrialYears(idx){
    const yearStartRange = this.getTrialYearStartRange(idx);
    this.setTestValue(yearStartRange, new Date(2020 + idx, 3, 1));
    this.setTestValue(yearStartRange.offset(0, 1), new Date(2021 + idx, 2, 31));
  }
  
  /**
   * Delete trial years for the specified index
   * @param {number} idx - The index for the trial year
   */
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
/**
 * Check the price after discount for year sheets
 * @param {Array<string>} targetSheetsName - Array of sheet names to check, or null to use default
 * @return {Array<boolean>} Array of boolean results - true if OK, false otherwise
 */
function checkDiscountByYearSheet_(targetSheetsName = null){
  const testValues = new SetTestValues();
  const targetSheets = targetSheetsName || testValues.getTrialYearsItemsName();
  
  if (!Array.isArray(targetSheets)) {
    throw new Error('Target sheets must be an array');
  }
  
  const results = targetSheets.map((sheetName, idx) => {
    try {
      const discountRate = testValues.getDiscountRateValue(idx);
      return checkAmountByYearSheet_(sheetName, discountRate);
    } catch (error) {
      console.error(`Error checking sheet ${sheetName} at index ${idx}: ${error.message}`);
      return false;
    }
  });
  
  if (!results.every(result => result)){
    console.log(`checkDiscountByYearSheet NG\nSheets: ${targetSheets}\nResults: ${results}`);
  }
  
  return results;
}
/**
 * Check if all values in the array are true, log message if not
 * @param {Array<boolean>} target - Array of boolean values to check
 * @param {string} message - Message to output if not all values are true
 * @return {boolean} True if all values are true, false otherwise
 */
function isAllTrue_(target, message){
  if (!Array.isArray(target)) {
    throw new Error('Target must be an array');
  }
  
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }
  
  const allTrue = target.every(value => value === true);
  if (!allTrue){
    console.log(message);
  }
  return allTrue;
}
/**
 * Check that the total and the discounted total on each sheet from Setup to Closing are output correctly
 * @param {string} sheetName - The sheet name to check
 * @param {number} discountRate - Discount rate for Trial sheets
 * @return {boolean} True if amounts are correct, false otherwise
 */
function checkAmountByYearSheet_(sheetName, discountRate){
  if (!sheetName || typeof sheetName !== 'string') {
    throw new Error('Sheet name must be a non-empty string');
  }
  
  if (typeof discountRate !== 'number') {
    throw new Error('Discount rate must be a number');
  }
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheet = spreadsheet.getSheetByName(sheetName);
  if (!targetSheet) {
    throw new Error(`Sheet '${sheetName}' not found`);
  }
  
  const rowColHelper = new GetTargetRowCol();
  
  let sumRow, sumCol, sumValue, discountValue;
  try {
    sumRow = rowColHelper.getTargetRow(targetSheet, 2, '合計');
    sumCol = rowColHelper.getTargetCol(targetSheet, 4, '金額');
    sumValue = targetSheet.getRange(sumRow, sumCol).getValue();
    discountValue = targetSheet.getRange(sumRow + 1, sumCol).getValue();
  } catch (error) {
    throw new Error(`Failed to get values from sheet '${sheetName}': ${error.message}`);
  }
  
  const expectedDiscountValue = Math.trunc(sumValue * (1 - discountRate));
  const actualDiscountValue = Math.trunc(discountValue);
  
  const hasValidSetup = spreadsheet.getSheetByName(sheetName).getRange('B2').getValue() !== '';
  const discountCheck = (discountRate >= 0 || !hasValidSetup) ? 
    expectedDiscountValue === actualDiscountValue : 
    discountValue === '';
    
  return discountCheck;
}
/**
 * Check that totals and discounted totals are consistent across Quote, Total, Total2, and Total3 sheets
 * @return {Array<boolean>} Array with [amountCheck, discountCheck] - true if consistent, false otherwise
 */
function checkQuoteSum_(){
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const rowColHelper = new GetTargetRowCol();
  
  const sheetNames = ['Quote', 'Total', 'Total2', 'Total3'];
  const sheets = {};
  
  // Validate all required sheets exist
  for (const sheetName of sheetNames) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Required sheet '${sheetName}' not found`);
    }
    sheets[sheetName] = sheet;
  }
  
  let totalRows, totalCols;
  try {
    // Get row positions for totals
    totalRows = {
      quote: rowColHelper.getTargetRow(sheets.Quote, 3, '小計'),
      total: rowColHelper.getTargetRow(sheets.Total, 2, '合計'),
      total2: rowColHelper.getTargetRow(sheets.Total2, 2, '合計'),
      total3: rowColHelper.getTargetRow(sheets.Total3, 2, '合計')
    };
    
    // Get column positions for amounts
    totalCols = {
      quote: rowColHelper.getTargetCol(sheets.Quote, 11, '金額'),
      total: rowColHelper.getTargetCol(sheets.Total, 4, '金額'),
      total2: rowColHelper.getTargetCol(sheets.Total2, 4, '合計'),
      total3: rowColHelper.getTargetCol(sheets.Total3, 3, '合計')
    };
  } catch (error) {
    throw new Error(`Failed to locate total rows/columns: ${error.message}`);
  }
  
  // Get amount values and normalize empty cells to 0
  const amountValues = [
    sheets.Quote.getRange(totalRows.quote, totalCols.quote).getValue(),
    sheets.Total.getRange(totalRows.total, totalCols.total).getValue(),
    sheets.Total2.getRange(totalRows.total2, totalCols.total2).getValue(),
    sheets.Total3.getRange(totalRows.total3, totalCols.total3).getValue()
  ].map(value => value === '' ? 0 : Math.round(value));
  
  // Get discount values and normalize empty cells to 0
  const discountValues = [
    sheets.Quote.getRange(totalRows.quote + 2, totalCols.quote).getValue(),
    sheets.Total.getRange(totalRows.total + 1, totalCols.total).getValue(),
    sheets.Total2.getRange(totalRows.total2 + 1, totalCols.total2).getValue(),
    sheets.Total3.getRange(totalRows.total3 + 1, totalCols.total3).getValue()
  ].map(value => value === '' ? 0 : Math.round(value));
  
  // Check if all amounts are equal to the first amount
  const amountCheck = amountValues.every(value => value === amountValues[0]);
  
  // Check if all discount values are equal to the first discount value
  const discountCheck = discountValues.every(value => value === discountValues[0]);
  
  return [amountCheck, discountCheck];
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
 * Utility class to get column and row numbers by searching for target strings
 */
class GetTargetRowCol{
  /**
   * Get the row index (0-based) for a target string in a specific column
   * @param {Sheet} targetSheet - The sheet to search in
   * @param {number} targetColIndex - The column index (0-based) to search in
   * @param {string} targetStr - The string to search for
   * @return {number} The row index (0-based) where the string was found
   */
  getTargetRowIndex(targetSheet, targetColIndex, targetStr){
    if (!targetSheet) {
      throw new Error('Target sheet is required');
    }
    
    if (typeof targetColIndex !== 'number' || targetColIndex < 0) {
      throw new Error('Target column index must be a non-negative number');
    }
    
    if (!targetStr) {
      throw new Error('Target string is required');
    }
    
    const sheetValues = targetSheet.getDataRange().getValues();
    const matchingRowIndices = sheetValues
      .map((row, rowIndex) => row[targetColIndex] === targetStr ? rowIndex : null)
      .filter(index => index !== null);
    
    if (matchingRowIndices.length === 0) {
      throw new Error(`Target string '${targetStr}' not found in column ${targetColIndex + 1}`);
    }
    
    return matchingRowIndices[0];
  }
  
  /**
   * Get the row number (1-based) for a target string in a specific column
   * @param {Sheet} targetSheet - The sheet to search in
   * @param {number} targetColNumber - The column number (1-based) to search in
   * @param {string} targetStr - The string to search for
   * @return {number} The row number (1-based) where the string was found
   */
  getTargetRow(targetSheet, targetColNumber, targetStr){
    const rowIndex = this.getTargetRowIndex(targetSheet, targetColNumber - 1, targetStr);
    return rowIndex + 1;
  }
  
  /**
   * Get the column index (0-based) for a target string in a specific row
   * @param {Sheet} targetSheet - The sheet to search in
   * @param {number} targetRowIndex - The row index (0-based) to search in
   * @param {string} targetStr - The string to search for
   * @return {number} The column index (0-based) where the string was found
   */
  getTargetColIndex(targetSheet, targetRowIndex, targetStr){
    if (!targetSheet) {
      throw new Error('Target sheet is required');
    }
    
    if (typeof targetRowIndex !== 'number' || targetRowIndex < 0) {
      throw new Error('Target row index must be a non-negative number');
    }
    
    if (!targetStr) {
      throw new Error('Target string is required');
    }
    
    const sheetValues = targetSheet.getDataRange().getValues();
    if (targetRowIndex >= sheetValues.length) {
      throw new Error(`Row index ${targetRowIndex} is out of range`);
    }
    
    const targetColIndex = sheetValues[targetRowIndex].indexOf(targetStr);
    if (targetColIndex === -1) {
      throw new Error(`Target string '${targetStr}' not found in row ${targetRowIndex + 1}`);
    }
    
    return targetColIndex;
  }
  
  /**
   * Get the column number (1-based) for a target string in a specific row
   * @param {Sheet} targetSheet - The sheet to search in
   * @param {number} targetRowNumber - The row number (1-based) to search in
   * @param {string} targetStr - The string to search for
   * @return {number} The column number (1-based) where the string was found
   */
  getTargetCol(targetSheet, targetRowNumber, targetStr){
    const colIndex = this.getTargetColIndex(targetSheet, targetRowNumber - 1, targetStr);
    return colIndex + 1;
  }
}
