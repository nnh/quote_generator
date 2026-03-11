function setQuotationRequestValuesForTest(values) {
  const sheetQuotationRequest =
    _cachedSheets[normalizeSheetName_(QUOTATION_REQUEST_SHEET.NAME)];
  sheetQuotationRequest.clearContents();
  sheetQuotationRequest
    .getRange(1, 1, values.length, values[0].length)
    .setValues(values);
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
