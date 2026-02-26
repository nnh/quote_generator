/**
 * 試験条件・件数判定ロジック
 * - get_count
 * - get_count_more_than
 */

/**
 * 試験種別が特別な試験（医師主導治験・特定臨床研究）かどうか判定する
 */
function isSpecialTrial_(trialType) {
  return (
    trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
    trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL
  );
}

/**
 * 研究結果報告書作成支援が「あり」かどうか判定する
 */
function hasReportSupport_(array_quotation_request) {
  return (
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT,
    ) === COMMON_EXISTENCE_LABELS.YES
  );
}
/**
 * 試験条件から Setup / Closing 期間（月数）を決定する
 *
 * @param {boolean} isSpecialTrial 特別な試験かどうか
 * @param {boolean} hasReportSupport 研究結果報告書作成支援があるか
 * @return {{setupTerm: number, closingTerm: number}}
 */
function decideSetupClosingTerm_(isSpecialTrial, hasReportSupport) {
  let setupTerm = 3;
  let closingTerm = 3;

  if (isSpecialTrial) {
    setupTerm = 6;
    closingTerm = 6;
  }

  if (hasReportSupport) {
    closingTerm = 6;
  }

  return {
    setupTerm,
    closingTerm,
  };
}
/**
 * Setup / Closing 期間（月数）を Script Properties に保存する
 *
 * @param {number} setupTerm Setup期間（月数）
 * @param {number} closingTerm Closing期間（月数）
 */
function saveSetupClosingTerm_(setupTerm, closingTerm) {
  const sp = PropertiesService.getScriptProperties();
  sp.setProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM, String(setupTerm));
  sp.setProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM, String(closingTerm));
}

/**
 * 試験種別からSetup、Closing期間の判定を行いスクリプトプロパティに格納する
 * @param {string} trialType 試験種別
 * @param {Array.<string>} quotationRequest quotation_requestシートの1〜2行目の値
 * @return {void}
 * @example
 *   applySetupClosingTerm_(trialType, quotationRequest);
 */
function applySetupClosingTerm_(trialType, quotationRequest) {
  const { setupTerm, closingTerm } = calculateSetupClosingTerm_(
    trialType,
    quotationRequest,
  );

  saveSetupClosingTerm_(setupTerm, closingTerm);
}

/**
 * 値が一致する場合に指定値を返す
 */
function returnIfEquals_(actual, expected, valueIfTrue) {
  return actual === expected ? valueIfTrue : "";
}

/**
 * 値が指定値より大きい場合に指定値を返す
 */
function returnIfGreaterThan_(actual, threshold, valueIfTrue) {
  return actual > threshold ? valueIfTrue : "";
}
