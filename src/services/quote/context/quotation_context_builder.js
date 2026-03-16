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
 * @return {boolean}
 *   事務局業務ありなしフラグ（true: 対象, false: 非対象）
 */
function isClinicalTrialsOfficeRequired_() {
  const scriptProperties = PropertiesService.getScriptProperties();

  const isInvestigatorInitiated =
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE) ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;

  const isCommercialFunding =
    get_quotation_request_value_(
      QUOTATION_REQUEST_SHEET.ITEMNAMES.COEFFICIENT,
    ) === QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;

  const hasAdjustmentOffice =
    get_quotation_request_value_(
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
 *   trialTargetTerms: any,
 *   trial_term_values: Array|undefined
 * }}
 */
function buildTrialTermResult_(values, sheetname) {
  const trial_term_values = values.filter(
    (row) => row[TRIAL_SHEET.COLIDX.SHEET_NAME] === sheetname,
  )[0];

  return {
    trialTargetTerms: trial_term_values
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
  const trial_sheet = getSheetByNameCached_(TRIAL_SHEET.NAME);

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
 *   trialTargetTerms: any,
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
 *   trialStartDate: string|null,
 *   trialEndDate: string|null
 * }}
 */
function getTrialDateProperties_() {
  const properties = PropertiesService.getScriptProperties();

  return {
    trialStartDate: properties.getProperty(
      SCRIPT_PROPERTY_KEYS.TRIAL_START_DATE,
    ),
    trialEndDate: properties.getProperty(SCRIPT_PROPERTY_KEYS.TRIAL_END_DATE),
  };
}

/**
 * 試験日付情報を生成する
 *
 * @param {Array|undefined} trial_term_values
 * @param {{
 *   trialStartDate: string|null,
 *   trialEndDate: string|null
 * }} props
 * @return {{
 *   trialTargetStartDate: Date|null,
 *   trialTargetEndDate: Date|null,
 *   trialStartDate: Date|null,
 *   trialEndDate: Date|null
 * }}
 */
function buildTrialDatesPure_(trial_term_values, props) {
  return {
    trialTargetStartDate: toDate_(
      trial_term_values
        ? trial_term_values[TRIAL_SHEET.COLIDX.TRIAL_START]
        : undefined,
    ),
    trialTargetEndDate: toDate_(
      trial_term_values
        ? trial_term_values[TRIAL_SHEET.COLIDX.TRIAL_END]
        : undefined,
    ),
    trialStartDate: toDate_(props.trialStartDate),
    trialEndDate: toDate_(props.trialEndDate),
  };
}
/**
 * 試験日付に関する情報を初期化する
 *
 * trial_term_values と設定値をもとに、
 * 試験対象期間および試験全体期間の開始日・終了日を
 * Date オブジェクトとして生成する。
 *
 * @param {Array|undefined} trial_term_values
 * @return {{
 *   trialTargetStartDate: Date|null,
 *   trialTargetEndDate: Date|null,
 *   trialStartDate: Date|null,
 *   trialEndDate: Date|null
 * }}
 */
function initSetSheetItemTrialDates_(trial_term_values) {
  const props = getTrialDateProperties_();
  const dates = buildTrialDatesPure_(trial_term_values, props);
  return dates;
}

/**
 * シート処理用のコンテキストを生成する
 * @param {string} sheetName
 * @return {Object}
 */
function buildSheetContext_(sheetName) {
  const trialTerm = getTrialTerm_(sheetName);
  const trialDates = initSetSheetItemTrialDates_(trialTerm.trialTermValues);

  return {
    sheetName,

    trialTargetTerms: trialTerm.trialTargetTerms,
    trialTermValues: trialTerm.trialTermValues,

    trialTargetStartDate: trialDates.trialTargetStartDate,
    trialTargetEndDate: trialDates.trialTargetEndDate,
    trialStartDate: trialDates.trialStartDate,
    trialEndDate: trialDates.trialEndDate,

    columnName: initTargetColumn_(),

    clinicalTrialsOfficeFlg: isClinicalTrialsOfficeRequired_(),
  };
}
