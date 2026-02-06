/**
 * TOTAL_AND_PHASE_SHEET の COUNT 列に対応する列文字を取得する
 *
 * @return {string} 列文字（例: "A", "B", "C"）
 */
function initTargetColumn_() {
  const const_count_col = TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT;
  return getColumnString_(const_count_col);
}
/**
 * 事務局業務ありなしフラグを判定する
 *
 * 以下のいずれかを満たす場合に true を返す：
 * - 試験種別が「医師主導治験」である
 * - 原資が企業である
 * - 調整事務局の有無が「あり」である
 *
 * @param {Array} array_quotation_request
 *   Quotation Request シートの1〜2行目の値配列
 * @return {boolean}
 *   事務局業務ありなしフラグ（true: 対象, false: 非対象）
 */
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
 * 試験期間情報の配列から、指定したシート名の情報を取得する（pure）
 *
 * @param {Array<Array>} values
 *   試験期間シートの値配列
 * @param {string} sheetname
 *   対象となるシート名
 * @return {{
 *   trial_target_terms: any,
 *   trial_term_values: Array|undefined
 * }}
 */
function buildTrialTermResult_(values, sheetname) {
  const trial_term_values = values.filter(
    (row) => row[TRIAL_SHEET.COLIDX.SHEET_NAME] === sheetname,
  )[0];

  return {
    trial_target_terms: trial_term_values
      ? trial_term_values[TRIAL_SHEET.COLIDX.TRIAL_MONTHS]
      : undefined,
    trial_term_values,
  };
}
/**
 * 試験期間シートから試験期間情報の配列を取得する
 *
 * @return {Array<Array>}
 */
function getTrialTermSheetValues_() {
  const trial_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    TRIAL_SHEET.NAME,
  );

  const startRow = TRIAL_SHEET.ROWS.TRIAL_SETUP;
  const endRow = TRIAL_SHEET.ROWS.TRIAL_CLOSING;

  return trial_sheet
    .getRange(
      startRow,
      1,
      endRow - startRow + 1,
      trial_sheet.getDataRange().getLastColumn(),
    )
    .getValues();
}
/**
 * 試験期間に関する情報を取得する
 *
 * @param {string} sheetname
 * @return {{
 *   trial_target_terms: any,
 *   trial_term_values: Array
 * }}
 */
function getTrialTerm_(sheetname) {
  const values = getTrialTermSheetValues_();

  return buildTrialTermResult_(values, sheetname);
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
/*function initSetSheetItemTrialDates_(trial_term_values) {
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
*/
/**
 * 試験日付に関するプロパティ値を取得する
 *
 * @return {{
 *   trial_start_date: string|null,
 *   trial_end_date: string|null
 * }}
 */
function getTrialDateProperties_() {
  const properties = PropertiesService.getScriptProperties();

  return {
    trial_start_date: properties.getProperty("trial_start_date"),
    trial_end_date: properties.getProperty("trial_end_date"),
  };
}
/**
 * 試験日付情報を生成する（pure / Moment依存あり）
 *
 * @param {Array|undefined} trial_term_values
 *   試験期間シートの該当行
 * @param {{
 *   trial_start_date: string|null,
 *   trial_end_date: string|null
 * }} props
 *   試験日付に関するプロパティ値
 * @return {{
 *   trial_target_start_date: Moment.Moment,
 *   trial_target_end_date: Moment.Moment,
 *   trial_start_date: Moment.Moment,
 *   trial_end_date: Moment.Moment
 * }}
 */
function buildTrialDates_(trial_term_values, props) {
  const trial_target_start_date = Moment.moment(
    trial_term_values
      ? trial_term_values[TRIAL_SHEET.COLIDX.TRIAL_START]
      : undefined,
  );

  const trial_target_end_date = Moment.moment(
    trial_term_values
      ? trial_term_values[TRIAL_SHEET.COLIDX.TRIAL_END]
      : undefined,
  );

  const trial_start_date = Moment.moment(props.trial_start_date);
  const trial_end_date = Moment.moment(props.trial_end_date);

  return {
    trial_target_start_date,
    trial_target_end_date,
    trial_start_date,
    trial_end_date,
  };
}
/**
 * 試験日付に関する情報を初期化する
 *
 * @param {Array|undefined} trial_term_values
 * @return {{
 *   trial_target_start_date: Moment.Moment,
 *   trial_target_end_date: Moment.Moment,
 *   trial_start_date: Moment.Moment,
 *   trial_end_date: Moment.Moment
 * }}
 */
function initSetSheetItemTrialDates_(trial_term_values) {
  const props = getTrialDateProperties_();
  return buildTrialDates_(trial_term_values, props);
}
