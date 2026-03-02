let _cachedSheets = null;

/**
 * シートを連想配列に格納する（キャッシュあり）
 * @return シートの連想配列
 */
function get_sheets() {
  resetSheetCache_();

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = {
    trial: ss.getSheetByName(QUOTATION_SHEET_NAMES.TRIAL),
    quotation_request: ss.getSheetByName(
      QUOTATION_SHEET_NAMES.QUOTATION_REQUEST,
    ),
    total: ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL),
    total2: ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2),
    total3: ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL3),
    setup: ss.getSheetByName(QUOTATION_SHEET_NAMES.SETUP),
    registration_1: ss.getSheetByName(QUOTATION_SHEET_NAMES.REGISTRATION_1),
    registration_2: ss.getSheetByName(QUOTATION_SHEET_NAMES.REGISTRATION_2),
    interim_1: ss.getSheetByName(QUOTATION_SHEET_NAMES.INTERIM_1),
    observation_1: ss.getSheetByName(QUOTATION_SHEET_NAMES.OBSERVATION_1),
    interim_2: ss.getSheetByName(QUOTATION_SHEET_NAMES.INTERIM_2),
    observation_2: ss.getSheetByName(QUOTATION_SHEET_NAMES.OBSERVATION_2),
    closing: ss.getSheetByName(QUOTATION_SHEET_NAMES.CLOSING),
    items: ss.getSheetByName(QUOTATION_SHEET_NAMES.ITEMS),
    quote: ss.getSheetByName(QUOTATION_SHEET_NAMES.QUOTE),
    check: ss.getSheetByName(VALIDATION_CHECK_SHEET_NAME),
  };

  if (ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_NMC)) {
    sheet.total_nmc = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_NMC);
    sheet.total2_nmc = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2_NMC);
    sheet.total_oscr = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_OSCR);
    sheet.total2_oscr = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2_OSCR);
  }

  _cachedSheets = sheet;
  return sheet;
}
function resetSheetCache_() {
  _cachedSheets = null;
}
/**
 * Setup〜Closingのシートを配列に格納する
 * @return シートの配列
 */
function get_target_term_sheets() {
  const array_target_sheet = [
    _cachedSheets.setup,
    _cachedSheets.closing,
    _cachedSheets.observation_2,
    _cachedSheets.registration_2,
    _cachedSheets.registration_1,
    _cachedSheets.interim_1,
    _cachedSheets.observation_1,
    _cachedSheets.interim_2,
  ];
  return array_target_sheet;
}
