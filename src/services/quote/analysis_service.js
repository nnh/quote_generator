/**
 * アクティブシートに中間解析の項目を設定する。
 */
function setInterimAnalysis_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheetName = ss.getActiveSheet().getName();

  const targetTermSheetNames = get_target_term_sheets().map((sheet) =>
    sheet.getName(),
  );

  if (!targetTermSheetNames.includes(targetSheetName)) {
    return;
  }

  const sheet = get_sheets();
  const quotation_request_last_col = sheet.quotation_request
    .getDataRange()
    .getLastColumn();

  const arrayQuotationRequest = sheet.quotation_request
    .getRange(1, 1, 2, quotation_request_last_col)
    .getValues();

  const sheetItemSetter = new SetSheetItemValues(
    targetSheetName,
    arrayQuotationRequest,
  );
  sheetItemSetter.setInterimAnalysis();
}
