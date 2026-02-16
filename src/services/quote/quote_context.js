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
function isClinicalTrialsOfficeRequired_(array_quotation_request) {
  const scriptProperties = PropertiesService.getScriptProperties();

  const isInvestigatorInitiated =
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE) ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;

  const isCommercialFunding =
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.COEFFICIENT,
    ) === QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;

  const hasAdjustmentOffice =
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.ADJUSTMENT_OFFICE_EXISTENCE,
    ) === COMMON_EXISTENCE_LABELS.YES;

  const isRequired =
    isInvestigatorInitiated || isCommercialFunding || hasAdjustmentOffice;

  return isRequired;
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
    trial_start_date: properties.getProperty(
      SCRIPT_PROPERTY_KEYS.TRIAL_START_DATE,
    ),
    trial_end_date: properties.getProperty(SCRIPT_PROPERTY_KEYS.TRIAL_END_DATE),
  };
}

/**
 * 試験日付情報を生成する（pure / Moment非依存）
 *
 * @param {Array|undefined} trial_term_values
 * @param {{
 *   trial_start_date: string|null,
 *   trial_end_date: string|null
 * }} props
 * @return {{
 *   trial_target_start_date: Date|null,
 *   trial_target_end_date: Date|null,
 *   trial_start_date: Date|null,
 *   trial_end_date: Date|null
 * }}
 */
function buildTrialDatesPure_(trial_term_values, props) {
  return {
    trial_target_start_date: toDate_(
      trial_term_values
        ? trial_term_values[TRIAL_SHEET.COLIDX.TRIAL_START]
        : undefined,
    ),
    trial_target_end_date: toDate_(
      trial_term_values
        ? trial_term_values[TRIAL_SHEET.COLIDX.TRIAL_END]
        : undefined,
    ),
    trial_start_date: toDate_(props.trial_start_date),
    trial_end_date: toDate_(props.trial_end_date),
  };
}
/**
 * 試験日付に関する情報を初期化する
 *
 * @param {Array|undefined} trial_term_values
 * @return {{
 *   trial_target_start_date: Moment.Moment|null,
 *   trial_target_end_date: Moment.Moment|null,
 *   trial_start_date: Moment.Moment|null,
 *   trial_end_date: Moment.Moment|null
 * }}
 */
function initSetSheetItemTrialDates_(trial_term_values) {
  const props = getTrialDateProperties_();

  // pure な Date 生成
  const dates = buildTrialDatesPure_(trial_term_values, props);

  // Moment への変換はここだけ
  return {
    trial_target_start_date: toMoment_(dates.trial_target_start_date),
    trial_target_end_date: toMoment_(dates.trial_target_end_date),
    trial_start_date: toMoment_(dates.trial_start_date),
    trial_end_date: toMoment_(dates.trial_end_date),
  };
}
/**
 * シート処理用のコンテキストを生成する
 * （SetSheetItemValues の constructor 相当）
 */
function buildSheetContext_(sheetname, array_quotation_request) {
  const trialTerm = getTrialTerm_(sheetname);
  const trialDates = initSetSheetItemTrialDates_(trialTerm.trial_term_values);

  return {
    sheetname,
    array_quotation_request,

    trial_target_terms: trialTerm.trial_target_terms,
    trial_term_values: trialTerm.trial_term_values,

    trial_target_start_date: trialDates.trial_target_start_date,
    trial_target_end_date: trialDates.trial_target_end_date,
    trial_start_date: trialDates.trial_start_date,
    trial_end_date: trialDates.trial_end_date,

    target_col: initTargetColumn_(),

    clinical_trials_office_flg: isClinicalTrialsOfficeRequired_(
      array_quotation_request,
    ),
  };
}
