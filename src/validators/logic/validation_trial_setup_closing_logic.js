/**
 * 検証に使用するセットアップ期間・クローズ期間（月数）を算出する。
 *
 * ルール:
 * - 通常: setup=3ヶ月 / closing=3ヶ月
 * - 医師主導治験または特定臨床研究: setup=6ヶ月 / closing=6ヶ月
 * - 上記以外で研究結果報告書作成支援あり: closingに+3ヶ月
 *
 * @param {Object} quotationRequestValidationContext
 * @param {string} quotationRequestValidationContext.trialType 試験種別
 * @param {string} quotationRequestValidationContext.reportSupport 研究結果報告書作成支援有無（COMMON_EXISTENCE_LABELS）
 *
 * @returns {{
 *   setup_month: number,
 *   closing_month: number,
 *   setup_closing_months: number
 * }} セットアップ・クローズ月数および合計月数
 */
function validationCalculateSetupAndClosingMonths(
  quotationRequestValidationContext,
) {
  const trialType = quotationRequestValidationContext.trialType;
  const hasReportSupport =
    quotationRequestValidationContext.reportSupport ===
    COMMON_EXISTENCE_LABELS.YES;

  const DEFAULT_MONTH = 3;
  const INVESTIGATOR_MONTH = 6;
  const REPORT_SUPPORT_EXTRA_MONTH = 3;

  let setupMonth = DEFAULT_MONTH;
  let closingMonth = DEFAULT_MONTH;

  const isInvestigatorTrial =
    trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
    trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL;

  if (isInvestigatorTrial) {
    setupMonth = INVESTIGATOR_MONTH;
    closingMonth = INVESTIGATOR_MONTH;
  } else if (hasReportSupport) {
    closingMonth += REPORT_SUPPORT_EXTRA_MONTH;
  }

  return {
    setup_month: setupMonth,
    closing_month: closingMonth,
    setup_closing_months: setupMonth + closingMonth,
  };
}
