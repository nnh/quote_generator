/**
 * Output the values retrieved from the "Quotation Request" spreadsheet to the "Quotation Request" sheet.
 * @param {number=} If specified in the argument, outputs the value at the specified index. Otherwise, all values are output.
 * @return none.
 */
function setQuotationRequestValuesForTest(target_idx = -1) {
  const requestValues = getQuotationRequestValues_();
  const sheetQuotationRequest =
    _cachedSheets[normalizeSheetName_(QUOTATION_REQUEST_SHEET.NAME)];
  sheetQuotationRequest.clearContents();
  const target =
    target_idx > -1
      ? requestValues.filter((x, idx) => idx === target_idx || idx === 0)
      : requestValues;
  sheetQuotationRequest
    .getRange(1, 1, target.length, target[0].length)
    .setValues(target);
}

/**
 * Get the value from "Quotation Request".
 * @param none.
 * @return {string} <array> The value of "Quotation Request".
 */
function getQuotationRequestValues_() {
  const ss = getSpreadsheet_();
  const url = ss.getSheetByName("wk_property").getRange("B2").getValue();
  const sheetname = ss.getSheetByName("wk_property").getRange("B3").getValue();
  const requestValues = SpreadsheetApp.openByUrl(url)
    .getSheetByName(sheetname)
    .getDataRange()
    .getValues();
  // Output only those records for which "Existence of Coordination Office" has been entered.
  return requestValues.filter((x, idx) => idx > 25 || idx === 0);
}
