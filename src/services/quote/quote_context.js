/**
 * SetSheetItemValues の初期化処理をまとめた関数
 * @param {SetSheetItemValues} ctx
 */
function initTargetColumn_() {
  const const_count_col = TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT;
  return getColumnString_(const_count_col);
}
function initClinicalTrialsOfficeFlg_(array_quotation_request) {
  const get_s_p = PropertiesService.getScriptProperties();

  return (
    get_s_p.getProperty("trial_type_value") ===
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.COEFFICIENT,
    ) === QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL ||
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.ADJUSTMENT_OFFICE_EXISTENCE,
    ) === COMMON_EXISTENCE_LABELS.YES
  );
}
/**
 * 試験期間に関する情報を取得する
 * @param {string} sheetname
 * @return {{
 *   trial_target_terms: any,
 *   trial_term_values: Array
 * }}
 */
function getTrialTerm_(sheetname) {
  const months_col = 5;
  const sheetname_col = 0;

  const trial_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    TRIAL_SHEET.NAME,
  );

  const const_trial_setup_row = TRIAL_SHEET.ROWS.TRIAL_SETUP;
  const const_trial_closing_row = TRIAL_SHEET.ROWS.TRIAL_CLOSING;

  const trial_term_values = trial_sheet
    .getRange(
      const_trial_setup_row,
      1,
      const_trial_closing_row - const_trial_setup_row + 1,
      trial_sheet.getDataRange().getLastColumn(),
    )
    .getValues()
    .filter((x) => x[sheetname_col] === sheetname)[0];

  return {
    trial_target_terms: trial_term_values
      ? trial_term_values[months_col]
      : undefined,
    trial_term_values,
  };
}
/**
 * 試験日付に関する情報を初期化する
 * Moment 依存あり
 * @param {Array|undefined} trial_term_values
 * @return {{
 *   trial_target_start_date: Moment.Moment,
 *   trial_target_end_date: Moment.Moment,
 *   trial_start_date: Moment.Moment,
 *   trial_end_date: Moment.Moment
 * }}
 */
function initSetSheetItemTrialDates_(trial_term_values) {
  const get_s_p = PropertiesService.getScriptProperties();

  const trial_target_start_date = Moment.moment(
    trial_term_values
      ? trial_term_values[TRIAL_SHEET.COLUMNS.TRIAL_START - 1]
      : undefined,
  );

  const trial_target_end_date = Moment.moment(
    trial_term_values
      ? trial_term_values[TRIAL_SHEET.COLUMNS.TRIAL_END - 1]
      : undefined,
  );

  const trial_start_date = Moment.moment(
    get_s_p.getProperty("trial_start_date"),
  );

  const trial_end_date = Moment.moment(get_s_p.getProperty("trial_end_date"));

  return {
    trial_target_start_date,
    trial_target_end_date,
    trial_start_date,
    trial_end_date,
  };
}
