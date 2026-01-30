/**
 * 試験条件・件数判定ロジック
 * - get_setup_closing_term_
 * - get_count
 * - get_count_more_than
 */

/**
 * 試験種別が特別な試験（医師主導治験・特定臨床研究）かどうか判定する
 */
function isSpecialTrial_(trialType) {
  return (
    trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
    trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL_TRIAL
  );
}

/**
 * 研究結果報告書作成支援が「あり」かどうか判定する
 */
function hasReportSupport_(array_quotation_request) {
  return (
    get_quotation_request_value_(
      array_quotation_request,
      "研究結果報告書作成支援",
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
  sp.setProperty("setup_term", String(setupTerm));
  sp.setProperty("closing_term", String(closingTerm));
}

/**
 * 試験種別からSetup、Closing期間の判定を行いスクリプトプロパティに格納する
 * @param {string} temp_str 試験種別
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @return {void}
 * @example
 *   get_setup_closing_term_(temp_str, array_quotation_request);
 */
function get_setup_closing_term_(temp_str, array_quotation_request) {
  const isSpecialTrial = isSpecialTrial_(temp_str);
  const hasReportSupport = hasReportSupport_(array_quotation_request);

  const { setupTerm, closingTerm } = decideSetupClosingTerm_(
    isSpecialTrial,
    hasReportSupport,
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
